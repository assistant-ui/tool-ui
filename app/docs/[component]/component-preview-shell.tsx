"use client";

import { memo, useState, type ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code, Eye } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { useResponsivePreview } from "@/hooks/use-responsive-preview";

const PREVIEW_MIN_WIDTH = 40;
const PREVIEW_MAX_WIDTH = 100;

type ViewMode = "preview" | "code";

function ViewModeTabs({
  value,
  onValueChange,
}: {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => {
        if (v === "preview" || v === "code") onValueChange(v);
      }}
    >
      <TabsList className="bg-background shadow-md">
        <TabsTrigger value="preview" className="gap-1.5">
          <Eye className="size-4" />
          <span className="sr-only sm:not-sr-only">Preview</span>
        </TabsTrigger>
        <TabsTrigger value="code" className="gap-1.5">
          <Code className="size-4" />
          <span className="sr-only sm:not-sr-only">Code</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

const RESIZE_HANDLE_STYLES = cn(
  "absolute top-1/2 left-1/2 h-12 w-1",
  "-translate-x-1/2 -translate-y-1/2 rounded-full",
  "transition-all duration-200",
  "bg-gray-300 opacity-0",
  "group-hover/canvas:opacity-60",
  "group-data-resize-handle-active/handle:bg-gray-500 group-data-resize-handle-active/handle:opacity-100",
  "dark:bg-gray-500 dark:group-data-resize-handle-active/handle:bg-gray-400",
);

const ResizablePreviewArea = memo(function ResizablePreviewArea({
  panelGroupRef,
  handleLayout,
  children,
}: {
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
  children: ReactNode;
}) {
  return (
    <PanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      onLayout={handleLayout}
      className="group/canvas"
    >
      <Panel defaultSize={7.5} minSize={0} />
      <PanelResizeHandle className="group/handle relative w-4">
        <div className={RESIZE_HANDLE_STYLES} />
      </PanelResizeHandle>
      <Panel
        defaultSize={85}
        minSize={PREVIEW_MIN_WIDTH}
        maxSize={PREVIEW_MAX_WIDTH}
      >
        <div className={cn("scrollbar-subtle relative", "transition-all")}>
          {children}
        </div>
      </Panel>
      <PanelResizeHandle className="group/handle relative w-4">
        <div className={RESIZE_HANDLE_STYLES} />
      </PanelResizeHandle>
      <Panel defaultSize={7.5} minSize={0} />
    </PanelGroup>
  );
});

interface ComponentPreviewShellProps {
  presetSelector: ReactNode;
  renderPreview: (isLoading: boolean) => ReactNode;
  renderCodePanel: (isLoading: boolean) => ReactNode;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  supportsLoading?: boolean;
  withContainer?: boolean;
}

export function ComponentPreviewShell({
  presetSelector,
  renderPreview,
  renderCodePanel,
  isLoading,
  onLoadingChange,
  supportsLoading = false,
  withContainer = true,
}: ComponentPreviewShellProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const { panelGroupRef, handleLayout } = useResponsivePreview({
    minWidth: PREVIEW_MIN_WIDTH,
    maxWidth: PREVIEW_MAX_WIDTH,
  });

  const content = (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-clip lg:flex-row">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "bg-background scrollbar-subtle",
          "hidden h-full w-72 shrink-0 flex-col",
          "overflow-x-hidden overflow-y-auto overscroll-contain",
          "lg:flex",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4 pb-24">
          {presetSelector}
        </div>
      </aside>

      {/* Main content area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Desktop toolbar */}
        <div
          className={cn(
            "absolute top-0 right-0 left-0 z-20",
            "hidden items-center px-6 py-3",
            supportsLoading ? "justify-between" : "justify-end",
            "lg:flex",
          )}
        >
          {supportsLoading && (
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
          )}
          <ViewModeTabs value={viewMode} onValueChange={setViewMode} />
        </div>

        {/* Mobile toolbar */}
        <div className="flex flex-col gap-3 border-b px-4 pt-3 pb-3 lg:hidden">
          <div className="scrollbar-subtle overflow-x-auto">
            {presetSelector}
          </div>
          <div className="flex items-center justify-end">
            <ViewModeTabs value={viewMode} onValueChange={setViewMode} />
          </div>
        </div>

        {/* Preview/Code area */}
        <div
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            "lg:border-l",
          )}
        >
          {viewMode === "preview" && (
            <div
              className="bg-dot-grid bg-wash pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-40"
              aria-hidden="true"
            />
          )}

          <div
            className={cn(
              "scrollbar-subtle relative z-10",
              "flex min-h-0 min-w-0 flex-1 items-start justify-center overflow-y-auto",
            )}
          >
            {viewMode === "preview" ? (
              <div className="relative h-fit w-full p-4 lg:pt-16">
                <ResizablePreviewArea
                  panelGroupRef={panelGroupRef}
                  handleLayout={handleLayout}
                >
                  {renderPreview(isLoading)}
                </ResizablePreviewArea>
              </div>
            ) : (
              <div className="relative h-full w-full min-w-0 p-4 lg:pt-16">
                {renderCodePanel(isLoading)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (withContainer) {
    return <div className="rounded-t-lg border">{content}</div>;
  }

  return content;
}
