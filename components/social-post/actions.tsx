"use client";

import { cn } from "./_cn";
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./_ui";
import { useSocialPost } from "./context";

type ToggleKey = "liked" | "saved" | "reposted" | "following";
const TOGGLE_MAP: Record<string, ToggleKey> = {
  like: "liked",
  save: "saved",
  repost: "reposted",
  follow: "following",
};

export function Actions() {
  const { post, cfg, state, setState, handlers } = useSocialPost();

  // Derive default actions from platform, trimming extras for X embeds
  let defaults = Object.keys(cfg.actions);
  if (cfg.name === "x") {
    // Only show Like and Copy link for X embeds per design
    defaults = defaults.filter((id) => id === "like" || id === "share");
  }
  const overrides = post.actions ?? [];
  const actions = overrides.length
    ? overrides.map((action) => ({
        id: action.id,
        label: action.label,
        variant: action.variant ?? "ghost",
      }))
    : defaults.map((id) => ({ id, label: cfg.actions[id], variant: "ghost" as const }));

  async function run(actionId: string) {
    const shouldProceed =
      (await handlers.onBeforeAction?.({ action: actionId, post, messageId: post.messageId })) ?? true;
    if (!shouldProceed) return;
    handlers.onAction?.(actionId, post, { messageId: post.messageId });

    if (actionId in TOGGLE_MAP) {
      const key = TOGGLE_MAP[actionId];
      setState({ [key]: !state[key] } as Partial<typeof state>);
    }
  }

  // Map action IDs to stat counts
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
      case "share":
        return stats.shares;
      case "bookmark":
      case "save":
        return stats.bookmarks;
      default:
        return undefined;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn("mt-3 flex flex-wrap items-center", cfg.tokens.spacing.actionGap)}>
        {actions.map((action) => {
          const toggleKey = TOGGLE_MAP[action.id];
          const actionConfig = cfg.actionConfigs?.find((ac) => ac.id === action.id);
          const Icon = actionConfig?.icon;
          const isActive = toggleKey ? state[toggleKey] ?? false : false;
          let count = getActionCount(action.id);
          // X embeds only show count for likes
          if (cfg.name === "x" && action.id !== "like") {
            count = undefined;
          }

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
                    "min-h-[44px] gap-1.5 px-2",
                    actionConfig?.hoverColor,
                    isActive && action.id === "like" && "text-red-500",
                    isActive && action.id === "repost" && "text-green-500",
                  )}
                  aria-label={action.label}
                  aria-pressed={
                    toggleKey ? isActive : undefined
                  }
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {count !== undefined && count > 0 ? (
                    <span className="text-sm">{count}</span>
                  ) : null}
                  {cfg.name === "x" && action.id === "share" ? (
                    <span className="ml-1 text-sm">Copy link</span>
                  ) : null}
                  <span className="sr-only">{action.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
