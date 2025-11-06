"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/ui-thread/thread";
import { GetStocksUI } from "@/components/tool-uis/get-stocks-ui";
import { RenderMediaCardUI } from "@/components/tool-uis/render-media-card-ui";
import { RenderSocialPostUI } from "@/components/tool-uis/render-social-post-ui";

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
    // Seeded mock conversation using parts (AI SDK v5 shape)
    messages: [
      {
        id: "user_1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Show me the top tech stocks in a table (AAPL, MSFT, GOOGL).",
          },
        ],
      },
      {
        id: "assistant_1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Got it — fetching the latest prices and changes for those symbols…",
          },
        ],
      },
      {
        id: "assistant_2",
        role: "assistant",
        parts: [
          // Tool UI: get_stocks → renders DataTable
          {
            type: "tool-get_stocks",
            toolCallId: "tc_get_stocks_1",
            state: "output-available",
            input: { query: "AAPL, MSFT, GOOGL" },
            output: {
              count: 3,
              stocks: [
                {
                  symbol: "AAPL",
                  name: "Apple Inc.",
                  price: 178.25,
                  change: 2.35,
                  changePercent: 1.34,
                  volume: 48532100,
                  marketCap: 2780000000000,
                  pe: 29.5,
                  eps: 6.05,
                },
                {
                  symbol: "MSFT",
                  name: "Microsoft Corporation",
                  price: 378.91,
                  change: -1.24,
                  changePercent: -0.33,
                  volume: 22451800,
                  marketCap: 2810000000000,
                  pe: 35.2,
                  eps: 10.76,
                },
                {
                  symbol: "GOOGL",
                  name: "Alphabet Inc.",
                  price: 139.67,
                  change: 0.89,
                  changePercent: 0.64,
                  volume: 19234500,
                  marketCap: 1750000000000,
                  pe: 26.8,
                  eps: 5.21,
                },
              ],
            },
          },
        ],
      },
      {
        id: "user_2",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Also give me a rich link preview for this article: https://assistant-ui.com/blog/tool-ui-patterns",
          },
        ],
      },
      {
        id: "assistant_3",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Here’s a link preview of that article.",
          },
        ],
      },
      {
        id: "assistant_4",
        role: "assistant",
        parts: [
          // Tool UI: render_media_card → renders MediaCard (link)
          {
            type: "tool-render_media_card",
            toolCallId: "tc_media_card_1",
            state: "output-available",
            input: { href: "https://assistant-ui.com/blog/tool-ui-patterns" },
            output: {
              card: {
                id: "media-card-link",
                kind: "link",
                href: "https://assistant-ui.com/blog/tool-ui-patterns",
                src: "https://assistant-ui.com/blog/tool-ui-patterns",
                title: "Designing tool-friendly media cards",
                description:
                  "How to structure robust previews for images, video, audio, and streaming tool output.",
                ratio: "16:9",
                domain: "assistant-ui.com",
                thumb:
                  "https://images.unsplash.com/photo-1504389273929-44baec1307d2?auto=format&fit=crop&q=80&w=1200",
                createdAtISO: "2025-02-05T09:45:00.000Z",
                source: {
                  label: "Docs generator",
                  iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=docs",
                  url: "https://assistant-ui.com",
                },
                og: {
                  imageUrl:
                    "https://images.unsplash.com/photo-1504389273929-44baec1307d2?auto=format&fit=crop&q=80&w=1200",
                  description: "Guidance for building resilient tool surfaces.",
                  title: "Designing tool-friendly media cards",
                },
              },
            },
          },
        ],
      },
      {
        id: "user_3",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Summarize this LinkedIn post and show engagement stats.",
          },
        ],
      },
      {
        id: "assistant_5",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Here’s a social post-style preview with engagement details.",
          },
        ],
      },
      {
        id: "assistant_6",
        role: "assistant",
        parts: [
          // Tool UI: render_social_post → renders SocialPost
          {
            type: "tool-render_social_post",
            toolCallId: "tc_social_post_1",
            state: "output-available",
            input: { platform: "linkedin" },
            output: {
              post: {
                id: "linkedin-post-1",
                platform: "linkedin",
                author: {
                  name: "Dr. Michael Thompson",
                  handle: "michaelthompson",
                  avatarUrl:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
                },
                text: "Excited to share a quick update on our cloud migration project—key lessons in scalability, resilience, and automation.",
                linkPreview: {
                  url: "https://example.com/blog/cloud-migration-case-study",
                  title:
                    "Cloud Migration Case Study: Lessons from the Trenches",
                  description:
                    "A comprehensive guide to our successful cloud migration journey.",
                  imageUrl:
                    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop",
                  domain: "example.com",
                },
                stats: { likes: 847, shares: 24 },
                createdAtISO: "2025-11-05T09:15:00.000Z",
                actions: [
                  { id: "like", label: "Like", variant: "ghost" },
                  { id: "share", label: "Share", variant: "ghost" },
                ],
              },
            },
          },
        ],
      },
    ],
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
      <GetStocksUI />
      <RenderMediaCardUI />
      <RenderSocialPostUI />
    </AssistantRuntimeProvider>
  );
}
