"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { DocsNav } from "./components/docs-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import { ResponsiveHeader } from "@/components/responsive-header";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const pathname = usePathname();

  const isGallery = pathname === "/docs/gallery" || pathname === "/docs";

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="flex h-screen flex-col">
        {/* Header with logo and tabs */}
        <ResponsiveHeader
          rightContent={
            <ViewportControls
              viewport={viewport}
              onViewportChange={setViewport}
              showThemeToggle
              showViewportButtons={!isGallery}
            />
          }
        />

        {/* Content area with sidebar and main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation - hidden on mobile, visible on md and up */}
          <div className="bg-background hidden w-[240px] shrink-0 overflow-hidden md:block">
            <DocsNav />
          </div>

          {/* Main Content */}
          <div className="bg-background flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </ComponentsProvider>
  );
}
