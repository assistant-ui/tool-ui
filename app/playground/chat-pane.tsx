"use client";

import { useMemo } from "react";
import { AssistantRuntimeProvider, ThreadPrimitive } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import type {
  ExportedMessageRepository,
  MessageFormatAdapter,
  MessageFormatItem,
  MessageFormatRepository,
  ThreadHistoryAdapter,
} from "@assistant-ui/react";
import type { UIMessage } from "ai";

import type { Prototype } from "@/lib/playground";
import { AssistantMessage, Composer, UserMessage } from "./chat-ui";

const PROTOTYPE_SLUG_HEADER = "x-prototype-slug";

const createLocalStorageHistoryAdapter = (
  slug: string,
): ThreadHistoryAdapter => {
  const storageKey = `playground:thread:${slug}`;

  const read = (): ExportedMessageRepository => {
    if (typeof window === "undefined") {
      return { headId: null, messages: [] };
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return { headId: null, messages: [] };
    }

    try {
      const parsed = JSON.parse(raw) as ExportedMessageRepository;
      return {
        headId: parsed.headId ?? null,
        messages: parsed.messages ?? [],
      };
    } catch (error) {
      console.warn("Failed to parse stored playground thread", error);
      return { headId: null, messages: [] };
    }
  };

  const write = (repo: ExportedMessageRepository) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(repo));
    } catch (error) {
      console.warn("Failed to persist playground thread", error);
    }
  };

  const upsertMessage = (
    repo: ExportedMessageRepository,
    item: ExportedMessageRepository["messages"][number],
  ): ExportedMessageRepository => {
    const existingIndex = repo.messages.findIndex(
      (entry) => entry.message.id === item.message.id,
    );

    if (existingIndex >= 0) {
      repo.messages[existingIndex] = item;
    } else {
      repo.messages.push(item);
    }

    return repo;
  };

  return {
    async load() {
      return read();
    },

    async append(item) {
      if (typeof window === "undefined") {
        return;
      }

      const repo = read();
      const next = upsertMessage(repo, item);
      next.headId = item.message.id;
      write(next);
    },

    withFormat<TMessage, TStorageFormat>(
      formatAdapter: MessageFormatAdapter<TMessage, TStorageFormat>,
    ) {
      return {
        async load(): Promise<MessageFormatRepository<TMessage>> {
          const repo = read();
          return {
            headId: repo.headId,
            messages: repo.messages.map((entry) => {
              const storageEntry = {
                id: entry.message.id,
                parent_id: entry.parentId,
                format: formatAdapter.format,
                content: formatAdapter.encode({
                  parentId: entry.parentId,
                  message: entry.message as unknown as TMessage,
                }),
              };
              return formatAdapter.decode(storageEntry);
            }),
          };
        },

        async append(item: MessageFormatItem<TMessage>) {
          if (typeof window === "undefined") {
            return;
          }

          const repo = read();
          const exportedItem: ExportedMessageRepository["messages"][number] = {
            parentId: item.parentId,
            message:
              item.message as unknown as ExportedMessageRepository["messages"][number]["message"],
          };
          const next = upsertMessage(repo, exportedItem);
          next.headId = exportedItem.message.id;
          write(next);
        },
      };
    },
  };
};

export type ChatPaneProps = {
  prototype: Prototype;
};

export const ChatPane = ({ prototype }: ChatPaneProps) => {
  const { slug, title } = prototype;

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/playground/chat",
        headers: async () => ({
          [PROTOTYPE_SLUG_HEADER.toUpperCase()]: slug,
        }),
      }),
    [slug],
  );

  const historyAdapter = useMemo(
    () => createLocalStorageHistoryAdapter(slug),
    [slug],
  );

  const seedMessages = useMemo<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(`playground:thread:${slug}`);
      if (!raw) return [];
      const repo = JSON.parse(raw) as ExportedMessageRepository;
      return (repo.messages ?? []).map(
        (m) => m.message as unknown as UIMessage,
      );
    } catch {
      return [];
    }
  }, [slug]);

  const runtime = useChatRuntime({
    transport,
    messages: seedMessages,
    adapters: { history: historyAdapter },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex flex-1 flex-col overflow-hidden">
        <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <ThreadPrimitive.If empty>
            <div className="text-muted-foreground mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-3 text-center">
              <p className="text-base font-medium">Start exploring {title}</p>
              <p className="text-sm">
                Describe a task or ask a question to see how this tool
                collection responds.
              </p>
            </div>
          </ThreadPrimitive.If>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
        </ThreadPrimitive.Viewport>
        <div className="border-border bg-background/95 border-t px-6 py-4">
          <Composer />
        </div>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
};
