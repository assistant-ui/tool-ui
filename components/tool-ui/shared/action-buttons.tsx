"use client";

import { useState, useEffect, useCallback } from "react";
import type { Action } from "./schema";
import { Button } from "./_ui";
import { cn } from "./_cn";

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
  const [confirmingActionId, setConfirmingActionId] = useState<string | null>(
    null,
  );
  const [executingActionId, setExecutingActionId] = useState<string | null>(
    null,
  );
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Reset confirm state after timeout
  useEffect(() => {
    if (!confirmingActionId) return;
    const id = setTimeout(() => setConfirmingActionId(null), confirmTimeout);
    setTimeoutId(id);
    return () => clearTimeout(id);
  }, [confirmingActionId, confirmTimeout]);

  const handleActionClick = useCallback(
    async (action: Action) => {
      if (action.disabled || action.loading || executingActionId) {
        return;
      }

      if (action.confirmLabel && confirmingActionId !== action.id) {
        setConfirmingActionId(action.id);
        return;
      }

      if (onBeforeAction) {
        const shouldProceed = await onBeforeAction(action.id);
        if (!shouldProceed) {
          setConfirmingActionId(null);
          return;
        }
      }

      try {
        setExecutingActionId(action.id);
        await onAction(action.id);
      } finally {
        setExecutingActionId(null);
        setConfirmingActionId(null);
      }
    },
    [confirmingActionId, executingActionId, onAction, onBeforeAction],
  );

  // Handle escape key to cancel confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && confirmingActionId) {
        setConfirmingActionId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmingActionId]);

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
      {actions.map((action) => {
        const isConfirming = confirmingActionId === action.id;
        const isExecuting = executingActionId === action.id;
        const isLoading = action.loading || isExecuting;
        const isDisabled =
          action.disabled || (executingActionId !== null && !isExecuting);

        const label =
          isConfirming && action.confirmLabel
            ? action.confirmLabel
            : action.label;

        const variant = action.variant || "default";

        return (
          <Button
            key={action.id}
            variant={variant}
            size="lg"
            onClick={() => handleActionClick(action)}
            disabled={isDisabled}
            className={cn(
              "rounded-full",
              "justify-center",
              "text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm",
              isConfirming &&
                "ring-destructive animate-pulse ring-2 ring-offset-2",
            )}
            aria-label={
              action.shortcut ? `${label} (${action.shortcut})` : label
            }
          >
            {isLoading && (
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
            {action.icon && !isLoading && (
              <span className="mr-2">{action.icon}</span>
            )}
            {label}
            {action.shortcut && !isLoading && (
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
