"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ComponentNav } from "./components/component-nav";
import { PlaygroundProvider } from "./playground-context";
import { ThemeToggle } from "@/components/theme-toggle";

type ViewportSize = "mobile" | "tablet" | "desktop";

export default function PlaygroundLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <PlaygroundProvider value={{ viewport }}>
      <div className="flex h-screen flex-col">
        {/* Header - Spans full width */}
        <header className="bg-background flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">ToolUI Playground</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Viewport Controls */}
            <div className="flex gap-1 rounded-md border p-1">
              <Button
                variant={viewport === "mobile" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("mobile")}
                title="Mobile view"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button
                variant={viewport === "tablet" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("tablet")}
                title="Tablet view"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewport === "desktop" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewport("desktop")}
                title="Desktop view"
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content - Navigation + Page Content */}
        <div className="flex flex-1 overflow-hidden">
          <ComponentNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </PlaygroundProvider>
  );
}
