"use client";

import { CheckCircle2 } from "lucide-react";
import type { DecisionPromptAction } from "./schema";
import { Badge } from "./_ui";
import { cn } from "./_cn";

interface DecisionPromptReceiptProps {
  selectedAction: string;
  actions: DecisionPromptAction[];
  align?: "left" | "center" | "right";
  className?: string;
}

export function DecisionPromptReceipt({
  selectedAction,
  actions,
  align = "right",
  className,
}: DecisionPromptReceiptProps) {
  const action = actions.find((a) => a.id === selectedAction);

  if (!action) {
    return null;
  }

  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[align];

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
