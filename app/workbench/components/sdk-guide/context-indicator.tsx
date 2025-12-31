"use client";

import { Layers } from "lucide-react";
import { useSelectedComponent } from "@/lib/workbench/store";
import { workbenchComponents } from "@/lib/workbench/component-registry";

export function ContextIndicator() {
  const selectedComponentId = useSelectedComponent();
  const component = workbenchComponents.find((c) => c.id === selectedComponentId);

  if (!component) {
    return null;
  }

  return (
    <div className="border-border/50 flex items-center gap-2 border-t px-4 py-2">
      <Layers className="text-muted-foreground size-3.5" />
      <span className="text-muted-foreground text-xs">
        Inspecting: <span className="text-foreground font-medium">{component.label}</span>
      </span>
    </div>
  );
}
