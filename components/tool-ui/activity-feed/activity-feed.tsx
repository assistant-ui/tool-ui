"use client";

import * as React from "react";
import {
  cn,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "./_adapter";
import type {
  ActivityFeedProps,
  ActivityItem,
  ActivityEventType,
} from "./schema";
import {
  GitCommit,
  GitPullRequest,
  GitMerge,
  MessageSquare,
  CircleDot,
  GitBranch,
  Tag,
  GitFork,
  Star,
  Check,
  X,
  Activity,
} from "lucide-react";

/**
 * Icons for each event type.
 */
const EVENT_ICONS: Record<ActivityEventType, React.ComponentType<{ className?: string }>> = {
  commit: GitCommit,
  pr_opened: GitPullRequest,
  pr_merged: GitMerge,
  pr_closed: X,
  pr_review_requested: GitPullRequest,
  pr_review_submitted: Check,
  pr_comment: MessageSquare,
  issue_opened: CircleDot,
  issue_closed: CircleDot,
  issue_comment: MessageSquare,
  branch_created: GitBranch,
  branch_deleted: GitBranch,
  release: Tag,
  fork: GitFork,
  star: Star,
};

/**
 * Colors for each event type - using semantic colors with low opacity backgrounds.
 */
const EVENT_COLORS: Record<ActivityEventType, { icon: string; bg: string }> = {
  commit: { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  pr_opened: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  pr_merged: { icon: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  pr_closed: { icon: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  pr_review_requested: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  pr_review_submitted: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  pr_comment: { icon: "text-muted-foreground", bg: "bg-muted" },
  issue_opened: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  issue_closed: { icon: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
  issue_comment: { icon: "text-muted-foreground", bg: "bg-muted" },
  branch_created: { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  branch_deleted: { icon: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
  release: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  fork: { icon: "text-muted-foreground", bg: "bg-muted" },
  star: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
};

/**
 * Format relative time (e.g., "2h ago").
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get initials from a name.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Event type indicator - styled like step indicators in other components.
 */
function EventIndicator({ type }: { type: ActivityEventType }) {
  const Icon = EVENT_ICONS[type];
  const colors = EVENT_COLORS[type];

  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full",
        "motion-safe:transition-all motion-safe:duration-200",
        colors.bg,
      )}
      aria-hidden="true"
    >
      <Icon className={cn("size-3.5", colors.icon)} />
    </span>
  );
}

/**
 * Single activity item - compact variant (XS/SM sizes).
 */
interface ActivityItemCompactProps {
  item: ActivityItem;
  onClick?: (item: ActivityItem) => void;
}

function ActivityItemCompact({ item, onClick }: ActivityItemCompactProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left",
          "motion-safe:transition-all motion-safe:duration-200",
          "hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <EventIndicator type={item.type} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium leading-6">
          {item.title}
        </span>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {formatRelativeTime(item.timestamp)}
        </span>
      </button>
    </li>
  );
}

/**
 * Single activity item - standard variant (MD size).
 */
interface ActivityItemStandardProps {
  item: ActivityItem;
  onClick?: (item: ActivityItem) => void;
}

function ActivityItemStandard({ item, onClick }: ActivityItemStandardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left",
          "motion-safe:transition-all motion-safe:duration-200",
          "hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <EventIndicator type={item.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium leading-6">
              {item.title}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
          {item.description && (
            <p className="text-muted-foreground mt-0.5 truncate text-sm">
              {item.description}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}

/**
 * Single activity item - detailed variant (LG/XL sizes).
 */
interface ActivityItemDetailedProps {
  item: ActivityItem;
  onClick?: (item: ActivityItem) => void;
}

function ActivityItemDetailed({ item, onClick }: ActivityItemDetailedProps) {
  const colors = EVENT_COLORS[item.type];

  return (
    <li>
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left",
          "motion-safe:transition-all motion-safe:duration-200",
          "hover:bg-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        style={{
          backdropFilter: "blur(2px)",
        }}
      >
        <Avatar className="size-8 shrink-0 border border-border/50">
          {item.actor.avatar && (
            <AvatarImage src={item.actor.avatar} alt={item.actor.name} />
          )}
          <AvatarFallback className="text-xs font-medium">
            {getInitials(item.actor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{item.actor.name}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                colors.bg,
                colors.icon,
              )}
            >
              {EVENT_ICONS[item.type] && (
                <span className="size-3">
                  {React.createElement(EVENT_ICONS[item.type], {
                    className: "size-3",
                  })}
                </span>
              )}
              <span className="capitalize">{item.type.replace(/_/g, " ")}</span>
            </span>
            <span className="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium leading-snug">{item.title}</p>
          {item.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {item.description}
            </p>
          )}
        </div>
      </button>
    </li>
  );
}

/**
 * Activity group header.
 */
interface GroupHeaderProps {
  label: string;
  count: number;
}

function GroupHeader({ label, count }: GroupHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10",
        "@[280px]:flex hidden items-center gap-1.5",
        "@[560px]:px-5 @[400px]:px-4 px-3 py-2",
        "bg-card/95 backdrop-blur-sm",
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-[11px] text-muted-foreground/50 tabular-nums">
        ({count})
      </span>
    </div>
  );
}

/**
 * Skeleton for loading state.
 */
function ActivityFeedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "@container flex w-full min-w-80 max-w-md flex-col",
        "text-foreground",
        className,
      )}
      data-slot="activity-feed-progress"
      aria-busy="true"
    >
      <div className="bg-card flex w-full flex-col rounded-2xl border p-5 shadow-xs">
        <div className="mb-4 bg-muted h-5 w-32 rounded motion-safe:animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="bg-muted size-6 shrink-0 rounded-full motion-safe:animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="bg-muted h-4 w-3/4 rounded motion-safe:animate-pulse" />
                <div className="bg-muted h-3 w-1/2 rounded motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivityFeedProgress({ className }: { className?: string }) {
  return <ActivityFeedSkeleton className={className} />;
}

