"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { ArrowUpIcon, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FC } from "react";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-1 flex-col">
      {/* Messages Viewport */}
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-y-auto px-8">
        {/* Messages */}
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            AssistantMessage: AssistantMessage,
          }}
        />
        <div className="min-h-8 grow" />

        {/* Composer */}
        <div className="sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4">
          <ComposerPrimitive.Root className="group/input-group relative flex w-full flex-col rounded-3xl border border-input bg-background px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/50">
            <ComposerPrimitive.Input
              placeholder="Ask about stocks..."
              className="mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
              rows={1}
              autoFocus
            />
            <div className="relative mx-1 mt-2 mb-2 flex items-center justify-end">
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="size-[34px] rounded-full p-1"
                  >
                    <ArrowUpIcon className="size-5" />
                  </Button>
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>

              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    className="size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
                  >
                    <Square className="size-3.5 fill-white dark:fill-black" />
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </div>
          </ComposerPrimitive.Root>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 [&:where(>*)]:col-start-2">
      <div className="relative col-start-2 min-w-0">
        <div className="rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto w-full max-w-2xl py-4">
      <div className="mx-2 leading-7 break-words text-foreground">
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
