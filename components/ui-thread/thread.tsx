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
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto lg:p-10">
        {/* Messages */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Composer */}
      <ComposerPrimitive.Root className="bg-muted relative mx-4 mb-4 flex items-center rounded-full px-4 py-2 shadow-md">
        <ComposerPrimitive.Input
          data-composer-input
          placeholder="Ask about stocks..."
          className="placeholder:text-muted-foreground max-h-40 flex-1 resize-none bg-transparent pl-4 text-lg outline-none"
        />
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-full p-2 disabled:opacity-50">
            <ArrowUp className="size-6" />
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel className="bg-destructive text-destructive hover:bg-destructive/90 shrink-0 rounded-full p-2">
            ⏹
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-10 flex justify-end">
      <div className="bg-primary text-primary-foreground max-w-[80%] rounded-lg px-4 py-2 text-base">
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mb-10 flex justify-start">
      <div className="w-full">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => <div className="mb-3 text-base">{text}</div>,
            ToolGroup: ({ children }) => (
              <div className="w-full min-w-0 space-y-3">{children}</div>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};
