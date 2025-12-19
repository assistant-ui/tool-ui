"use client";

import { useEffect, useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { PANEL_AUTO_SAVE_IDS } from "@/app/workbench/lib/persistence";
import {
  useIsLeftPanelOpen,
  useIsRightPanelOpen,
  useWorkbenchStore,
} from "@/app/workbench/lib/store";
import { EditorPanel } from "./editor-panel";
import { PreviewPanel } from "./preview-panel";
import { ConfigPanel } from "./config-panel";

const LEFT_HANDLE_CLASSES =
  "group relative z-10 w-3 shrink-0 cursor-col-resize -mr-3";

const RIGHT_HANDLE_CLASSES =
  "group relative z-10 w-3 shrink-0 cursor-col-resize -ml-3";

const EDGE_HIGHLIGHT_CLASSES =
  "absolute inset-0 transition-colors group-hover:bg-neutral-200/60 group-data-[resize-handle-active]:bg-neutral-300/60 dark:group-hover:bg-neutral-700/60 dark:group-data-[resize-handle-active]:bg-neutral-600/60";

export function WorkbenchLayout() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const isLeftPanelOpen = useIsLeftPanelOpen();
  const isRightPanelOpen = useIsRightPanelOpen();
  const setLeftPanelOpen = useWorkbenchStore((s) => s.setLeftPanelOpen);
  const setRightPanelOpen = useWorkbenchStore((s) => s.setRightPanelOpen);

  useEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    if (isLeftPanelOpen && panel.isCollapsed()) {
      panel.expand();
    } else if (!isLeftPanelOpen && panel.isExpanded()) {
      panel.collapse();
    }
  }, [isLeftPanelOpen]);

  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (isRightPanelOpen && panel.isCollapsed()) {
      panel.expand();
    } else if (!isRightPanelOpen && panel.isExpanded()) {
      panel.collapse();
    }
  }, [isRightPanelOpen]);

  return (
    <PanelGroup
      direction="horizontal"
      className="flex h-full w-full flex-row"
      autoSaveId={PANEL_AUTO_SAVE_IDS.WORKSPACE_HORIZONTAL}
    >
      <Panel
        ref={leftPanelRef}
        collapsible
        defaultSize={25}
        minSize={10}
        collapsedSize={0}
        onCollapse={() => setLeftPanelOpen(false)}
        onExpand={() => setLeftPanelOpen(true)}
      >
        <EditorPanel />
      </Panel>

      <PanelResizeHandle className={LEFT_HANDLE_CLASSES}>
        <div className={`${EDGE_HIGHLIGHT_CLASSES} rounded-l-xl`} />
      </PanelResizeHandle>

      <Panel defaultSize={50} minSize={30}>
        <PreviewPanel />
      </Panel>

      <PanelResizeHandle className={RIGHT_HANDLE_CLASSES}>
        <div className={`${EDGE_HIGHLIGHT_CLASSES} rounded-r-xl`} />
      </PanelResizeHandle>

      <Panel
        ref={rightPanelRef}
        collapsible
        defaultSize={25}
        minSize={10}
        collapsedSize={0}
        onCollapse={() => setRightPanelOpen(false)}
        onExpand={() => setRightPanelOpen(true)}
      >
        <ConfigPanel />
      </Panel>
    </PanelGroup>
  );
}
