"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ComponentNav } from "./components/component-nav";
import { PlaygroundProvider } from "./playground-context";
import { ThemeToggle } from "@/components/theme-toggle";

type ViewportSize = "mobile" | "tablet" | "desktop";

function PlaygroundHeader({
  viewport,
  onViewportChange,
}: {
  viewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
}) {
  return (
    <header className="bg-wash flex shrink-0 items-center justify-between px-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-lg">ToolUI / Playground</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Viewport Controls */}
        <div className="flex gap-1 rounded-md border p-1">
          <Button
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewportChange("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "tablet" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewportChange("tablet")}
            title="Tablet view"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => onViewportChange("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function PlaygroundLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <PlaygroundProvider value={{ viewport }}>
      <div className="flex h-screen min-h-0 flex-col">
        <PlaygroundHeader viewport={viewport} onViewportChange={setViewport} />
        <div className="flex overflow-hidden">
          <ComponentNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </PlaygroundProvider>
  );
}
