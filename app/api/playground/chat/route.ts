import type { NextRequest } from "next/server";

import type { UIMessage } from "ai";

import { findPrototype, streamPrototypeResponse } from "@/lib/playground";
import { PROTOTYPE_SLUG_HEADER } from "@/lib/playground/constants";

const isUiMessageArray = (value: unknown): value is UIMessage[] =>
  Array.isArray(value);

const extractSlug = (request: NextRequest): string | null => {
  const headerSlug = request.headers.get(PROTOTYPE_SLUG_HEADER)?.trim();
  if (headerSlug) {
    return headerSlug;
  }
  const url = new URL(request.url);
  const querySlug = url.searchParams.get("slug")?.trim();
  if (querySlug) {
    return querySlug;
  }
  return null;
};

export async function POST(request: NextRequest) {
  const slug = extractSlug(request);
  if (!slug) {
    return new Response(
      JSON.stringify({ error: "Missing prototype slug." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const prototype = findPrototype(slug);
  if (!prototype) {
    return new Response(
      JSON.stringify({ error: `Prototype "${slug}" not found.` }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const messages =
    typeof body === "object" && body !== null && "messages" in body
      ? (body as Record<string, unknown>).messages
      : undefined;

  if (!isUiMessageArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Request body must include a messages array." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Extract frontend tools from request body
  const clientTools: unknown =
    typeof body === "object" && body !== null && "tools" in body
      ? (body as Record<string, unknown>).tools
      : undefined;

  const result = streamPrototypeResponse(prototype, messages, clientTools);
  return result.toUIMessageStreamResponse();
}
