"use client";

import type { DecisionPromptProps } from "./schema";
import { DecisionPromptActions } from "./actions";
import { DecisionPromptReceipt } from "./receipt";
import { cn } from "./_cn";

export function DecisionPrompt({
  prompt,
  actions,
  selectedAction,
  description,
  onAction = () => {},
  onBeforeAction,
  confirmTimeout = 3000,
  align = "right",
  className,
}: DecisionPromptProps) {
  const isCompleted = !!selectedAction;

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
          actions={actions}
          align={align}
        />
      ) : (
        <DecisionPromptActions
          actions={actions}
          onAction={onAction}
          onBeforeAction={onBeforeAction}
          confirmTimeout={confirmTimeout}
          align={align}
        />
      )}
    </div>
  );
}
