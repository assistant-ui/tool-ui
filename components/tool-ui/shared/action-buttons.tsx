"use client";

import type { Action } from "./schema";
import { Button } from "./_ui";
import { cn } from "./_cn";
import { useActionButtons } from "./use-action-buttons";

export interface ActionButtonsProps {
  actions: Action[];
  onAction: (actionId: string) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  layout?: "inline" | "stack";
  className?: string;
}

export function ActionButtons({
  actions,
  onAction,
  onBeforeAction,
  confirmTimeout = 3000,
  align = "right",
  layout = "inline",
  className,
}: ActionButtonsProps) {
  const { actions: resolvedActions, runAction } = useActionButtons({
    actions,
    onAction,
    onBeforeAction,
    confirmTimeout,
  });

  const crossAlignClass = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  }[align];

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "stack"
          ? cn("flex-col", crossAlignClass)
          : cn(
              cn("flex-col", crossAlignClass),
              "@[28rem]:flex-row @[28rem]:flex-wrap @[28rem]:items-center",
              align === "left" && "@[28rem]:justify-start",
              align === "center" && "@[28rem]:justify-center",
              align === "right" && "@[28rem]:justify-end",
            ),
        className,
      )}
    >
      {resolvedActions.map((action) => {
        const label = action.currentLabel;
        const variant = action.variant || "default";

        return (
          <Button
            key={action.id}
            variant={variant}
            size="lg"
            onClick={() => runAction(action.id)}
            disabled={action.isDisabled}
            className={cn(
              "rounded-full",
              "justify-center",
              "text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm",
              action.isConfirming &&
                "ring-destructive animate-pulse ring-2 ring-offset-2",
            )}
            aria-label={
              action.shortcut ? `${label} (${action.shortcut})` : label
            }
          >
            {action.isLoading && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {action.icon && !action.isLoading && (
              <span className="mr-2">{action.icon}</span>
            )}
            {label}
            {action.shortcut && !action.isLoading && (
              <kbd className="border-border bg-muted ml-2.5 hidden rounded-lg border px-2 py-0.5 font-mono text-xs font-medium sm:inline-block">
                {action.shortcut}
              </kbd>
            )}
          </Button>
        );
      })}
    </div>
  );
}
