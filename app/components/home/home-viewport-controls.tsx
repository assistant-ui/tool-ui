"use client";

import { ResizableViewportControls } from "@/app/components/resizable-viewport-controls";
import { useHomeStore } from "./home-store";

export function HomeViewportControls() {
  const viewport = useHomeStore((state) => state.viewport);
  const setViewport = useHomeStore((state) => state.setViewport);

  return (
    <ResizableViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons
    />
  );
}

