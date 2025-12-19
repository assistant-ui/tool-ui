"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { PANEL_AUTO_SAVE_IDS } from "@/app/workbench/lib/persistence";
import { EditorPanel } from "./editor-panel";
import { PreviewPanel } from "./preview-panel";
import { ConfigPanel } from "./config-panel";

const LEFT_HANDLE_CLASSES =
  "group relative z-10 w-3 shrink-0 cursor-col-resize my-3 -mr-3";

const RIGHT_HANDLE_CLASSES =
  "group relative z-10 w-3 shrink-0 cursor-col-resize my-3 -ml-3";

const EDGE_HIGHLIGHT_CLASSES =
  "absolute inset-0 transition-colors group-hover:bg-neutral-200/60 group-data-[resize-handle-active]:bg-neutral-300/60 dark:group-hover:bg-neutral-700/60 dark:group-data-[resize-handle-active]:bg-neutral-600/60";

export function WorkbenchLayout() {
  return (
    <PanelGroup
      direction="horizontal"
      className="flex h-full w-full flex-row"
      autoSaveId={PANEL_AUTO_SAVE_IDS.WORKSPACE_HORIZONTAL}
    >
      <Panel collapsible defaultSize={25} minSize={10} collapsedSize={0}>
        <EditorPanel />
      </Panel>

      <PanelResizeHandle className={LEFT_HANDLE_CLASSES}>
        <div className={`${EDGE_HIGHLIGHT_CLASSES} rounded-l-xl`} />
      </PanelResizeHandle>

      <Panel defaultSize={50} minSize={30}>
        <div className="h-full py-3">
          <PreviewPanel />
        </div>
      </Panel>

      <PanelResizeHandle className={RIGHT_HANDLE_CLASSES}>
        <div className={`${EDGE_HIGHLIGHT_CLASSES} rounded-r-xl`} />
      </PanelResizeHandle>

      <Panel collapsible defaultSize={25} minSize={10} collapsedSize={0}>
        <ConfigPanel />
      </Panel>
    </PanelGroup>
  );
}
