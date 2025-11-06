"use client";

import { ReactNode, useState } from "react";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import { SharedHeader } from "@/app/components/shared-header";

export default function BuilderLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <div className="flex h-screen min-h-0 flex-col bg-background">
      <SharedHeader />
      <div className="flex flex-1 overflow-hidden bg-background">{children}</div>
      <ViewportControls viewport={viewport} onViewportChange={setViewport} />
    </div>
  );
}
