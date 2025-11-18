"use client";

import type { DecisionPromptProps } from "./schema";
import { DecisionPromptActions } from "./actions";
import { MultiSelectActions } from "./multi-select-actions";
import { DecisionPromptReceipt } from "./receipt";
import { cn } from "./_cn";

export function DecisionPrompt({
  prompt: _prompt,
  actions,
  selectedAction,
  selectedActions,
  description: _description,
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
      className={cn("@container", className)}
      data-slot="decision-prompt"
      data-state={isCompleted ? "completed" : "active"}
    >
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
