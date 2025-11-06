"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/ui-thread/thread";
import { GetStocksUI } from "@/components/tool-uis/get-stocks-ui";

/**
 * Demo Chat Component
 *
 * Provides a single-threaded chat interface with:
 * - OpenAI GPT-4o integration
 * - get_stocks tool for fetching stock data
 * - DataTable visualization of results
 * - Rate limiting (10 requests per 10 minutes)
 */
export function DemoChat() {
  // Create chat runtime with API endpoint
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <GetStocksUI />
    </AssistantRuntimeProvider>
  );
}
