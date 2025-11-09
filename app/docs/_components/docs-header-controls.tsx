"use client";

import { usePathname } from "next/navigation";
import { ResizableViewportControls } from "@/app/components/resizable-viewport-controls";
import { useResizableViewport } from "@/app/components/resizable-viewport-provider";

export function DocsHeaderControls() {
  const { viewport, setViewport } = useResizableViewport();
  const pathname = usePathname();
  const isGallery = pathname === "/docs/gallery" || pathname === "/docs";

  return (
    <ResizableViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons={!isGallery}
    />
  );
}
