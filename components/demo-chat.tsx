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
import { RenderDecisionPromptUI } from "@/components/tool-uis/render-decision-prompt-ui";

/**
 * Demo Chat Component
 *
 * Demonstrates a content creator preparing their weekly tech newsletter
 * about the AI industry. Shows how the assistant makes research efficient
 * and delightful by leveraging rich tool UIs:
 * - DataTable for stock market data
 * - MediaCard for article previews
 * - SocialPost for trending industry insights
 */
export function DemoChat() {
  // Create chat runtime with API endpoint
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
    // Seeded mock conversation: Content creator preparing a tech newsletter
    messages: [
      {
        id: "user_1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "I'm writing my weekly tech newsletter and want to cover the AI industry boom. Can you show me the latest performance data for the major AI players?",
          },
        ],
      },
      {
        id: "assistant_1",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "I'll pull up the current market data for the leading AI-focused tech companies.",
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
            input: { query: "NVDA, MSFT, GOOGL, META, AMZN" },
            output: {
              count: 5,
              stocks: [
                {
                  symbol: "NVDA",
                  name: "NVIDIA Corporation",
                  price: 875.45,
                  change: 12.8,
                  changePercent: 1.48,
                  volume: 52341200,
                  marketCap: 2160000000000,
                  pe: 68.4,
                  eps: 12.8,
                },
                {
                  symbol: "MSFT",
                  name: "Microsoft Corporation",
                  price: 378.91,
                  change: 4.25,
                  changePercent: 1.13,
                  volume: 22451800,
                  marketCap: 2810000000000,
                  pe: 35.2,
                  eps: 10.76,
                },
                {
                  symbol: "GOOGL",
                  name: "Alphabet Inc.",
                  price: 139.67,
                  change: 2.15,
                  changePercent: 1.56,
                  volume: 19234500,
                  marketCap: 1750000000000,
                  pe: 26.8,
                  eps: 5.21,
                },
                {
                  symbol: "META",
                  name: "Meta Platforms Inc.",
                  price: 485.32,
                  change: 8.92,
                  changePercent: 1.87,
                  volume: 18923400,
                  marketCap: 1230000000000,
                  pe: 28.6,
                  eps: 16.97,
                },
                {
                  symbol: "AMZN",
                  name: "Amazon.com Inc.",
                  price: 178.25,
                  change: 1.34,
                  changePercent: 0.76,
                  volume: 35672800,
                  marketCap: 1850000000000,
                  pe: 52.3,
                  eps: 3.41,
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
            text: "Perfect! I want to reference this article about modern AI UX design patterns. Can you show me a preview? https://assistant-ui.com/blog/tool-ui-patterns",
          },
        ],
      },
      {
        id: "assistant_3",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Great resource for your newsletter. Here's a rich preview of that article.",
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
            text: "Perfect! Now draft an X post to promote this newsletter issue. Include the article link and make it engaging.",
          },
        ],
      },
      {
        id: "assistant_5",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Here's a draft post for X that highlights the key insights and includes the article preview.",
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
            input: { platform: "x" },
            output: {
              post: {
                id: "x-draft-1",
                platform: "x",
                author: {
                  name: "You",
                  handle: "yournewsletter",
                  avatarUrl:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
                },
                text: "The AI boom is reshaping tech markets. NVDA up 68% P/E, META leading with 1.87% gains. This week's newsletter breaks down what it means for the industry 👇",
                linkPreview: {
                  url: "https://assistant-ui.com/blog/tool-ui-patterns",
                  title: "Designing tool-friendly media cards",
                  description:
                    "How to structure robust previews for images, video, audio, and streaming tool output.",
                  imageUrl:
                    "https://images.unsplash.com/photo-1504389273929-44baec1307d2?auto=format&fit=crop&q=80&w=1200",
                  domain: "assistant-ui.com",
                },
                stats: {
                  comments: 0,
                  reposts: 0,
                  likes: 0,
                  views: 0,
                  shares: 0,
                  bookmarks: 0,
                },
                createdAtISO: "2025-11-05T09:15:00.000Z",
              },
            },
          },
        ],
      },
      {
        id: "assistant_7",
        role: "assistant",
        parts: [
          // Tool UI: render_decision_prompt → renders DecisionPrompt
          {
            type: "tool-render_decision_prompt",
            toolCallId: "tc_decision_prompt_1",
            state: "output-available",
            input: {},
            output: {
              decision: {
                prompt: "What would you like to do with this post?",
                actions: [
                  { id: "edit", label: "Edit", variant: "outline" },
                  { id: "send", label: "Send", variant: "default" },
                ],
                align: "left",
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
      <RenderDecisionPromptUI />
    </AssistantRuntimeProvider>
  );
}
