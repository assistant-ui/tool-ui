"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import AppShell from "@/components/app-shell";
import { DocsNav } from "./components/docs-nav";

interface ComponentsLayoutClientProps {
  children: ReactNode;
}

export function ComponentsLayoutClient({ children }: ComponentsLayoutClientProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const pathname = usePathname();
  const isGallery = pathname === "/docs/gallery" || pathname === "/docs";

  return (
    <ComponentsProvider value={{ viewport }}>
      <AppShell
        rightContent={
          <ViewportControls
            viewport={viewport}
            onViewportChange={setViewport}
            showThemeToggle
            showViewportButtons={!isGallery}
          />
        }
        sidebar={<DocsNav />}
      >
        {children}
      </AppShell>
    </ComponentsProvider>
  );
}
