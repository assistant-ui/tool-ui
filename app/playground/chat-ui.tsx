"use client";

import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/app/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/app/components/assistant-ui/tool-fallback";
import { FrequentLocationSelector } from "@/lib/playground/prototypes/waymo/wip-tool-uis";

const actionBarClassName = "text-muted-foreground flex gap-2 text-xs";

export const UserMessage = () => (
  <MessagePrimitive.Root className="mx-auto w-full max-w-2xl py-3">
    <div className="ml-auto flex max-w-[85%] flex-col items-end gap-2">
      <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <UserActionBar />
    </div>
  </MessagePrimitive.Root>
);

export const AssistantMessage = () => (
  <MessagePrimitive.Root className="mx-auto w-full max-w-2xl py-3">
    <div className="flex max-w-[85%] flex-col gap-3">
      <MessagePrimitive.Content
        components={{
          Text: MarkdownText,
          tools: {
            Fallback: ToolFallback,
            by_name: {
              select_frequent_location: FrequentLocationSelector,
            },
          },
        }}
      />
      <AssistantActionBar />
    </div>
  </MessagePrimitive.Root>
);

const UserActionBar = () => (
  <ActionBarPrimitive.Root className={actionBarClassName}>
    {/* <ActionBarPrimitive.Edit asChild>
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    </ActionBarPrimitive.Edit>
    <ActionBarPrimitive.Copy asChild>
      <Button variant="ghost" size="sm">
        Copy
      </Button>
    </ActionBarPrimitive.Copy> */}
  </ActionBarPrimitive.Root>
);

const AssistantActionBar = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    className={actionBarClassName}
  >
    {/* <ActionBarPrimitive.Copy asChild>
      <Button variant="ghost" size="sm">
        Copy
      </Button>
    </ActionBarPrimitive.Copy> */}
    {/* <ActionBarPrimitive.Reload asChild>
      <Button variant="ghost" size="sm">
        Retry
      </Button>
    </ActionBarPrimitive.Reload> */}
  </ActionBarPrimitive.Root>
);

export const Composer = () => (
  <ComposerPrimitive.Root className="border-input bg-background flex w-full flex-col rounded-3xl border px-1 pt-2 shadow-sm transition-all">
    <ComposerPrimitive.Input
      placeholder="Send a message..."
      className="placeholder:text-muted-foreground max-h-48 min-h-16 w-full resize-none bg-transparent px-4 pb-3 text-base outline-none"
      rows={1}
      autoFocus
    />
    <div className="mx-3 mb-2 flex items-center justify-end gap-2">
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button variant="outline" size="sm">
            Stop
          </Button>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <Button size="sm">Send</Button>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
    </div>
  </ComposerPrimitive.Root>
);
