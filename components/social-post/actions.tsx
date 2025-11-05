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

  const defaults = Object.keys(cfg.actions);
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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const toggleKey = TOGGLE_MAP[action.id];
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
                  className={cn("min-h-[44px]")}
                  aria-label={action.label}
                  aria-pressed={
                    toggleKey ? state[toggleKey] ?? false : undefined
                  }
                >
                  {action.label}
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
