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
  ActivityIconId,
  ActivityPaletteId,
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
  AlertTriangle,
  Bell,
  BookOpen,
  Bug,
  Calendar,
  Cloud,
  Database,
  DollarSign,
  Flag,
  Globe,
  Package,
  Rocket,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

type ActivityFeedVariant = "compact" | "standard" | "detailed";

/**
 * Icon map for lucide ids.
 */
const ICONS: Record<ActivityIconId, React.ComponentType<{ className?: string }>> = {
  activity: Activity,
  "alert-triangle": AlertTriangle,
  bell: Bell,
  "book-open": BookOpen,
  bug: Bug,
  calendar: Calendar,
  check: Check,
  "circle-dot": CircleDot,
  cloud: Cloud,
  database: Database,
  "dollar-sign": DollarSign,
  flag: Flag,
  "git-branch": GitBranch,
  "git-commit": GitCommit,
  "git-fork": GitFork,
  "git-merge": GitMerge,
  "git-pull-request": GitPullRequest,
  globe: Globe,
  "message-square": MessageSquare,
  package: Package,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  user: User,
  x: X,
  zap: Zap,
};

/**
 * Fixed palette styles for the activity feed.
 */
const PALETTES: Record<ActivityPaletteId, { icon: string; bg: string; badge: string }> = {
  slate: {
    icon: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    badge: "text-slate-700 dark:text-slate-300",
  },
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    badge: "text-blue-700 dark:text-blue-300",
  },
  cyan: {
    icon: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    badge: "text-cyan-700 dark:text-cyan-300",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    badge: "text-amber-700 dark:text-amber-300",
  },
  orange: {
    icon: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    badge: "text-orange-700 dark:text-orange-300",
  },
  rose: {
    icon: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    badge: "text-rose-700 dark:text-rose-300",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    badge: "text-violet-700 dark:text-violet-300",
  },
};

const DEFAULT_ICON: ActivityIconId = "activity";
const DEFAULT_PALETTE: ActivityPaletteId = "slate";

function resolveAppearance(item: ActivityItem) {
  return {
    icon: item.appearance?.icon ?? DEFAULT_ICON,
    palette: item.appearance?.palette ?? DEFAULT_PALETTE,
    badge: item.appearance?.badge ?? item.type,
  };
}

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
function EventIndicator({
  iconId,
  paletteId,
}: {
  iconId: ActivityIconId;
  paletteId: ActivityPaletteId;
}) {
  const Icon = ICONS[iconId] ?? ICONS[DEFAULT_ICON];
  const colors = PALETTES[paletteId] ?? PALETTES[DEFAULT_PALETTE];

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
  appearance: ReturnType<typeof resolveAppearance>;
  onClick?: (item: ActivityItem) => void;
  isNew?: boolean;
}

function ActivityItemCompact({
  item,
  appearance,
  onClick,
  isNew,
}: ActivityItemCompactProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left",
          "hover:bg-primary/5",
          isNew && "bg-primary/5 ring-1 ring-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
      <EventIndicator iconId={appearance.icon} paletteId={appearance.palette} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium leading-6">
        {item.title}
      </span>
      <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
        {formatRelativeTime(item.timestamp)}
      </span>
    </button>
  );
}

/**
 * Single activity item - standard variant (MD size).
 */
interface ActivityItemStandardProps {
  item: ActivityItem;
  appearance: ReturnType<typeof resolveAppearance>;
  onClick?: (item: ActivityItem) => void;
  isNew?: boolean;
}

function ActivityItemStandard({
  item,
  appearance,
  onClick,
  isNew,
}: ActivityItemStandardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left",
          "hover:bg-primary/5",
          isNew && "bg-primary/5 ring-1 ring-primary/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
      <EventIndicator iconId={appearance.icon} paletteId={appearance.palette} />
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
  );
}

/**
 * Single activity item - detailed variant (LG/XL sizes).
 */
interface ActivityItemDetailedProps {
  item: ActivityItem;
  appearance: ReturnType<typeof resolveAppearance>;
  onClick?: (item: ActivityItem) => void;
  isNew?: boolean;
}

