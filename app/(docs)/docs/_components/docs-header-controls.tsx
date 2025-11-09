"use client";

import { usePathname } from "next/navigation";
import { ViewportControls } from "@/components/viewport-controls";
import { useComponents } from "./components-context";

export function DocsHeaderControls() {
  const { viewport, setViewport } = useComponents();
  const pathname = usePathname();
  const isGallery = pathname === "/docs/gallery" || pathname === "/docs";

  return (
    <ViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons={!isGallery}
    />
  );
}
