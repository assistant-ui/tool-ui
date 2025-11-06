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
          // Check max selections
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

  const isStacked = layout === "stack";
  const isConfirmDisabled =
    isExecuting || selectedIds.size < minSelections || selectedIds.size === 0;
  const isCancelDisabled = isExecuting || selectedIds.size === 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Selection buttons */}
      <div
        className={cn(
          "flex gap-2.5",
          isStacked ? "flex-col items-stretch" : "flex-wrap items-center",
          !isStacked && alignClass,
        )}
      >
        {actions.map((action) => {
          const isSelected = selectedIds.has(action.id);
          const isDisabled = Boolean(
            action.disabled ||
            isExecuting ||
            (!isSelected && maxSelections && selectedIds.size >= maxSelections)
          );

          return (
            <Button
              key={action.id}
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              onClick={() => toggleSelection(action.id)}
              disabled={isDisabled}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all",
                isStacked ? "w-full justify-start" : "min-w-24",
                isSelected && "ring-2 ring-offset-2",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "border-border flex h-4 w-4 items-center justify-center rounded border",
                    isSelected && "bg-primary border-primary text-primary-foreground",
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

      {/* Confirm/Cancel buttons */}
      <div className={cn("flex items-center gap-2.5", alignClass)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelDisabled}
          className="px-4 py-2 text-sm font-medium"
        >
          {cancelLabel}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="min-w-24 px-4 py-2 text-sm font-medium"
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
              {selectedIds.size > 0 && (
                <span className="ml-1.5 opacity-70">({selectedIds.size})</span>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
