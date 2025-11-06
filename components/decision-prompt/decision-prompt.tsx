"use client";

import type { DecisionPromptProps } from "./schema";
import { DecisionPromptActions } from "./actions";
import { MultiSelectActions } from "./multi-select-actions";
import { DecisionPromptReceipt } from "./receipt";
import { cn } from "./_cn";

export function DecisionPrompt({
  prompt,
  actions,
  selectedAction,
  selectedActions,
  description,
  onAction = () => {},
  onMultiAction = () => {},
  onBeforeAction,
  confirmTimeout = 3000,
  align = "right",
  layout = "inline",
  multiSelect = false,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  minSelections = 1,
  maxSelections,
  className,
}: DecisionPromptProps) {
  const isCompleted = multiSelect
    ? selectedActions && selectedActions.length > 0
    : !!selectedAction;

  return (
    <div
      className={cn(
        "border-border bg-card text-card-foreground flex flex-col gap-4 rounded-lg border px-5 py-4 shadow-sm",
        isCompleted && "bg-muted/30",
        className,
      )}
      data-slot="decision-prompt"
      data-state={isCompleted ? "completed" : "active"}
    >
      <div className="flex flex-col gap-1.5">
        <p
          className={cn(
            "text-base leading-relaxed font-medium",
            isCompleted && "text-muted-foreground",
          )}
        >
          {prompt}
        </p>
        {description && (
          <p
            className={cn(
              "text-muted-foreground text-sm leading-relaxed",
              isCompleted && "opacity-60",
            )}
          >
            {description}
          </p>
        )}
      </div>

      {isCompleted ? (
        <DecisionPromptReceipt
          selectedAction={selectedAction}
          selectedActions={selectedActions}
          actions={actions}
          align={align}
          multiSelect={multiSelect}
        />
      ) : multiSelect ? (
        <MultiSelectActions
          actions={actions}
          onConfirm={onMultiAction}
          align={align}
          layout={layout}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          minSelections={minSelections}
          maxSelections={maxSelections}
        />
      ) : (
        <DecisionPromptActions
          actions={actions}
          onAction={onAction}
          onBeforeAction={onBeforeAction}
          confirmTimeout={confirmTimeout}
          align={align}
          layout={layout}
        />
      )}
    </div>
  );
}
