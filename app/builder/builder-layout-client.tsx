"use client";

import { ReactNode, useState } from "react";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import AppShell from "@/components/app-shell";

interface BuilderLayoutClientProps {
  children: ReactNode;
}

export function BuilderLayoutClient({ children }: BuilderLayoutClientProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <AppShell
      rightContent={
        <ViewportControls
          viewport={viewport}
          onViewportChange={setViewport}
          showThemeToggle
          showViewportButtons={false}
        />
      }
    >
      {children}
    </AppShell>
  );
}
