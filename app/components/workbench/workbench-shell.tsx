"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ConfigPanel } from "./config-panel";
import { CanvasFrame } from "./canvas-frame";
import { EventConsole } from "./event-console";

const CANVAS_MIN_SIZE = 50;
const CONSOLE_DEFAULT_SIZE = 25;
const CONSOLE_MIN_SIZE = 10;

export function WorkbenchShell() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Config Panel (fixed width) */}
      <aside className="bg-background scrollbar-subtle flex h-full w-80 shrink-0 flex-col overflow-hidden border-r">
        <ConfigPanel />
      </aside>

      {/* Right: Canvas + Console (vertical split) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PanelGroup direction="vertical">
          {/* Canvas Area */}
          <Panel defaultSize={100 - CONSOLE_DEFAULT_SIZE} minSize={CANVAS_MIN_SIZE}>
            <CanvasFrame />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="group relative h-2 shrink-0 border-t">
            <div className="absolute top-1/2 left-1/2 h-1 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
          </PanelResizeHandle>

          {/* Event Console */}
          <Panel defaultSize={CONSOLE_DEFAULT_SIZE} minSize={CONSOLE_MIN_SIZE}>
            <EventConsole />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
