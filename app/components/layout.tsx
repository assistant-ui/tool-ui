"use client";

import { ReactNode, useState } from "react";
import { ComponentNav } from "./components/component-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import { SharedHeader } from "./shared-header";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="flex h-screen min-h-0 flex-col">
        <SharedHeader />
        <div className="flex flex-1 overflow-hidden">
          <ComponentNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
        <ViewportControls viewport={viewport} onViewportChange={setViewport} />
      </div>
    </ComponentsProvider>
  );
}
