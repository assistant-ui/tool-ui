"use client";

import { useCallback } from "react";
import {
  useWorkbenchStore,
  useIsTransitioning,
  useIsWidgetClosed,
  useSelectedComponent,
} from "@/app/workbench/lib/store";
import {
  VIEW_TRANSITION_PARENT_NAME,
  VIEW_TRANSITION_ROOT_NAME,
} from "@/app/workbench/lib/transition-config";
import { PreviewContent } from "./preview-views";
import { WidgetClosedOverlay } from "./widget-closed-overlay";
import { ModalOverlay } from "./modal-overlay";
import { PreviewToolbar } from "./preview-toolbar";

const COMPONENTS_WITH_OWN_MODAL = new Set(["poi-map"]);

export function PreviewPanel() {
  const isTransitioning = useIsTransitioning();
  const isWidgetClosed = useIsWidgetClosed();
  const setWidgetClosed = useWorkbenchStore((s) => s.setWidgetClosed);
  const view = useWorkbenchStore((s) => s.view);
  const setView = useWorkbenchStore((s) => s.setView);
  const selectedComponent = useSelectedComponent();

  const handleReopenWidget = useCallback(() => {
    setWidgetClosed(false);
  }, [setWidgetClosed]);

  const handleModalClose = useCallback(() => {
    setView(null);
  }, [setView]);

  return (
    <div
      className="bg-background relative flex h-full flex-col overflow-hidden rounded-2xl border dark:bg-neutral-900"
      style={
        {
          viewTransitionName: isTransitioning
            ? VIEW_TRANSITION_PARENT_NAME
            : undefined,
          viewTransitionGroup: isTransitioning
            ? VIEW_TRANSITION_ROOT_NAME
            : undefined,
        } as React.CSSProperties
      }
    >
      <PreviewToolbar />
      <div className="relative min-h-0 flex-1">
        <PreviewContent />
        {isWidgetClosed && (
          <WidgetClosedOverlay onReopen={handleReopenWidget} />
        )}
        {view?.mode === "modal" &&
          !COMPONENTS_WITH_OWN_MODAL.has(selectedComponent) && (
            <ModalOverlay view={view} onClose={handleModalClose} />
          )}
      </div>
    </div>
  );
}
