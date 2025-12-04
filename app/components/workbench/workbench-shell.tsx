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
      <div className="flex shrink-0 items-center gap-3 px-4 pt-3 pb-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-1.5 rounded-md p-1.5 transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <LogoMark className="size-5 shrink-0" />
        <span className="font-mono font-medium select-none">Workbench</span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-clip rounded-tr-lg border-t border-r">
          <PanelGroup direction="vertical">
            <Panel
              defaultSize={100 - CONSOLE_DEFAULT_SIZE}
              minSize={WORKSPACE_MIN_SIZE}
            >
              <UnifiedWorkspace />
            </Panel>

            <PanelResizeHandle className="group relative -mt-3 h-3 shrink-0 cursor-row-resize">
              <div className="bg-border absolute inset-x-0 bottom-0 h-px transition-colors group-hover:bg-neutral-400 group-data-resize-handle-active:bg-neutral-500 dark:group-hover:bg-neutral-500 dark:group-data-resize-handle-active:bg-neutral-400" />
            </PanelResizeHandle>

            <Panel
              defaultSize={CONSOLE_DEFAULT_SIZE}
              minSize={CONSOLE_MIN_SIZE}
            >
              <InspectorPanel />
            </Panel>
          </PanelGroup>
        </div>
        <aside
          className={`scrollbar-subtle flex h-full shrink-0 flex-col overflow-hidden transition-[width] duration-200 ease-in-out ${
            isPanelCollapsed ? "w-12" : "w-80"
          }`}
        >
          <div
            className={`h-full pt-2 transition-opacity duration-150 ${
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
      </div>
    </div>
  );
}
