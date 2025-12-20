"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/ui/cn";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { PANEL_AUTO_SAVE_IDS } from "@/app/workbench/lib/persistence";
import {
  useIsLeftPanelOpen,
  useWorkbenchStore,
} from "@/app/workbench/lib/store";
import { EditorPanel } from "./editor-panel";
import { PreviewPanel } from "./preview-panel";

const HANDLE_CLASSES = "group relative w-4 shrink-0";

const HIGHLIGHT_CLASSES =
  "absolute inset-y-0 w-px bg-linear-to-b from-transparent via-neutral-300 to-transparent opacity-0 group-hover:opacity-100 group-data-resize-handle-active:opacity-100 dark:via-neutral-500 transition-opacity duration-150";

export function WorkbenchLayout() {
  const leftPanelRef = useRef<ImperativePanelHandle>(null);

  const isLeftPanelOpen = useIsLeftPanelOpen();
  const setLeftPanelOpen = useWorkbenchStore((s) => s.setLeftPanelOpen);

  useEffect(() => {
    const panel = leftPanelRef.current;
    if (!panel) return;

    if (isLeftPanelOpen && panel.isCollapsed()) {
      panel.expand();
    } else if (!isLeftPanelOpen && panel.isExpanded()) {
      panel.collapse();
    }
  }, [isLeftPanelOpen]);

  return (
    <PanelGroup
      direction="horizontal"
      className="relative flex h-full w-full flex-row"
      autoSaveId={PANEL_AUTO_SAVE_IDS.WORKSPACE_HORIZONTAL}
    >
      <Panel
        ref={leftPanelRef}
        collapsible
        defaultSize={25}
        minSize={20}
        collapsedSize={0}
        maxSize={50}
        onCollapse={() => setLeftPanelOpen(false)}
        onExpand={() => setLeftPanelOpen(true)}
      >
        <EditorPanel />
      </Panel>

      <PanelResizeHandle
        className={cn(
          HANDLE_CLASSES,
          "z-20 -mr-px h-full w-px",
          isLeftPanelOpen ? "cursor-ew-resize" : "cursor-e-resize!",
        )}
        onClick={() => !isLeftPanelOpen && setLeftPanelOpen(true)}
      >
        <div className={`${HIGHLIGHT_CLASSES} right-0 z-10`} />
      </PanelResizeHandle>

      <Panel defaultSize={75} minSize={50}>
        <div
          className={cn("block h-full py-4 pt-0", !isLeftPanelOpen && "pl-4")}
        >
          <PreviewPanel />
        </div>
      </Panel>
    </PanelGroup>
  );
}
