"use client";

import { ResizableViewportControls } from "@/app/components/resizable-viewport-controls";
import { useResizableViewport } from "@/app/components/resizable-viewport-provider";

export function DocsHeaderControls() {
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