/**
 * Empty state when no activities.
 */
function ActivityFeedEmpty({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Activity className="size-6 text-muted-foreground/50" />
      </span>
      <p className="text-muted-foreground mt-4 text-sm">
        {message ?? "No activity yet"}
      </p>
    </div>
  );
}

/**
 * Main ActivityFeed component.
 *
 * Uses container queries to adapt layout based on available space:
 * - XS (<280px): Compact icons + title
 * - SM (280-400px): + timestamp
 * - MD (400-560px): + description
 * - LG (>560px): + avatar + metadata badges
 */
export function ActivityFeed({
  id,
  groups,
  title,
  refreshInterval,
  updateBehavior: _updateBehavior = "silent",
  maxItems,
  emptyMessage,
  className,
  isLoading,
  onRefresh,
  onItemClick,
}: ActivityFeedProps) {
  // Auto-refresh effect
  React.useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  // Flatten and limit items if needed
  const allItems = React.useMemo(() => {
    const items = groups.flatMap((g) => g.items);
    return maxItems ? items.slice(0, maxItems) : items;
  }, [groups, maxItems]);

  // Count total items
  const totalItems = allItems.length;

  if (isLoading) {
    return <ActivityFeedSkeleton className={className} />;
  }

  if (totalItems === 0) {
    return (
      <article
        className={cn(
          "@container flex w-full min-w-80 max-w-md flex-col",
          "text-foreground",
          className,
        )}
        data-slot="activity-feed"
        data-tool-ui-id={id}
      >
        <div className="bg-card flex w-full flex-col rounded-2xl border shadow-xs">
          {title && (
            <div className="@[560px]:px-5 @[400px]:px-4 px-3 py-2">
              <h2 className="leading-none font-semibold">{title}</h2>
            </div>
          )}
          <div className="px-5">
            <ActivityFeedEmpty message={emptyMessage} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "@container flex w-full min-w-80 max-w-md flex-col",
        "text-foreground",
        className,
      )}
      data-slot="activity-feed"
      data-tool-ui-id={id}
      lang="en"
    >
      <div className="bg-card flex w-full flex-col overflow-hidden rounded-2xl border shadow-xs">
        {title && (
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
        )}

        <div className="@[560px]:max-h-[480px] @[400px]:max-h-[360px] max-h-[280px] overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Group header - hidden at XS size, sticky at larger sizes */}
              <GroupHeader label={group.label} count={group.items.length} />

              {/* Items */}
              <ul className="@[560px]:px-3 @[400px]:px-2 px-1 py-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    {/* XS/SM: Compact */}
                    <div className="@[400px]:hidden">
                      <ActivityItemCompact item={item} onClick={onItemClick} />
                    </div>

                    {/* MD: Standard */}
                    <div className="@[560px]:hidden @[400px]:block hidden">
                      <ActivityItemStandard item={item} onClick={onItemClick} />
                    </div>

                    {/* LG/XL: Detailed */}
                    <div className="@[560px]:block hidden">
                      <ActivityItemDetailed item={item} onClick={onItemClick} />
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
