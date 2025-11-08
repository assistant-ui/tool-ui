"use client";

import { useState, useCallback } from "react";
import type { DecisionPromptAction } from "./schema";
import { Button } from "./_ui";
import { cn } from "./_cn";
import { Check } from "lucide-react";

interface MultiSelectActionsProps {
  actions: DecisionPromptAction[];
  onConfirm: (actionIds: string[]) => void | Promise<void>;
  align?: "left" | "center" | "right";
  layout?: "inline" | "stack";
  confirmLabel?: string;
  cancelLabel?: string;
  minSelections?: number;
  maxSelections?: number;
  className?: string;
}

export function MultiSelectActions({
  actions,
  onConfirm,
  align = "right",
  layout = "inline",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  minSelections = 1,
  maxSelections,
  className,
}: MultiSelectActionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);

  const toggleSelection = useCallback(
    (actionId: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(actionId)) {
          next.delete(actionId);
        } else {
          if (maxSelections && next.size >= maxSelections) {
            return prev;
          }
          next.add(actionId);
        }
        return next;
      });
    },
    [maxSelections],
  );

  const handleConfirm = useCallback(async () => {
    if (isExecuting) return;

    const selected = Array.from(selectedIds);
    if (selected.length < minSelections) return;

    try {
      setIsExecuting(true);
      await onConfirm(selected);
    } finally {
      setIsExecuting(false);
    }
  }, [selectedIds, minSelections, onConfirm, isExecuting]);

  const handleCancel = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  const isConfirmDisabled =
    isExecuting || selectedIds.size < minSelections || selectedIds.size === 0;
  const isCancelDisabled = isExecuting || selectedIds.size === 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "flex w-full gap-2.5",
          layout === "stack"
            ? // For stacked lists, stretch items so each fills the container
              "flex-col items-stretch gap-1"
            : cn(
                // Baseline (narrow): stacked, stretch items to fill width
                "flex-col items-stretch gap-1",
                // Wide containers: we still allow row layout if desired,
                // alignment applies only at wide sizes
                "@[28rem]:flex-row @[28rem]:flex-wrap @[28rem]:items-center",
                `@[28rem]:${alignClass}`,
              ),
        )}
      >
        {actions.map((action) => {
          const isSelected = selectedIds.has(action.id);
          const isDisabled = Boolean(
            action.disabled ||
              isExecuting ||
              (!isSelected &&
                maxSelections &&
                selectedIds.size >= maxSelections),
          );

          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => toggleSelection(action.id)}
              disabled={isDisabled}
              className={cn(
                "transition-xs bg-background min-h-[44px] w-full border text-sm font-medium",
                // Always left-align content; responsive padding/type
                "justify-start px-5 py-4 text-base @[28rem]:px-4 @[28rem]:py-3 @[28rem]:text-sm",
                {
                  "bg-accent hover:!bg-accent": isSelected,
                },
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    {
                      "border-primary bg-primary text-primary-foreground":
                        isSelected,
                    },
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </div>
            </Button>
          );
        })}
      </div>

      <div className={cn("flex items-center gap-4", alignClass)}>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleCancel}
          disabled={isCancelDisabled}
          className="text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="text-base @[28rem]:px-3 @[28rem]:py-2 @[28rem]:text-sm"
        >
          {isExecuting ? (
            <>
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
              {confirmLabel}
            </>
          ) : (
            <>
              {confirmLabel}
              {selectedIds.size > 0 && <span>{selectedIds.size}</span>}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
