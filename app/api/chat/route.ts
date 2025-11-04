import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStocks } from "@/lib/mock-data/stocks";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
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
        }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o"),
      messages: modelMessages,
      system: `You are a helpful assistant that can provide stock market data and visualize it using tables.

When asked about stocks or market data, use the get_stocks tool to retrieve information. The tool will display data in a responsive table that works on both desktop and mobile devices.

Be concise and helpful in your responses.`,
      tools: {
        get_stocks: {
          description:
            "Get stock market data for one or more companies. Returns current prices, changes, volume, and market cap information. Can filter by specific stock symbols and sort results.",
          inputSchema: z.object({
            query: z
              .string()
              .describe(
                "Natural language query about stocks. Examples: 'top tech stocks', 'AAPL price', 'MSFT GOOGL AMZN data'"
              ),
          }),
          execute: async ({ query }) => {
            const upperQuery = query.toUpperCase();
            const commonSymbols = [
              "AAPL",
              "MSFT",
              "GOOGL",
              "AMZN",
              "TSLA",
              "NVDA",
              "META",
              "BRK.B",
            ];
            const mentionedSymbols = commonSymbols.filter((symbol) =>
              upperQuery.includes(symbol)
            );

            const isTechQuery =
              upperQuery.includes("TECH") ||
              upperQuery.includes("TECHNOLOGY") ||
              upperQuery.includes("SOFTWARE");

            const stocks = await getStocks({
              symbols:
                mentionedSymbols.length > 0 ? mentionedSymbols : undefined,
              limit: isTechQuery ? 6 : undefined,
              sort: { by: "marketCap", direction: "desc" },
            });

            return {
              stocks,
              count: stocks.length,
            };
          },
        },
      },
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
