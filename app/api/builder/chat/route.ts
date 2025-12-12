import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { checkRateLimit } from "@/lib/integrations/rate-limit/upstash";
import { requestDevServer } from "@/lib/integrations/freestyle/create-chat";
import { SYSTEM_MESSAGE } from "@/lib/system/tool-builder-message";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "API key is not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          reset: rateLimitResult.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      );
    }

    const { messages } = await req.json();
    const repoId = req.headers.get("Repo-Id");

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const modelMessages = convertToModelMessages(messages);

    // Choose model based on what's available
    const model = process.env.ANTHROPIC_API_KEY
      ? anthropic("claude-sonnet-4-5-20250929")
      : openai("gpt-5-nano");

    // If we have a repoId and Freestyle is configured, use Freestyle tools
    let tools = {};
    if (repoId && process.env.FREESTYLE_API_KEY) {
      try {
        const { mcpEphemeralUrl } = await requestDevServer({ repoId });

        const devServerMcp = await createMCPClient({
          transport: new StreamableHTTPClientTransport(
            new URL(mcpEphemeralUrl),
          ),
        });

        tools = await devServerMcp.tools();
      } catch (error) {
        console.error("Error setting up Freestyle MCP:", error);
        // Continue without Freestyle tools if there's an error
      }
    }

    const result = streamText({
      model,
      messages: modelMessages,
      system: SYSTEM_MESSAGE,
      tools,
      stopWhen: stepCountIs(100),
      temperature: 0.7,
    });

    result.consumeStream();

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in builder chat API route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