function ActivityItemDetailed({
  item,
  appearance,
  onClick,
  isNew,
}: ActivityItemDetailedProps) {
  const colors = PALETTES[appearance.palette] ?? PALETTES[DEFAULT_PALETTE];
  const Icon = ICONS[appearance.icon] ?? ICONS[DEFAULT_ICON];

  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
        className={cn(
          "relative z-10 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left",
          "hover:bg-primary/5",
          isNew && "bg-primary/5 ring-1 ring-primary/10",
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
            {appearance.badge && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  colors.bg,
                  colors.badge,
                )}
              >
                <span className="size-3">
                  {React.createElement(Icon, {
                    className: "size-3",
                  })}
                </span>
                <span>{appearance.badge}</span>
              </span>
            )}
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
        "sticky top-0 z-20 isolate w-full",
        "@[280px]:flex hidden items-center gap-1.5",
        "@[560px]:px-5 @[400px]:px-4 px-3 py-0.5",
        "bg-muted border-b border-border/60",
      )}
    >
      <div className="absolute inset-0 bg-muted pointer-events-none" aria-hidden="true" />
      <span className="relative z-10 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="relative z-10 text-[11px] text-muted-foreground/50 tabular-nums">
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
 * Uses container queries + measured height to adapt layout density:
 * - Compact: width < 400px or height < 240px
 * - Standard: width >= 400px and height >= 240px
 * - Detailed: width >= 560px and height >= 360px
 */
