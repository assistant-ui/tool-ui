"use client";

import { cn } from "@/lib/ui/cn";
import { LayoutGrid, Sliders } from "lucide-react";

export type ViewMode = "condition" | "parameter";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
      <button
        onClick={() => onChange("condition")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
          value === "condition"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sliders className="size-3.5" />
        <span>Condition</span>
      </button>
      <button
        onClick={() => onChange("parameter")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
          value === "parameter"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-3.5" />
        <span>Parameter</span>
      </button>
    </div>
  );
}
