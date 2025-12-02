"use client";

import * as React from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ConfigPanel } from "./config-panel";
import { CanvasFrame } from "./canvas-frame";
import { JsonPanel } from "./json-panel";
import { InspectorPanel } from "./inspector-panel";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";

const CANVAS_MIN_SIZE = 40;
const JSON_DEFAULT_SIZE = 40;
const JSON_MIN_SIZE = 20;
const CONSOLE_DEFAULT_SIZE = 25;
const CONSOLE_MIN_SIZE = 10;

export function WorkbenchShell() {
  const [isPanelCollapsed, setIsPanelCollapsed] = React.useState(false);
  const [isFading, setIsFading] = React.useState(false);

  const handleToggleCollapse = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsPanelCollapsed(!isPanelCollapsed);
      setIsFading(false);
    }, 150); // Match the fade-out duration
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Title bar */}
      <div className="bg-background flex h-10 shrink-0 items-center gap-3 border-b px-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md p-1 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <LogoMark className="size-5 shrink-0" />
        <span className="text-sm font-medium">Workbench</span>
      </div>

      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Config Panel (collapsible) */}
        <aside
          className={`bg-background scrollbar-subtle flex h-full shrink-0 flex-col overflow-hidden border-r transition-[width] duration-200 ease-in-out ${
            isPanelCollapsed ? "w-12" : "w-80"
          }`}
        >
          <div
            className={`h-full transition-opacity duration-150 ${
              isFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <ConfigPanel
              key={isPanelCollapsed ? "collapsed" : "expanded"}
              isCollapsed={isPanelCollapsed}
              onToggleCollapse={handleToggleCollapse}
            />
          </div>
        </aside>

        {/* Right: Nested panel groups for JSON + Canvas (horizontal) and Inspector (vertical) */}
        <div className="flex min-w-0 flex-1 flex-col">
          <PanelGroup direction="vertical">
          {/* Top: Playground = JSON editor + preview */}
          <Panel defaultSize={100 - CONSOLE_DEFAULT_SIZE} minSize={CANVAS_MIN_SIZE}>
            <PanelGroup direction="horizontal">
              {/* Left: JSON Panel */}
              <Panel defaultSize={JSON_DEFAULT_SIZE} minSize={JSON_MIN_SIZE}>
                <JsonPanel />
              </Panel>

              {/* Vertical resize handle between JSON and Canvas */}
              <PanelResizeHandle className="group relative w-2 shrink-0 border-l">
                <div className="absolute top-1/2 left-1/2 h-16 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
              </PanelResizeHandle>

              {/* Right: Canvas */}
              <Panel defaultSize={100 - JSON_DEFAULT_SIZE} minSize={CANVAS_MIN_SIZE}>
                <CanvasFrame />
              </Panel>
            </PanelGroup>
          </Panel>

          {/* Horizontal resize handle between playground and inspector */}
          <PanelResizeHandle className="group relative h-2 shrink-0 border-t">
            <div className="absolute top-1/2 left-1/2 h-1 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
          </PanelResizeHandle>

          {/* Bottom: Inspector (Console and future tabs) */}
          <Panel defaultSize={CONSOLE_DEFAULT_SIZE} minSize={CONSOLE_MIN_SIZE}>
            <InspectorPanel />
          </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}
