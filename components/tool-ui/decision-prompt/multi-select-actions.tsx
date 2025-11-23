"use client";

import { useState, useCallback, Fragment } from "react";
import type { DecisionPromptAction } from "./schema";
import { Button } from "./_ui";
import { cn } from "./_cn";
import { Separator } from "@/components/ui/separator";
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

  const alignClassButtons = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  const actionsContainerLayout =
    layout === "stack"
      ? "flex-col"
      : cn(
          "flex-col",
          "@[28rem]:flex-row @[28rem]:flex-wrap @[28rem]:divide-y @[28rem]:divide-x @[28rem]:divide-border",
          align === "left" && "@[28rem]:justify-start",
          align === "center" && "@[28rem]:justify-center",
          align === "right" && "@[28rem]:justify-end",
        );

  const isConfirmDisabled =
    isExecuting || selectedIds.size < minSelections || selectedIds.size === 0;
  const isCancelDisabled = isExecuting || selectedIds.size === 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "group/list flex w-full overflow-hidden rounded-2xl border bg-card/60 shadow-xs px-5 py-2.5",
          actionsContainerLayout,
        )}
      >
        {actions.map((action, index) => {
          const isSelected = selectedIds.has(action.id);
          const isDisabled = Boolean(
            action.disabled ||
              isExecuting ||
              (!isSelected &&
                maxSelections &&
                selectedIds.size >= maxSelections),
          );

          return (
            <Fragment key={action.id}>
              {index > 0 && (
                <Separator
                  className={cn(
                    "[.peer:hover+&]:opacity-0 [&:has(+_:hover)]:opacity-0",
                    {
                      "@[28rem]:hidden": layout === "inline",
                    },
                  )}
                />
              )}
              <Button
                data-id={action.id}
                variant="ghost"
                size="sm"
                onClick={() => toggleSelection(action.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={cn(
                  "peer group relative min-h-[44px] w-full justify-start text-left text-sm font-medium",
                  "rounded-none border-0 bg-transparent hover:bg-transparent! px-0 text-base shadow-none transition-none @[28rem]:text-sm",
                  { "@[28rem]:flex-1 @[28rem]:min-w-48": layout !== "stack" },
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 -mx-3 -my-0.5 rounded-lg bg-accent/60 group-active:bg-accent/80 opacity-0 group-hover:opacity-100",
                  )}
                />
                <div className="relative flex items-center gap-3">
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
            </Fragment>
          );
        })}
      </div>

      <div className={cn("flex items-center gap-4", alignClassButtons)}>
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
