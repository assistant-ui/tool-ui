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
  const { post, cfg, state, setState, handlers } = useSocialPost();

  if (!post.actions || post.actions.length === 0) {
    return null;
  }

  // Only allow platform-defined actions (like, share, repost, etc.)
  const knownActionIds = new Set(Object.keys(cfg.actions));
  const defaults = Object.keys(cfg.actions).filter((id) => id !== "menu");
  const serverActions = (post.actions ?? []).filter((action) =>
    knownActionIds.has(action.id),
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
    hoverColor?: string;
    icon?: React.ComponentType<{
      className?: string;
      "aria-hidden"?: Booleanish;
    }>;
  };

  const resolvedActions: ResolvedAction[] = baseList.map((base) => {
    const actionConfig = cfg.actionConfigs?.find((ac) => ac.id === base.id);
    return {
      id: base.id,
      label: base.label ?? cfg.actions[base.id] ?? base.id,
      variant: base.variant ?? "ghost",
      hoverColor: actionConfig?.hoverColor,
      icon: actionConfig?.icon,
    };
  });

  async function run(actionId: string) {
    const shouldProceed =
      (await handlers.onBeforePostAction?.({
        action: actionId,
        post,
        messageId: post.messageId,
      })) ?? true;
    if (!shouldProceed) return;
    handlers.onPostAction?.(actionId, post, { messageId: post.messageId });

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
        <div className="flex flex-1 items-center justify-start">
          {resolvedActions.slice(0, 4).map((action) => {
            const toggleKey = TOGGLE_MAP[action.id];
            const isActive = toggleKey ? (state[toggleKey] ?? false) : false;
            const count = getActionCount(action.id);
            const Icon = action.icon;
            const showLabel = !Icon;

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
                    aria-label={action.label}
                    aria-pressed={toggleKey ? isActive : undefined}
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                    {count !== undefined ? (
                      <span className="text-sm">{count}</span>
                    ) : null}
                    {showLabel ? (
                      <span className="text-sm">{action.label}</span>
                    ) : null}
                    <span className="sr-only">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{action.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="flex items-center">
          {resolvedActions.slice(4).map((action, index) => {
            const toggleKey = TOGGLE_MAP[action.id];
            const isActive = toggleKey ? (state[toggleKey] ?? false) : false;
            const Icon = action.icon;
            const showLabel = !Icon;

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
                    aria-label={action.label}
                    aria-pressed={toggleKey ? isActive : undefined}
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                    {showLabel ? (
                      <span className="text-sm">{action.label}</span>
                    ) : null}
                    <span className="sr-only">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{action.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
