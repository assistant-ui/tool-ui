"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";

export default function BuilderLayout({
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
    <div className="grid h-screen grid-cols-[minmax(200px,240px)_1fr] grid-rows-[auto_1fr] bg-background">
      {/* A1: Logo - centered */}
      <div className="bg-background border-b border-r flex items-center justify-center px-6 py-3">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
        </Link>
      </div>

      {/* B1: Tabs */}
      <div className="bg-background border-b flex items-center px-6 py-3">
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
      </div>

      {/* A2: Empty sidebar for builder */}
      <div className="border-r bg-background" />

      {/* B2: Main Content */}
      <div className="overflow-hidden bg-background">
        {children}
      </div>

      <ViewportControls viewport={viewport} onViewportChange={setViewport} />
    </div>
  );
}
