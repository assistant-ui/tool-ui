"use client";

import { memo, useCallback, type ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";
import { Check, Code, Copy, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/ui/cn";
import { useResponsivePreview } from "@/hooks/use-responsive-preview";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";
import { useCopyToClipboard } from "@/components/tool-ui/shared";
import { analytics } from "@/lib/analytics";

const PREVIEW_MIN_WIDTH = 40;
const PREVIEW_MAX_WIDTH = 100;

const VALID_VIEW_MODES = ["canvas", "chat", "code"] as const;
type ViewMode = (typeof VALID_VIEW_MODES)[number];

function ViewModeToggle({
  value,
  onValueChange,
}: {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as ViewMode)}
      size="sm"
      className="bg-primary/5 rounded-lg p-[3px]"
    >
      <ToggleGroupItem
        value="canvas"
        aria-label="View canvas"
        className="text-muted-foreground hover:text-primary data-[state=on]:bg-background data-[state=on]:text-foreground hover:bg-transparent data-[state=on]:rounded-md data-[state=on]:shadow-sm"
      >
        <Eye className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="chat"
        aria-label="View in chat context"
        className="text-muted-foreground hover:text-primary data-[state=on]:bg-background data-[state=on]:text-foreground hover:bg-transparent data-[state=on]:rounded-md data-[state=on]:shadow-sm"
      >
        <MessageCircle className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="code"
        aria-label="View code"
        className="text-muted-foreground hover:text-primary data-[state=on]:bg-background data-[state=on]:text-foreground hover:bg-transparent data-[state=on]:rounded-md data-[state=on]:shadow-sm"
      >
        <Code className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
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
  componentId: string;
  sidebar: ReactNode;
  preview: ReactNode;
  chatPanel: ReactNode;
  codePanel: ReactNode;
  code: string;
}

const COPY_ID = "code-panel";

export function ComponentPreviewShell({
  componentId,
  sidebar,
  preview,
  chatPanel,
  codePanel,
  code,
}: ComponentPreviewShellProps) {
  const { activeTab: viewMode, setActiveTab: setViewMode } =
    useTabSearchParam<ViewMode>({
      paramName: "view",
      defaultTab: "canvas",
      validTabs: VALID_VIEW_MODES,
    });
  const { copiedId, copy } = useCopyToClipboard();
  const copied = copiedId === COPY_ID;
  const { panelGroupRef, handleLayout } = useResponsivePreview({
    minWidth: PREVIEW_MIN_WIDTH,
    maxWidth: PREVIEW_MAX_WIDTH,
  });

  const handleCopy = useCallback(() => {
    analytics.component.codeCopied(componentId, "full");
    copy(code, COPY_ID);
  }, [componentId, code, copy]);

  return (
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
        <div className="z-10 flex min-h-0 flex-1 flex-col gap-4 px-3 pb-24">
          {sidebar}
        </div>
      </aside>

      {/* Main content area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Mobile toolbar */}
        <div className="flex flex-col gap-3 border-b px-4 pt-3 pb-3 lg:hidden">
          <div className="scrollbar-subtle overflow-x-auto">{sidebar}</div>
          <div className="flex items-center justify-end">
            <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
          </div>
        </div>

        <div
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-950",
            "z-10",
            "border lg:mr-4 lg:mb-4 lg:rounded-lg lg:border-l",
          )}
        >
          {viewMode === "canvas" && (
            <div
              className="bg-dot-grid pointer-events-none absolute inset-0 z-0 dark:opacity-60"
              aria-hidden="true"
            />
          )}

          {viewMode === "code" && (
            <div
              className={cn(
                "pointer-events-none absolute top-0 right-12 left-0 z-20 h-20",
                "bg-linear-to-b from-neutral-100 via-neutral-100/80 to-transparent dark:from-neutral-950 dark:via-neutral-950/80",
                "hidden lg:block",
              )}
              aria-hidden="true"
            />
          )}

          {/* View mode toggle - top left corner */}
          <div className="absolute top-3 left-3 z-30 hidden lg:block">
            <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
          </div>

          {/* Copy button - top right corner (code view only) */}
          {viewMode === "code" && (
            <div className="absolute top-3 right-3 z-30 hidden lg:block">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy code"}
                title={copied ? "Copied" : "Copy code"}
                className="size-8 shadow-sm"
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          )}

          <div
            className={cn(
              "scrollbar-subtle relative z-10",
              "flex min-h-0 min-w-0 flex-1",
              viewMode === "code"
                ? "flex-col"
                : "items-start justify-center overflow-y-auto",
            )}
          >
            {viewMode === "canvas" && (
              <div className="relative h-fit w-full p-4 pt-12 lg:pt-16">
                <ResizablePreviewArea
                  panelGroupRef={panelGroupRef}
                  handleLayout={handleLayout}
                >
                  {preview}
                </ResizablePreviewArea>
              </div>
            )}
            {viewMode === "chat" && (
              <div className="relative h-fit w-full p-4 pt-12 lg:pt-16">
                <div className="mx-auto max-w-2xl">{chatPanel}</div>
              </div>
            )}
            {viewMode === "code" && codePanel}
          </div>
        </div>
      </div>
    </div>
  );
}
