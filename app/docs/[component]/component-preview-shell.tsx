"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useResizableViewport } from "@/app/components/resizable-viewport-provider";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code, Eye } from "lucide-react";

const PREVIEW_MIN_SIZE = 40;
const PREVIEW_MAX_SIZE = 100;

interface ComponentPreviewShellProps {
  presetSelector: ReactNode;
  renderPreview: (isLoading: boolean) => ReactNode;
  renderCodePanel: (isLoading: boolean) => ReactNode;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  /**
   * If true, renders with the outer bordered container. When false, renders only the inner content
   * so it can be embedded in a parent container (e.g., within a Docs/Examples tab shell).
   */
  withContainer?: boolean;
}

export function ComponentPreviewShell({
  presetSelector,
  renderPreview,
  renderCodePanel,
  isLoading,
  onLoadingChange,
  withContainer = true,
}: ComponentPreviewShellProps) {
  const { viewport } = useResizableViewport();
  const [activeTab, setActiveTab] = useState("ui");
  const horizontalPanelGroupRef = useRef<
    import("react-resizable-panels").ImperativePanelGroupHandle | null
  >(null);
  const isSyncingHorizontalLayout = useRef(false);

  const handleHorizontalLayout = useCallback((sizes: number[]) => {
    if (!horizontalPanelGroupRef.current) return;
    if (isSyncingHorizontalLayout.current) {
      isSyncingHorizontalLayout.current = false;
      return;
    }

    const [left, center, right] = sizes;
    const clampedCenter = Math.min(
      PREVIEW_MAX_SIZE,
      Math.max(PREVIEW_MIN_SIZE, center),
    );
    const spacing = Math.max(0, (100 - clampedCenter) / 2);
    const epsilon = 0.5;

    const isSymmetric =
      Math.abs(left - spacing) < epsilon &&
      Math.abs(right - spacing) < epsilon &&
      Math.abs(center - clampedCenter) < epsilon;

    if (!isSymmetric) {
      isSyncingHorizontalLayout.current = true;
      horizontalPanelGroupRef.current.setLayout([
        spacing,
        clampedCenter,
        spacing,
      ]);
    }
  }, []);

  // Update panel layout when viewport changes
  useEffect(() => {
    if (!horizontalPanelGroupRef.current) return;

    const viewportSizes = {
      mobile: 50, // 50% for mobile (375px equivalent)
      desktop: 85, // 85% for desktop (full width)
    };

    const targetSize = viewportSizes[viewport];
    const spacing = Math.max(0, (100 - targetSize) / 2);

    isSyncingHorizontalLayout.current = true;
    horizontalPanelGroupRef.current.setLayout([spacing, targetSize, spacing]);
  }, [viewport]);

  const Shell = (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-clip">
      <aside className="bg-background scrollbar-subtle flex h-full w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="flex h-full flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4 pb-24">
            {presetSelector}
          </div>
        </div>
      </aside>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header with status and tabs */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-loading" className="text-sm">
              Loading
            </Label>
            <Switch
              id="preview-loading"
              checked={isLoading}
              onCheckedChange={onLoadingChange}
            />
          </div>
          <ButtonGroup className="bg-background rounded-md shadow-md">
            <Button
              variant={activeTab === "ui" ? "secondary" : "outline"}
              size="icon-lg"
              onClick={() => setActiveTab("ui")}
              title="UI view"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant={activeTab === "code" ? "secondary" : "outline"}
              size="icon-lg"
              onClick={() => setActiveTab("code")}
              title="Code view"
            >
              <Code className="size-4" />
            </Button>
          </ButtonGroup>
        </div>

        {/* Resizable preview area (outer container manages scroll) */}
        <div className="relative flex flex-1 items-start justify-center overflow-y-scroll px-2 py-6">
          {activeTab === "ui" && (
            <div
              className="bg-dot-grid bg-wash pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
              aria-hidden="true"
            />
          )}
          {activeTab === "ui" ? (
            <div className="relative h-fit w-full pt-12 lg:pt-16">
              <PanelGroup
                ref={horizontalPanelGroupRef}
                direction="horizontal"
                onLayout={handleHorizontalLayout}
              >
                <Panel defaultSize={7.5} minSize={0} />

                <PanelResizeHandle className="group relative w-4">
                  <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
                </PanelResizeHandle>

                <Panel
                  defaultSize={85}
                  minSize={PREVIEW_MIN_SIZE}
                  maxSize={PREVIEW_MAX_SIZE}
                >
                  <div className="border-border scrollbar-subtle relative rounded-xl border-2 border-dashed transition-all">
                    <div className="relative m-0 flex h-full flex-col p-4">
                      <div className="w-full">{renderPreview(isLoading)}</div>
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="group relative w-4">
                  <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
                </PanelResizeHandle>

                <Panel defaultSize={7.5} minSize={0} />
              </PanelGroup>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {renderCodePanel(isLoading)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (withContainer) {
    return <div className="rounded-tl-lg border-t border-l">{Shell}</div>;
  }

  return Shell;
}
