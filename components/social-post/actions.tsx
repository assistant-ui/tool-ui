"use client";

import * as React from "react";
import { cn } from "./_cn";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./_ui";
import { useSocialPost } from "./context";

type ToggleKey = "liked" | "saved" | "reposted" | "following";
const TOGGLE_MAP: Record<string, ToggleKey> = {
  like: "liked",
  save: "saved",
  repost: "reposted",
  follow: "following",
};

type Booleanish = true | false | "true" | "false";

export function Actions() {
  const { post, cfg, state, setState, handlers, actionOverrides } =
    useSocialPost();

  const defaults = Object.keys(cfg.actions).filter((id) => id !== "menu");
  const serverActions = post.actions ?? [];
  const runtimeOverrides = actionOverrides;
  const runtimeMap = React.useMemo(
    () => new Map(runtimeOverrides.map((override) => [override.id, override])),
    [runtimeOverrides],
  );

  const baseList =
    serverActions.length > 0
      ? serverActions.map((action) => ({
          id: action.id,
          label: action.label ?? cfg.actions[action.id] ?? action.id,
          variant: action.variant ?? "ghost",
        }))
      : defaults.map((id) => ({
          id,
          label: cfg.actions[id] ?? id,
          variant: "ghost" as const,
        }));

  type ResolvedAction = {
    id: string;
    label: string;
    variant: "default" | "secondary" | "ghost" | "destructive";
    srLabel?: string;
    hoverColor?: string;
    icon?: React.ReactNode;
    fallbackIcon?: React.ComponentType<{
      className?: string;
      "aria-hidden"?: Booleanish;
    }>;
    hotkey?: string;
  };

  const seen = new Set<string>();
  const resolvedActions: ResolvedAction[] = baseList.map((base) => {
    seen.add(base.id);
    const runtime = runtimeMap.get(base.id);
    const actionConfig = cfg.actionConfigs?.find((ac) => ac.id === base.id);
    return {
      id: base.id,
      label: runtime?.label ?? base.label ?? cfg.actions[base.id] ?? base.id,
      variant: runtime?.variant ?? base.variant ?? "ghost",
      srLabel: runtime?.srLabel,
      hoverColor: actionConfig?.hoverColor,
      icon: runtime?.icon,
      fallbackIcon: actionConfig?.icon,
      hotkey: runtime?.hotkey,
    };
  });

  for (const override of runtimeOverrides) {
    if (seen.has(override.id)) continue;
    const actionConfig = cfg.actionConfigs?.find((ac) => ac.id === override.id);
    resolvedActions.push({
      id: override.id,
      label: override.label ?? cfg.actions[override.id] ?? override.id,
      variant: override.variant ?? "ghost",
      srLabel: override.srLabel,
      hoverColor: actionConfig?.hoverColor,
      icon: override.icon,
      fallbackIcon: actionConfig?.icon,
      hotkey: override.hotkey,
    });
    seen.add(override.id);
  }

  async function run(actionId: string) {
    const shouldProceed =
      (await handlers.onBeforeAction?.({
        action: actionId,
        post,
        messageId: post.messageId,
      })) ?? true;
    if (!shouldProceed) return;
    handlers.onAction?.(actionId, post, { messageId: post.messageId });
    runtimeMap.get(actionId)?.onClick?.(post);

    if (actionId in TOGGLE_MAP) {
      const key = TOGGLE_MAP[actionId];
      setState({ [key]: !state[key] } as Partial<typeof state>);
    }
  }

  const getActionCount = (actionId: string): number | undefined => {
    const stats = post.stats;
    if (!stats) return undefined;
    switch (actionId) {
      case "reply":
        return stats.comments;
      case "repost":
        return stats.reposts;
      case "like":
        return stats.likes;
      case "views":
        return stats.views;
      case "share":
        return stats.shares;
      case "bookmark":
      case "save":
        return stats.bookmarks;
      default:
        return undefined;
    }
  };

  const rail = cfg.tokens.actionLayout === "right-rail";

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          rail
            ? "@container:bottom-6 absolute right-2 bottom-4 flex flex-col"
            : "mt-1 flex flex-wrap items-center",
          cfg.tokens.spacing.actionGap,
        )}
      >
        <div className="flex flex-1 items-center justify-between">
          {resolvedActions.slice(0, 4).map((action) => {
            const toggleKey = TOGGLE_MAP[action.id];
            const isActive = toggleKey ? (state[toggleKey] ?? false) : false;
            const count = getActionCount(action.id);
            const FallbackIcon = action.fallbackIcon;
            const iconNode = action.icon ? (
              <span
                aria-hidden
                className="flex h-4 w-4 items-center justify-center"
              >
                {action.icon}
              </span>
            ) : FallbackIcon ? (
              <FallbackIcon className="h-4 w-4" aria-hidden="true" />
            ) : null;
            const showLabel = !iconNode;

            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant}
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      void run(action.id);
                    }}
                    className={cn(
                      "h-auto gap-1.5 px-1 py-1",
                      action.hoverColor,
                      isActive && action.id === "like" && "text-red-500",
                      isActive && action.id === "repost" && "text-green-500",
                    )}
                    aria-label={action.srLabel ?? action.label}
                    aria-keyshortcuts={action.hotkey}
                    aria-pressed={toggleKey ? isActive : undefined}
                  >
                    {iconNode}
                    {count !== undefined ? (
                      <span className="text-sm">{count}</span>
                    ) : null}
                    {showLabel ? (
                      <span className="text-sm">{action.label}</span>
                    ) : null}
                    <span className="sr-only">
                      {action.srLabel ?? action.label}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <span>{action.label}</span>
                    {action.hotkey ? (
                      <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs font-medium tracking-wide uppercase">
                        {action.hotkey}
                      </kbd>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex items-center">
          {resolvedActions.slice(4).map((action, index) => {
            const toggleKey = TOGGLE_MAP[action.id];
            const isActive = toggleKey ? (state[toggleKey] ?? false) : false;
            const FallbackIcon = action.fallbackIcon;
            const iconNode = action.icon ? (
              <span
                aria-hidden
                className="flex h-4 w-4 items-center justify-center"
              >
                {action.icon}
              </span>
            ) : FallbackIcon ? (
              <FallbackIcon className="h-4 w-4" aria-hidden="true" />
            ) : null;
            const showLabel = !iconNode;

            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant}
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      void run(action.id);
                    }}
                    className={cn(
                      "h-auto gap-1.5 px-1 py-1",
                      action.hoverColor,
                      isActive && action.id === "like" && "text-red-500",
                      isActive && action.id === "repost" && "text-green-500",
                      index > 0 && "-ml-2",
                    )}
                    aria-label={action.srLabel ?? action.label}
                    aria-keyshortcuts={action.hotkey}
                    aria-pressed={toggleKey ? isActive : undefined}
                  >
                    {iconNode}
                    {showLabel ? (
                      <span className="text-sm">{action.label}</span>
                    ) : null}
                    <span className="sr-only">
                      {action.srLabel ?? action.label}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <span>{action.label}</span>
                    {action.hotkey ? (
                      <kbd className="bg-muted text-muted-foreground rounded px-1 text-xs font-medium tracking-wide uppercase">
                        {action.hotkey}
                      </kbd>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
