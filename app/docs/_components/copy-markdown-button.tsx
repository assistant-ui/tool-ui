"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Button } from "@/components/ui/button";
import { Check, Copy as CopyIcon } from "lucide-react";
import * as React from "react";

const MARKDOWN_SNIPPET = `# Tool UI — Quick Start (Assistant‑UI + Vercel AI SDK)

## Server: API route (Vercel AI SDK)

\`\`\`ts title="app/api/chat/route.ts"
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const tools = {
    get_products: {
      description: "List products and prices",
      inputSchema: z.object({ query: z.string().optional() }),
      execute: async ({ query }) => {
        const products = await fetchProducts(query);
        return {
          rowIdKey: "id",
          columns: [
            { key: "name", label: "Product" },
            { key: "price", label: "Price", align: "right", format: { kind: "currency", currency: "USD" } },
          ],
          data: products.map((p) => ({ id: p.id, name: p.name, price: p.price })),
          count: products.length,
        } as const;
      },
    },
  } as const;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
    tools,
  });
  return result.toUIMessageStreamResponse();
}
\`\`\`

## Assistant‑UI client: render Tool UI inside provider

\`\`\`tsx
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { ProductsUI } from "@/components/tools/products-ui";

export default function Chat() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({ api: "/api/chat" }),
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <ProductsUI />
    </AssistantRuntimeProvider>
  );
}
\`\`\`

## Vercel AI SDK client: typed tool parts

\`\`\`tsx
"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { DataTable } from "@/components/data-table";
import { useState } from "react";

export function Chat() {
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
  const [input, setInput] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (input.trim()) {
          sendMessage({ text: input });
          setInput("");
        }
      }}
    >
      <ul>
        {messages.map((m) => (
          <li key={m.id}>
            {m.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <span key={i}>{part.text}</span>;
                case "tool-get_products": {
                  const id = part.toolCallId;
                  switch (part.state) {
                    case "input-available":
                      return <div key={id}>Loading products…</div>;
                    case "output-available":
                      return (
                        <DataTable
                          key={id}
                          rowIdKey={part.output.rowIdKey}
                          columns={part.output.columns}
                          data={part.output.data}
                        />
                      );
                    case "output-error":
                      return <div key={id}>Error: {part.errorText}</div>;
                  }
                }
              }
            })}
          </li>
        ))}
      </ul>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
    </form>
  );
}
\`\`\``;

export function CopyMarkdownButton() {
  const [checked, onClick] = useCopyButton(async () => {
    await navigator.clipboard.writeText(MARKDOWN_SNIPPET);
  });

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} aria-label="Copy page as Markdown" className="gap-2">
      {checked ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
      {checked ? "Copied" : "Copy as Markdown"}
    </Button>
  );
}

