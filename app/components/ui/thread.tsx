"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { ArrowUp } from "lucide-react";
import type { FC } from "react";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-1 flex-col">
      {/* Messages Viewport */}
      <ThreadPrimitive.Viewport className="m-8 flex-1 overflow-y-auto">
        {/* Welcome message when empty */}
        <ThreadPrimitive.If empty>
          <div className="flex h-full flex-col items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="mb-2 text-lg font-semibold">
                Stock Market Assistant
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Ask me about stock prices and market data. Try one of these:
              </p>
              <div className="flex flex-col gap-2">
                <ThreadPrimitive.Suggestion
                  prompt="Show me the top tech stocks"
                  send={true}
                  className="bg-background hover:bg-muted rounded-md border px-4 py-2 text-sm"
                >
                  Show me the top tech stocks
                </ThreadPrimitive.Suggestion>
                <ThreadPrimitive.Suggestion
                  prompt="What's the current price of Apple stock?"
                  send={true}
                  className="bg-background hover:bg-muted rounded-md border px-4 py-2 text-sm"
                >
                  What&apos;s the current price of Apple stock?
                </ThreadPrimitive.Suggestion>
                <ThreadPrimitive.Suggestion
                  prompt="Get data for MSFT, GOOGL, and AMZN"
                  send={true}
                  className="bg-background hover:bg-muted rounded-md border px-4 py-2 text-sm"
                >
                  Get data for MSFT, GOOGL, and AMZN
                </ThreadPrimitive.Suggestion>
              </div>
            </div>
          </div>
        </ThreadPrimitive.If>

        {/* Messages */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Scroll to Bottom Button */}
      <ThreadPrimitive.ScrollToBottom className="bg-background hover:bg-muted absolute right-4 bottom-20 rounded-full border p-2 shadow-md">
        ↓
      </ThreadPrimitive.ScrollToBottom>

      {/* Composer */}
      <ComposerPrimitive.Root className="relative mx-4 mb-4 flex items-center rounded-full bg-gray-100 px-4 py-2">
        <ComposerPrimitive.Input
          data-composer-input
          placeholder="Ask about stocks..."
          className="placeholder:text-muted-foreground max-h-40 flex-1 resize-none bg-transparent pr-2 text-sm outline-none"
        />
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-full p-2 disabled:opacity-50">
            <ArrowUp className="h-4 w-4" />
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shrink-0 rounded-full p-2">
            ⏹
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
};

// User Message Component
const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-4 py-2 text-sm">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

// Assistant Message Component
const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-start">
      <div className="w-full">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                {text}
              </div>
            ),
            ToolGroup: ({ children }) => (
              <div className="w-full">{children}</div>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};
