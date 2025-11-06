"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DecisionPromptAction } from "./schema";
import { Button } from "./_ui";
import { cn } from "./_cn";

interface DecisionPromptActionsProps {
  actions: DecisionPromptAction[];
  onAction: (actionId: string) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  className?: string;
}

export function DecisionPromptActions({
  actions,
  onAction,
  onBeforeAction,
  confirmTimeout = 3000,
  align = "right",
  className,
}: DecisionPromptActionsProps) {
  const [confirmingActionId, setConfirmingActionId] = useState<string | null>(
    null,
  );
  const [executingActionId, setExecutingActionId] = useState<string | null>(
    null,
  );
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset confirm state after timeout
  useEffect(() => {
    if (confirmingActionId) {
      timeoutRef.current = setTimeout(() => {
        setConfirmingActionId(null);
      }, confirmTimeout);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [confirmingActionId, confirmTimeout]);

  const handleActionClick = useCallback(
    async (action: DecisionPromptAction) => {
      // If action is disabled or loading, do nothing
      if (action.disabled || action.loading || executingActionId) {
        return;
      }

      // Two-stage pattern: if action has confirmLabel and not yet confirming
      if (action.confirmLabel && confirmingActionId !== action.id) {
        setConfirmingActionId(action.id);
        return;
      }

      // Check if action should proceed
      if (onBeforeAction) {
        const shouldProceed = await onBeforeAction(action.id);
        if (!shouldProceed) {
          setConfirmingActionId(null);
          return;
        }
      }

      // Execute the action
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

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  return (
    <div className={cn("flex items-center gap-2", alignClass, className)}>
      {actions.map((action) => {
        const isConfirming = confirmingActionId === action.id;
        const isExecuting = executingActionId === action.id;
        const isLoading = action.loading || isExecuting;
        const isDisabled =
          action.disabled || (executingActionId !== null && !isExecuting);

        // Determine label: use confirmLabel if in confirm state
        const label =
          isConfirming && action.confirmLabel
            ? action.confirmLabel
            : action.label;

        // Determine variant: make destructive actions more prominent in confirm state
        const variant = action.variant || "default";

        return (
          <Button
            key={action.id}
            variant={variant}
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={isDisabled}
            className={cn(
              "transition-all",
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
              <kbd className="border-border bg-muted ml-2 hidden rounded border px-1.5 py-0.5 font-mono text-xs sm:inline-block">
                {action.shortcut}
              </kbd>
            )}
          </Button>
        );
      })}
    </div>
  );
}
