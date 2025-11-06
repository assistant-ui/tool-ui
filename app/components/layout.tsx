"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ComponentNav } from "./components/component-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");
  const isBuilder = pathname.startsWith("/builder");

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="grid h-screen grid-cols-[minmax(200px,240px)_1fr] grid-rows-[auto_1fr] bg-background">
        {/* A1: Logo - centered */}
        <div className="bg-background border-b border-r flex items-center justify-center px-6 py-3">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
          </Link>
        </div>

        {/* B1: Tabs */}
        <div className="bg-background border-b flex items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isHome
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Home
            </Link>
            <Link
              href="/components"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isComponents
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Components
            </Link>
            <Link
              href="/builder"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isBuilder
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Builder
            </Link>
          </nav>
          <ViewportControls viewport={viewport} onViewportChange={setViewport} showThemeToggle />
        </div>

        {/* A2: Sidebar Navigation */}
        <div className="border-r overflow-hidden bg-background">
          <ComponentNav />
        </div>

        {/* B2: Main Content */}
        <div className="overflow-auto bg-background">
          {children}
        </div>
      </div>
    </ComponentsProvider>
  );
}
