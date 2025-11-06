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
    <div className="flex h-screen flex-col bg-background">
      {/* Header with logo and tabs */}
      <div className="flex border-b bg-background">
        <div className="border-r flex items-center justify-center px-6 py-3 w-[240px] shrink-0">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
          </Link>
        </div>
        <div className="flex items-center justify-between px-6 py-3 flex-1">
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
          <ViewportControls viewport={viewport} onViewportChange={setViewport} showThemeToggle showViewportButtons={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
