"use client";

import { memo, useCallback, useState, type ReactNode } from "react";
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

interface ViewModeTabsProps {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}

const ViewModeTabs = memo(function ViewModeTabs({
  value,
  onValueChange,
}: ViewModeTabsProps) {
  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue === "preview" || newValue === "code") {
        onValueChange(newValue);
      }
    },
    [onValueChange],
  );

  return (
    <Tabs value={value} onValueChange={handleValueChange}>
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
});

const RESIZE_HANDLE_STYLES = cn(
  "absolute top-1/2 left-1/2 h-12 w-1",
  "-translate-x-1/2 -translate-y-1/2 rounded-full",
  "transition-all",
  "bg-gray-300 opacity-40",
  "group-hover:bg-gray-400 group-hover:opacity-100",
  "group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100",
  "dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400",
);

interface PreviewPanelProps {
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
  children: ReactNode;
}

const PreviewPanel = memo(function PreviewPanel({
  panelGroupRef,
  handleLayout,
  children,
}: PreviewPanelProps) {
  return (
    <div className="relative h-fit w-full p-4 lg:pt-16">
      <PanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        onLayout={handleLayout}
      >
        <Panel defaultSize={7.5} minSize={0} />

        <PanelResizeHandle className="group relative w-4">
          <div className={RESIZE_HANDLE_STYLES} />
        </PanelResizeHandle>

        <Panel
          defaultSize={85}
          minSize={PREVIEW_MIN_WIDTH}
          maxSize={PREVIEW_MAX_WIDTH}
        >
          <div
            className={cn(
              "border-border scrollbar-subtle relative",
              "rounded-xl border-2 border-dashed p-4",
              "transition-all",
            )}
          >
            {children}
          </div>
        </Panel>

        <PanelResizeHandle className="group relative w-4">
          <div className={RESIZE_HANDLE_STYLES} />
        </PanelResizeHandle>

        <Panel defaultSize={7.5} minSize={0} />
      </PanelGroup>
    </div>
  );
});

interface ShellContentProps {
  presetSelector: ReactNode;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
  previewContent: ReactNode;
  codeContent: ReactNode;
}

const ShellContent = memo(function ShellContent({
  presetSelector,
  viewMode,
  onViewModeChange,
  isLoading,
  onLoadingChange,
  panelGroupRef,
  handleLayout,
  previewContent,
  codeContent,
}: ShellContentProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-clip lg:flex-row">
      <aside
        className={cn(
          "bg-background scrollbar-subtle",
          "hidden h-full w-72 shrink-0 flex-col",
          "overflow-x-hidden overflow-y-auto overscroll-contain",
          "lg:flex",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-4 pb-24">
            {presetSelector}
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "absolute top-0 right-0 left-0 z-20",
            "hidden items-center justify-between px-6 py-3",
            "lg:flex",
          )}
        >
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-loading-desktop" className="text-sm">
              Loading
            </Label>
            <Switch
              id="preview-loading-desktop"
              checked={isLoading}
              onCheckedChange={onLoadingChange}
            />
          </div>
          <ViewModeTabs value={viewMode} onValueChange={onViewModeChange} />
        </div>

        <div className="flex flex-col gap-3 border-b px-4 pt-3 pb-3 lg:hidden">
          <div className="scrollbar-subtle overflow-x-auto">
            {presetSelector}
          </div>
          <div className="flex items-center justify-end">
            <ViewModeTabs value={viewMode} onValueChange={onViewModeChange} />
          </div>
        </div>

        <div
          className={cn(
            "relative flex min-h-0 flex-1 flex-col overflow-hidden",
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
              "flex min-h-0 flex-1 items-start justify-center overflow-y-auto",
            )}
          >
            {viewMode === "preview" ? (
              <PreviewPanel
                panelGroupRef={panelGroupRef}
                handleLayout={handleLayout}
              >
                {previewContent}
              </PreviewPanel>
            ) : (
              <div className="relative h-full w-full p-4 lg:pt-16">
                {codeContent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

interface ComponentPreviewShellProps {
  presetSelector: ReactNode;
  renderPreview: (isLoading: boolean) => ReactNode;
  renderCodePanel: (isLoading: boolean) => ReactNode;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
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
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const { panelGroupRef, handleLayout } = useResponsivePreview({
    minWidth: PREVIEW_MIN_WIDTH,
    maxWidth: PREVIEW_MAX_WIDTH,
  });

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const shell = (
    <ShellContent
      presetSelector={presetSelector}
      viewMode={viewMode}
      onViewModeChange={handleViewModeChange}
      isLoading={isLoading}
      onLoadingChange={onLoadingChange}
      panelGroupRef={panelGroupRef}
      handleLayout={handleLayout}
      previewContent={renderPreview(isLoading)}
      codeContent={renderCodePanel(isLoading)}
    />
  );

  if (withContainer) {
    return <div className="rounded-t-lg border">{shell}</div>;
  }

  return shell;
}
