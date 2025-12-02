"use client";

import { useMemo } from "react";
import {
  useWorkbenchStore,
  useDisplayMode,
  useSelectedComponent,
  useToolInput,
} from "@/lib/workbench/store";
import { getComponent } from "@/lib/workbench/component-registry";
import { OpenAIProvider } from "@/lib/workbench/openai-context";
import type { DisplayMode } from "@/lib/workbench/types";
import { cn } from "@/lib/ui/cn";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Display mode styles for the component container
 */
const displayModeStyles: Record<DisplayMode, string> = {
  inline: "relative h-full w-full",
  pip: "absolute bottom-4 right-4 h-64 w-96 rounded-lg shadow-2xl ring-1 ring-black/10 z-50",
  fullscreen: "absolute inset-0 z-50",
};

/**
 * Fallback component when the selected component isn't found
 */
function FallbackComponent({ componentId }: { componentId: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <div className="text-destructive text-sm font-medium">
          Component not found
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          &ldquo;{componentId}&rdquo; is not in the registry
        </div>
      </div>
    </div>
  );
}

/**
 * The actual component renderer that lives inside the OpenAI context
 */
function ComponentRenderer() {
  const selectedComponent = useSelectedComponent();
  const toolInput = useToolInput();

  // Get the component from registry
  const entry = useMemo(
    () => getComponent(selectedComponent),
    [selectedComponent]
  );

  // Merge default props with current toolInput
  const props = useMemo(
    () => ({
      ...(entry?.defaultProps ?? {}),
      ...toolInput,
    }),
    [entry?.defaultProps, toolInput]
  );

  if (!entry) {
    return <FallbackComponent componentId={selectedComponent} />;
  }

  const Component = entry.component;

  return <Component {...props} />;
}

export function CanvasFrame() {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchStore((s) => s.theme);
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);

  // Handle close for fullscreen/pip modes
  const handleClose = () => {
    setDisplayMode("inline");
  };

  return (
    <div className="bg-dot-grid bg-wash relative h-full w-full overflow-hidden">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-40"
        aria-hidden="true"
      />

      {/* Component container with display mode styling */}
      <div
        className={cn(
          displayModeStyles[displayMode],
          "overflow-auto",
          theme === "dark" ? "dark bg-gray-900" : "bg-white"
        )}
      >
        {/* Close button for pip/fullscreen */}
        {displayMode !== "inline" && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 size-8"
            onClick={handleClose}
          >
            <X className="size-4" />
          </Button>
        )}

        {/* Component wrapped in OpenAI context */}
        <div className="p-4">
          <OpenAIProvider>
            <ComponentRenderer />
          </OpenAIProvider>
        </div>
      </div>

      {/* Display mode indicator */}
      <div className="bg-background/80 text-muted-foreground absolute bottom-2 left-2 z-10 rounded px-2 py-1 text-xs backdrop-blur-sm">
        {displayMode} • {theme}
      </div>
    </div>
  );
}
