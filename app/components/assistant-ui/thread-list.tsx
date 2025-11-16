import { useCallback, type FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import { ArchiveIcon, HistoryIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/app/components/assistant-ui/tooltip-icon-button";
import { Skeleton } from "@/components/ui/skeleton";

export type ThreadListProps = {
  allowedThreadIds?: Set<string>;
  newLabel?: string;
  emptyState?: React.ReactNode;
  onReplay?: (threadId: string) => void;
};

export const ThreadList: FC<ThreadListProps> = ({
  allowedThreadIds,
  newLabel = "New Tool UI",
  emptyState,
  onReplay,
}) => {
  return (
    <ThreadListPrimitive.Root className="aui-root aui-thread-list-root flex flex-col items-stretch gap-1.5">
      <ThreadListNew label={newLabel} />
      <ThreadListItems
        allowedThreadIds={allowedThreadIds}
        emptyState={emptyState}
        onReplay={onReplay}
      />
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC<{ label: string }> = ({ label }) => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="aui-thread-list-new hover:bg-muted data-active:bg-muted flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start"
        variant="ghost"
      >
        <PlusIcon />
        {label}
      </Button>
    </ThreadListPrimitive.New>
  );
};

type ThreadListItemsProps = {
  allowedThreadIds?: Set<string>;
  emptyState?: React.ReactNode;
  onReplay?: (threadId: string) => void;
};

const ThreadListItems: FC<ThreadListItemsProps> = ({
  allowedThreadIds,
  emptyState,
  onReplay,
}) => {
  const threadsState = useAssistantState(
    useCallback((state) => state.threads, []),
  );
  const isLoading = threadsState.isLoading;
  const threadIds = threadsState.threadIds;

  if (isLoading) {
    return <ThreadListSkeleton />;
  }

  const indexMap = threadIds
    .map((id, index) => ({ id, index }))
    .filter(({ id }) => !allowedThreadIds || allowedThreadIds.has(id));

  if (indexMap.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return indexMap.map(({ id, index }) => (
    <ThreadListPrimitive.ItemByIndex
      key={id}
      index={index}
      components={{
        ThreadListItem: () => <ThreadListItem onReplay={onReplay} />,
      }}
    />
  ));
};

const ThreadListSkeleton: FC = () => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          role="status"
          aria-label="Loading threads"
          aria-live="polite"
          className="aui-thread-list-skeleton-wrapper flex items-center gap-2 rounded-md px-3 py-2"
        >
          <Skeleton className="aui-thread-list-skeleton h-[22px] grow" />
        </div>
      ))}
    </>
  );
};

const ThreadListItem: FC<{ onReplay?: (threadId: string) => void }> = ({
  onReplay,
}) => {
  return (
    <ThreadListItemPrimitive.Root className="aui-thread-list-item hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring data-active:bg-muted flex items-center gap-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:outline-none">
      <ThreadListItemPrimitive.Trigger className="aui-thread-list-item-trigger grow px-3 py-2 text-start">
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemActions onReplay={onReplay} />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <span className="aui-thread-list-item-title text-sm">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </span>
  );
};

const ThreadListItemActions: FC<{ onReplay?: (threadId: string) => void }> = ({
  onReplay,
}) => {
  const threadId = useAssistantState(({ threadListItem }) => threadListItem.id);

  return (
    <div className="flex items-center gap-1 pr-2">
      {onReplay && (
        <TooltipIconButton
          className="aui-thread-list-item-replay text-foreground hover:text-primary size-4 p-0"
          variant="ghost"
          tooltip="Replay with another instance"
          onClick={(event) => {
            event.stopPropagation();
            onReplay(threadId);
          }}
        >
          <HistoryIcon />
        </TooltipIconButton>
      )}
      <ThreadListItemPrimitive.Archive asChild>
        <TooltipIconButton
          className="aui-thread-list-item-archive text-foreground hover:text-primary size-4 p-0"
          variant="ghost"
          tooltip="Archive thread"
        >
          <ArchiveIcon />
        </TooltipIconButton>
      </ThreadListItemPrimitive.Archive>
    </div>
  );
};
