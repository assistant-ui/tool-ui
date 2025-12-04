"use client";

import * as React from "react";
import Link from "next/link";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ConfigPanel } from "./config-panel";
import { UnifiedWorkspace } from "./unified-workspace";
import { InspectorPanel } from "./inspector-panel";
import { LogoMark } from "@/components/ui/logo";
import { ArrowLeft } from "lucide-react";

const WORKSPACE_MIN_SIZE = 50;
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
    }, 150);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="bg-background flex h-12 shrink-0 items-center gap-3 px-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground -ml-1 rounded-md p-1 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <LogoMark className="size-5 shrink-0" />
        <span className="-mb-0.5 font-mono text-sm font-medium">Workbench</span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={`scrollbar-subtle flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-in-out ${
            isPanelCollapsed ? "w-12" : "w-80"
          }`}
        >
          <div
            className={`h-full pt-4 transition-opacity duration-150 ${
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

        <div className="flex min-w-0 flex-1 flex-col overflow-clip rounded-tl-lg border-t border-l">
          <PanelGroup direction="vertical">
            <Panel
              defaultSize={100 - CONSOLE_DEFAULT_SIZE}
              minSize={WORKSPACE_MIN_SIZE}
            >
              <UnifiedWorkspace />
            </Panel>

            <PanelResizeHandle className="group relative h-2 shrink-0 border-t">
              <div className="absolute top-1/2 left-1/2 h-1 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
            </PanelResizeHandle>

            <Panel
              defaultSize={CONSOLE_DEFAULT_SIZE}
              minSize={CONSOLE_MIN_SIZE}
            >
              <InspectorPanel />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
}
