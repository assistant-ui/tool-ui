"use client";

import { ResizableViewportControls } from "@/app/components/builder/resizable-viewport-controls";
import { useHomeStore } from "./home-store";

type HomeViewportControlsProps = {
  showThemeToggle?: boolean;
  showViewportButtons?: boolean;
};

export function HomeViewportControls({
  showThemeToggle = true,
  showViewportButtons = true,
}: HomeViewportControlsProps) {
  const viewport = useHomeStore((state) => state.viewport);
  const setViewport = useHomeStore((state) => state.setViewport);

  return (
    <ResizableViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle={showThemeToggle}
      showViewportButtons={showViewportButtons}
    />
  );
}
