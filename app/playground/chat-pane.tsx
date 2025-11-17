"use client";

import {
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
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
import { PROTOTYPE_SLUG_HEADER } from "@/lib/playground/constants";
import { AssistantMessage, Composer, UserMessage } from "./chat-ui";
import { SelectFrequentLocationTool } from "@/lib/playground/prototypes/waymo/select-frequent-location-tool";

const THREAD_STORAGE_KEY_PREFIX = "playground:thread:";

const getThreadStorageKey = (slug: string) =>
  `${THREAD_STORAGE_KEY_PREFIX}${slug}`;

const readThreadRepo = (slug: string): ExportedMessageRepository => {
  if (typeof window === "undefined") {
    return { headId: null, messages: [] };
  }

  const raw = window.localStorage.getItem(getThreadStorageKey(slug));
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

const writeThreadRepo = (slug: string, repo: ExportedMessageRepository) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      getThreadStorageKey(slug),
      JSON.stringify(repo),
    );
  } catch (error) {
    console.warn("Failed to persist playground thread", error);
  }
};

const createLocalStorageHistoryAdapter = (
  slug: string,
): ThreadHistoryAdapter => {
  const read = () => readThreadRepo(slug);
  const write = (repo: ExportedMessageRepository) =>
    writeThreadRepo(slug, repo);

  const upsertMessage = (
    repo: ExportedMessageRepository,
    item: ExportedMessageRepository["messages"][number],
  ): ExportedMessageRepository => {
    const existingIndex = repo.messages.findIndex(
      (entry) => entry.message.id === item.message.id,
    );

    if (existingIndex >= 0) {
      // Merge the updated message while preserving existing data
      repo.messages[existingIndex] = {
        ...repo.messages[existingIndex],
        ...item,
        message: {
          ...repo.messages[existingIndex].message,
          ...item.message,
        },
      };
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

export type ChatPaneRef = {
  resetThread: () => void;
};

const createTransportForPrototype = (slug: string) =>
  new AssistantChatTransport({
    api: "/api/playground/chat",
    headers: async () => ({
      [PROTOTYPE_SLUG_HEADER]: slug,
    }),
  });

// Component to sync tool call results to localStorage
const ToolResultPersistence = ({ slug }: { slug: string }) => {
  const messages = useAssistantState(({ thread }) => thread.messages);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Only update assistant messages with tool calls in storage
    const repo = readThreadRepo(slug);
    let hasChanges = false;

    for (const runtimeMsg of messages) {
      if (runtimeMsg.role !== "assistant") continue;

      // Find this message in storage
      const storedMsgIndex = repo.messages.findIndex(
        (entry) => entry.message.id === runtimeMsg.id,
      );

      if (storedMsgIndex === -1) continue;

      const storedMsg = repo.messages[storedMsgIndex].message;

      // Stored messages use "parts", runtime messages use "content"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storedParts = (storedMsg as any).parts;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runtimeParts = (runtimeMsg as any).content;

      if (
        storedMsg.role === "assistant" &&
        Array.isArray(storedParts) &&
        Array.isArray(runtimeParts)
      ) {
        // Update tool call results by matching toolCallId
        for (const runtimePart of runtimeParts) {
          if (
            runtimePart &&
            typeof runtimePart === "object" &&
            "type" in runtimePart &&
            runtimePart.type === "tool-call" &&
            "result" in runtimePart &&
            "toolCallId" in runtimePart
          ) {
            // Find matching part by toolCallId in stored message
            // Stored parts use specific tool names like "tool-select_frequent_location"
            const storedPart = storedParts.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (part: any) =>
                part?.type?.startsWith?.("tool-") &&
                part?.toolCallId === runtimePart.toolCallId,
            );

            if (storedPart) {
              // Stored parts use "output" instead of "result"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const storedResult = (storedPart as any).output;
              const runtimeResult = runtimePart.result;

              if (
                JSON.stringify(storedResult) !== JSON.stringify(runtimeResult)
              ) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (storedPart as any).output = runtimeResult;
                hasChanges = true;
              }
            }
          }
        }
      }
    }

    if (hasChanges) {
      writeThreadRepo(slug, repo);
    }
  }, [messages, slug]);

  return null;
};

export const ChatPane = forwardRef<ChatPaneRef, ChatPaneProps>(
  ({ prototype }, ref) => {
    const { slug, title } = prototype;

    const transport = useMemo(() => createTransportForPrototype(slug), [slug]);

    const historyAdapter = useMemo(
      () => createLocalStorageHistoryAdapter(slug),
      [slug],
    );

    const seedMessages = useMemo<UIMessage[]>(() => {
      const repo = readThreadRepo(slug);
      return (repo.messages ?? []).map(
        (entry) => entry.message as unknown as UIMessage,
      );
    }, [slug]);

    const runtime = useChatRuntime({
      transport,
      messages: seedMessages,
      adapters: { history: historyAdapter },
    });

    const resetThread = useCallback(() => {
      if (typeof window === "undefined") {
        return;
      }

      // Clear localStorage
      window.localStorage.removeItem(getThreadStorageKey(slug));

      // Reset runtime to empty state
      runtime.switchToNewThread();
    }, [slug, runtime]);

    useImperativeHandle(
      ref,
      () => ({
        resetThread,
      }),
      [resetThread],
    );

    return (
      <AssistantRuntimeProvider runtime={runtime}>
        {/* Mount Waymo-specific tools */}
        {slug === "waymo-booking" && <SelectFrequentLocationTool />}

        {/* Auto-persist tool result updates to localStorage */}
        <ToolResultPersistence slug={slug} />

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
  },
);

ChatPane.displayName = "ChatPane";
