"use client";

import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { ArrowUpIcon, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FC } from "react";

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
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};

const Composer: FC = () => {
  return (
    <div className="sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
      <ComposerPrimitive.Root className="group/input-group relative flex w-full flex-col rounded-3xl border border-input bg-background px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/50">
        <ComposerPrimitive.Input
          placeholder="Describe the component you want to build..."
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
  );
};

const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full w-full flex-col bg-background">
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-y-auto px-4">
        <ThreadPrimitive.If empty>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 text-green-600 dark:text-green-500 mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/>
                  <path d="m18 15 4-4"/>
                  <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Builder</h2>
              <p className="text-muted-foreground mb-8">Build your tool UI components</p>
            </div>
          </div>
        </ThreadPrimitive.If>
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
        <div className="min-h-8 grow" />
        <Composer />
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

export default function BuilderPage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
