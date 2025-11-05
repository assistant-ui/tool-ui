"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Hammer,
  Home,
  Monitor,
  Shapes,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComponentNav } from "./components/component-nav";
import { PlaygroundProvider } from "./playground-context";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

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
      <div className="flex items-center gap-2">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">ToolUI</h1>
        </Link>
        <Select defaultValue="playground">
          <SelectTrigger
            size="sm"
            className="text-foreground bg-background data-[state=open]:bg-background/50 border-0 px-2 py-0 text-base font-medium select-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue aria-label="Playground" />
          </SelectTrigger>
          <SelectContent className="min-w-44" align="start">
            <SelectItem value="playground" className="px-4 py-2 text-base">
              <Shapes className="text-amber-600 dark:text-amber-500" />
              <span>Playground</span>
            </SelectItem>
            <SelectItem value="builder" className="px-4 py-2 text-base">
              <Hammer className="text-green-600 dark:text-green-500" />
              <span>Builder</span>
            </SelectItem>
            <SelectItem value="home" className="px-4 py-2 text-base">
              <Home className="text-blue-600 dark:text-blue-500" />
              <span>Home</span>
            </SelectItem>
          </SelectContent>
        </Select>
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
        <div className="flex flex-1 overflow-hidden">
          <ComponentNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
      </div>
    </PlaygroundProvider>
  );
}
