"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ComponentNav } from "./components/component-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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
  const isGallery =
    pathname === "/components/gallery" || pathname === "/components";

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="bg-background flex h-screen flex-col">
        {/* Header with logo and tabs */}
        <div className="bg-background flex">
          <div className="flex w-fit shrink-0 items-center justify-start px-6 py-3">
            <Link href="/">
              <h1 className="text-xl font-semibold tracking-wide">Tool UI</h1>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between px-6 py-3">
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isHome
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                Home
              </Link>
              <Link
                href="/components"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isComponents
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                Components
              </Link>
              <Link
                href="/builder"
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isBuilder
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                Builder
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <ViewportControls
                viewport={viewport}
                onViewportChange={setViewport}
                showThemeToggle
                showViewportButtons={!isGallery}
              />
              <div className="flex items-center">
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href="https://github.com/assistant-ui/tool-ui"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaGithub className="size-5" />
                    <span className="sr-only">GitHub Repository</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href="https://x.com/assistantui"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaXTwitter className="size-5" />
                    <span className="sr-only">X (Twitter)</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content area with sidebar and main */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="bg-background w-[200px] shrink-0 overflow-hidden">
            <ComponentNav />
          </div>

          {/* Main Content */}
          <div className="bg-background flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </ComponentsProvider>
  );
}