export function ActivityFeed({
  id,
  groups,
  title,
  refreshInterval,
  updateBehavior = "silent",
  staleAfter,
  maxItems,
  emptyMessage,
  className,
  isLoading,
  onRefresh,
  onItemClick,
}: ActivityFeedProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [variant, setVariant] = React.useState<ActivityFeedVariant>("standard");
  const [newBadgeCount, setNewBadgeCount] = React.useState(0);
  const [showNewBadge, setShowNewBadge] = React.useState(false);
  const [highlightedIds, setHighlightedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [isStale, setIsStale] = React.useState(false);
  const prevItemIdsRef = React.useRef<Set<string>>(new Set());
  const hasMountedRef = React.useRef(false);
  const highlightTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const staleTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const effectiveStaleAfter = React.useMemo(() => {
    if (staleAfter) return staleAfter;
    if (refreshInterval) return refreshInterval * 2;
    return undefined;
  }, [refreshInterval, staleAfter]);

  const resolveVariant = React.useCallback(
    (width: number, height: number): ActivityFeedVariant => {
      if (width >= 560 && height >= 360) return "detailed";
      if (width < 400 || height < 240) return "compact";
      return "standard";
    },
    [],
  );

  React.useEffect(() => {
    if (isLoading) return;
    const node = containerRef.current;
    if (!node) return;

    const updateVariant = (width: number, height: number) => {
      setVariant(resolveVariant(width, height));
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        updateVariant(entry.contentRect.width, entry.contentRect.height);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    const updateFromClient = () => {
      updateVariant(node.clientWidth, node.clientHeight);
    };

    updateFromClient();
    window.addEventListener("resize", updateFromClient);
    return () => window.removeEventListener("resize", updateFromClient);
  }, [isLoading, resolveVariant]);

  const clearHighlightTimeout = React.useCallback(() => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
  }, []);

  const clearStaleTimeout = React.useCallback(() => {
    if (staleTimeoutRef.current) {
      clearTimeout(staleTimeoutRef.current);
      staleTimeoutRef.current = null;
    }
  }, []);

  const scheduleStaleTimeout = React.useCallback(() => {
    clearStaleTimeout();
    if (!effectiveStaleAfter) return;
    staleTimeoutRef.current = setTimeout(() => {
      setIsStale(true);
    }, effectiveStaleAfter);
  }, [clearStaleTimeout, effectiveStaleAfter]);

  // Auto-refresh effect
  React.useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  React.useEffect(() => {
    if (updateBehavior !== "badge") {
      setShowNewBadge(false);
      setNewBadgeCount(0);
    }

    if (updateBehavior !== "highlight") {
      setHighlightedIds(new Set());
      clearHighlightTimeout();
    }
  }, [updateBehavior, clearHighlightTimeout]);

  React.useEffect(() => {
    if (!effectiveStaleAfter) {
      setIsStale(false);
      clearStaleTimeout();
      return;
    }

    scheduleStaleTimeout();

    return () => clearStaleTimeout();
  }, [clearStaleTimeout, effectiveStaleAfter, scheduleStaleTimeout]);

  // Flatten and limit items across groups if needed
  const displayedGroups = React.useMemo(() => {
    if (!maxItems) return groups;
    let remaining = maxItems;

    return groups.reduce<typeof groups>((acc, group) => {
      if (remaining <= 0) return acc;
      const items = group.items.slice(0, remaining);
      if (items.length > 0) {
        acc.push({ ...group, items });
        remaining -= items.length;
      }
      return acc;
    }, []);
  }, [groups, maxItems]);

  const displayedItems = React.useMemo(
    () => displayedGroups.flatMap((group) => group.items),
    [displayedGroups],
  );

  React.useEffect(() => {
    const currentIds = new Set(displayedItems.map((item) => item.id));

    if (!hasMountedRef.current) {
      prevItemIdsRef.current = currentIds;
      hasMountedRef.current = true;
      return;
    }

    const previousIds = prevItemIdsRef.current;
    const newIds: string[] = [];
    currentIds.forEach((id) => {
      if (!previousIds.has(id)) {
        newIds.push(id);
      }
    });
    prevItemIdsRef.current = currentIds;

    if (newIds.length > 0) {
      if (updateBehavior === "badge") {
        setNewBadgeCount((count) => count + newIds.length);
        setShowNewBadge(true);
      }

      if (updateBehavior === "highlight") {
        setHighlightedIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.add(id));
          return next;
        });
        clearHighlightTimeout();
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedIds(new Set());
        }, 6000);
      }
    }

    setIsStale(false);
    if (effectiveStaleAfter) {
      scheduleStaleTimeout();
    }
  }, [
    clearHighlightTimeout,
    displayedItems,
    scheduleStaleTimeout,
    effectiveStaleAfter,
    updateBehavior,
  ]);

  // Count total items
  const totalItems = displayedItems.length;
  const shouldShowNewBadge =
    updateBehavior === "badge" && showNewBadge && newBadgeCount > 0;
  const shouldShowStale = Boolean(effectiveStaleAfter) && isStale;

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
        ref={containerRef}
        data-slot="activity-feed"
        data-tool-ui-id={id}
        data-variant={variant}
      >
        <div className="bg-card flex w-full flex-col rounded-2xl border shadow-xs">
          {title && (
            <div className="@[560px]:px-5 @[400px]:px-4 px-3 py-1.5">
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
      ref={containerRef}
      data-slot="activity-feed"
      data-tool-ui-id={id}
      data-variant={variant}
      lang="en"
    >
      <div className="bg-card flex w-full flex-col overflow-hidden rounded-2xl border shadow-xs">
        {title && (
          <div className="border-b px-5 py-3">
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
        )}

        {(shouldShowNewBadge || shouldShowStale) && (
          <div className="flex items-center justify-between gap-2 border-b px-5 py-2 text-xs">
            <div className="flex items-center gap-2">
              {shouldShowNewBadge && (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewBadge(false);
                    setNewBadgeCount(0);
                  }}
                  data-slot="activity-feed-new-badge"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    "bg-primary/10 text-primary hover:bg-primary/20",
                  )}
                >
                  {newBadgeCount} new
                </button>
              )}
            </div>
            {shouldShowStale && (
              <span
                data-slot="activity-feed-stale"
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  "bg-amber-500/10 text-amber-600",
                )}
              >
                Stale
              </span>
            )}
          </div>
        )}

        <div className="@[560px]:max-h-[480px] @[400px]:max-h-[360px] max-h-[280px] overflow-y-auto pb-2">
          {displayedGroups.map((group) => (
            <div key={group.label}>
              {/* Group header - hidden at XS size, sticky at larger sizes */}
              <GroupHeader label={group.label} count={group.items.length} />

              {/* Items */}
              <ul className="@[560px]:px-3 @[400px]:px-2 px-1 py-1 list-none">
                {group.items.map((item) => {
                  const appearance = resolveAppearance(item);
                  const isHighlighted =
                    updateBehavior === "highlight" &&
                    highlightedIds.has(item.id);
                  return (
                    <li
                      key={item.id}
                      data-slot="activity-feed-item"
                      data-new={isHighlighted ? "true" : undefined}
                    >
                      {variant === "compact" && (
                        <ActivityItemCompact
                          item={item}
                          appearance={appearance}
                          onClick={onItemClick}
                          isNew={isHighlighted}
                        />
                      )}
                      {variant === "standard" && (
                        <ActivityItemStandard
                          item={item}
                          appearance={appearance}
                          onClick={onItemClick}
                          isNew={isHighlighted}
                        />
                      )}
                      {variant === "detailed" && (
                        <ActivityItemDetailed
                          item={item}
                          appearance={appearance}
                          onClick={onItemClick}
                          isNew={isHighlighted}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
