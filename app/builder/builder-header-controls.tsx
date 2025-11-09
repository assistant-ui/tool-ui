"use client";

import { ResizableViewportControls } from "@/components/resizable-viewport-controls";
import { useResizableViewport } from "@/components/resizable-viewport-provider";

export function BuilderHeaderControls() {
  const { viewport, setViewport } = useResizableViewport();

  return (
    <ResizableViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons={false}
    />
  );
}
