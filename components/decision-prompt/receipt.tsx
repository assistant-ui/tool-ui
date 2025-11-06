"use client";

import { CheckCircle2 } from "lucide-react";
import type { DecisionPromptAction } from "./schema";
import { Badge } from "./_ui";
import { cn } from "./_cn";

interface DecisionPromptReceiptProps {
  selectedAction?: string;
  selectedActions?: string[];
  actions: DecisionPromptAction[];
  align?: "left" | "center" | "right";
  multiSelect?: boolean;
  className?: string;
}

export function DecisionPromptReceipt({
  selectedAction,
  selectedActions,
  actions,
  align = "right",
  multiSelect = false,
  className,
}: DecisionPromptReceiptProps) {
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

  // Multi-select mode
  if (multiSelect && selectedActions && selectedActions.length > 0) {
    const selectedActionObjs = actions.filter((a) =>
      selectedActions.includes(a.id),
    );

    return (
      <div
        className={cn("flex flex-wrap items-center gap-2", alignClass, className)}
        data-slot="receipt"
      >
        {selectedActionObjs.map((action) => (
          <Badge
            key={action.id}
            variant="secondary"
            className="gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </Badge>
        ))}
      </div>
    );
  }

  // Single-select mode
  const action = actions.find((a) => a.id === selectedAction);

  if (!action) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2.5", alignClass, className)} data-slot="receipt">
      <Badge
        variant="secondary"
        className="gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground"
      >
        <CheckCircle2 className="h-4 w-4" />
        {action.icon && <span>{action.icon}</span>}
        {action.label}
      </Badge>
    </div>
  );
}
