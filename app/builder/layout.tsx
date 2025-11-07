"use client";

import { ReactNode, useState } from "react";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import { ResponsiveHeader } from "@/components/responsive-header";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header with logo and tabs */}
      <ResponsiveHeader
        rightContent={
          <ViewportControls
            viewport={viewport}
            onViewportChange={setViewport}
            showThemeToggle
            showViewportButtons={false}
          />
        }
      />

      {/* Main Content */}
      <div className="bg-background flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
