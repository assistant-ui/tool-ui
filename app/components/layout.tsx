"use client";

import { ReactNode, useState } from "react";
import {
  Hammer,
  Home,
  Shapes,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComponentNav } from "./components/component-nav";
import { ComponentsProvider } from "./components-context";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import Link from "next/link";

function ComponentsHeader() {
  return (
    <header className="bg-wash flex shrink-0 items-center px-4 py-2">
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">ToolUI</h1>
        </Link>
        <Select defaultValue="components">
          <SelectTrigger
            size="sm"
            className="text-foreground bg-background data-[state=open]:bg-background/50 shadow-crisp-edge border-0 px-2 py-0 text-sm font-medium select-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <SelectValue aria-label="Components" />
          </SelectTrigger>
          <SelectContent className="min-w-44" align="start">
            <SelectItem value="components" className="px-4 py-2">
              <Shapes className="text-amber-600 dark:text-amber-500" />
              <span>Components</span>
            </SelectItem>
            <SelectItem value="builder" className="px-4 py-2">
              <Hammer className="text-green-600 dark:text-green-500" />
              <span>Builder</span>
            </SelectItem>
            <SelectItem value="home" className="px-4 py-2">
              <Home className="text-blue-600 dark:text-blue-500" />
              <span>Home</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");

  return (
    <ComponentsProvider value={{ viewport }}>
      <div className="flex h-screen min-h-0 flex-col">
        <ComponentsHeader />
        <div className="flex flex-1 overflow-hidden">
          <ComponentNav />
          <div className="flex flex-1 flex-col">{children}</div>
        </div>
        <ViewportControls viewport={viewport} onViewportChange={setViewport} />
      </div>
    </ComponentsProvider>
  );
}
