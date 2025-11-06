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
    <div className={cn("flex items-center gap-2", alignClass, className)} data-slot="receipt">
      <Badge
        variant="secondary"
        className="gap-1.5 text-muted-foreground"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {action.icon && <span>{action.icon}</span>}
        {action.label}
      </Badge>
    </div>
  );
}
