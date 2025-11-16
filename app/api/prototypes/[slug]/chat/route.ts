import type { NextRequest } from "next/server";

import type { UIMessage } from "ai";
import type { JSONSchema7 } from "json-schema";

import { streamInstanceResponse } from "@/lib/prototypes/engine";
import { resolveManifest } from "@/lib/prototypes/instances";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatRequestBody = {
  messages: UIMessage[];
  tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const manifest = await resolveManifest(slug);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          reset: rateLimit.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toString(),
          },
        },
      );
    }

    const body = (await request.json()) as ChatRequestBody;

    if (!Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = await streamInstanceResponse({
      manifest,
      messages: body.messages,
      clientTools: body.tools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unknown instance")
    ) {
      return new Response(
        JSON.stringify({ error: "Assistant instance not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.error("Error handling assistant chat request:", error);
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


