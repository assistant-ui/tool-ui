"use client";

import { useMemo, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import {
  useWorkbenchStore,
  useActiveJsonTab,
  useDisplayMode,
  useIsTransitioning,
  useSelectedComponent,
  useToolInput,
  useOpenAIGlobals,
  useDeviceType,
  type ActiveJsonTab,
} from "@/lib/workbench/store";
import { DEVICE_PRESETS } from "@/lib/workbench/types";
import { getComponent } from "@/lib/workbench/component-registry";
import { OpenAIProvider } from "@/lib/workbench/openai-context";
import { JsonEditor, ReadOnlyJsonView } from "./json-editor";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TAB_TRIGGER_CLASSES } from "./styles";
import {
  VIEW_TRANSITION_NAME,
  VIEW_TRANSITION_PARENT_NAME,
  VIEW_TRANSITION_ROOT_NAME,
} from "@/lib/workbench/transition-config";
import { PANEL_AUTO_SAVE_IDS } from "@/lib/workbench/persistence";
import { ComponentErrorBoundary } from "./component-error-boundary";
import { IsolatedThemeWrapper } from "./isolated-theme-wrapper";
import { PipView } from "./pip-view";
import { MockComposer } from "./mock-composer";

const PREVIEW_MIN_SIZE = 30;
const PREVIEW_MAX_SIZE = 100;

const TAB_LABELS: Record<ActiveJsonTab, string> = {
  toolInput: "Tool Input",
  toolOutput: "Tool Output",
  widgetState: "Widget State",
  toolResponseMetadata: "Metadata",
  window: "Window",
};

function FallbackComponent({ componentId }: { componentId: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center">
        <div className="text-destructive text-sm font-medium">
          Component not found
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          &ldquo;{componentId}&rdquo; is not in the registry
        </div>
      </div>
    </div>
  );
}

function ComponentRenderer() {
  const selectedComponent = useSelectedComponent();
  const toolInput = useToolInput();

  const entry = useMemo(
    () => getComponent(selectedComponent),
    [selectedComponent],
  );

  const props = useMemo(
    () => ({
      ...(entry?.defaultProps ?? {}),
      ...toolInput,
    }),
    [entry?.defaultProps, toolInput],
  );

  if (!entry) {
    return <FallbackComponent componentId={selectedComponent} />;
  }

  const Component = entry.component;
  return <Component {...props} />;
}

function ComponentContent({ className }: { className?: string }) {
  const toolInput = useToolInput();

  return (
    <IsolatedThemeWrapper className={cn("flex", className)}>
      <OpenAIProvider>
        <ComponentErrorBoundary toolInput={toolInput}>
          <div className="h-full w-full">
            <ComponentRenderer />
          </div>
        </ComponentErrorBoundary>
      </OpenAIProvider>
    </IsolatedThemeWrapper>
  );
}

function MorphContainer({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isTransitioning = useIsTransitioning();

  return (
    <div
      className={className}
      style={
        {
          ...style,
          viewTransitionName: isTransitioning
            ? VIEW_TRANSITION_NAME
            : undefined,
          viewTransitionGroup: isTransitioning
            ? VIEW_TRANSITION_PARENT_NAME
            : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

const RESIZE_HANDLE_CLASSES =
  "absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400";

function PreviewResizeHandle({
  isTransitioning,
}: {
  isTransitioning: boolean;
}) {
  return (
    <PanelResizeHandle
      className={cn(
        "group relative w-4 transition-opacity",
        isTransitioning ? "opacity-0 duration-50" : "opacity-100 duration-300",
      )}
    >
      <div className={RESIZE_HANDLE_CLASSES} />
    </PanelResizeHandle>
  );
}

function InlineView() {
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);
  const deviceType = useDeviceType();
  const isTransitioning = useIsTransitioning();
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncingLayout = useRef(false);

  const devicePreset = DEVICE_PRESETS[deviceType];

  useEffect(() => {
    if (!panelGroupRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let centerSize: number;

    if (devicePreset.width === "100%") {
      centerSize = 90;
    } else {
      const targetWidth = devicePreset.width + 32;
      centerSize = Math.min(
        PREVIEW_MAX_SIZE,
        Math.max(PREVIEW_MIN_SIZE, (targetWidth / containerWidth) * 100),
      );
    }

    const spacing = (100 - centerSize) / 2;
    isSyncingLayout.current = true;
    panelGroupRef.current.setLayout([spacing, centerSize, spacing]);
  }, [devicePreset.width]);

  const handleLayout = useCallback((sizes: number[]) => {
    if (!panelGroupRef.current) return;
    if (isSyncingLayout.current) {
      isSyncingLayout.current = false;
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
      isSyncingLayout.current = true;
      panelGroupRef.current.setLayout([spacing, clampedCenter, spacing]);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="scrollbar-subtle h-full w-full overflow-auto p-4"
    >
      <div className="flex min-h-full w-full items-start justify-center">
        <PanelGroup
          ref={panelGroupRef}
          direction="horizontal"
          onLayout={handleLayout}
          className="w-full"
        >
          <Panel defaultSize={5} minSize={0} />
          <PreviewResizeHandle isTransitioning={isTransitioning} />
          <Panel
            defaultSize={90}
            minSize={PREVIEW_MIN_SIZE}
            maxSize={PREVIEW_MAX_SIZE}
          >
            <MorphContainer
              className="overflow-hidden rounded-xl"
              style={{ height: maxHeight }}
            >
              <ComponentContent className="h-full" />
            </MorphContainer>
          </Panel>
          <PreviewResizeHandle isTransitioning={isTransitioning} />
          <Panel defaultSize={5} minSize={0} />
        </PanelGroup>
      </div>
    </div>
  );
}

function FullscreenView() {
  const deviceType = useDeviceType();
  const devicePreset = DEVICE_PRESETS[deviceType];
  const isFixedWidth = typeof devicePreset.width === "number";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        isFixedWidth && "flex justify-center",
      )}
    >
      <MorphContainer
        className="relative h-full overflow-hidden"
        style={isFixedWidth ? { width: devicePreset.width } : undefined}
      >
        <div className="isolate h-full">
          <ComponentContent className="h-full p-4" />
          <MockComposer />
        </div>
      </MorphContainer>
    </div>
  );
}

function useJsonEditorState() {
  const selectedComponent = useSelectedComponent();

  const {
    toolInput,
    toolOutput,
    widgetState,
    toolResponseMetadata,
    setToolInput,
    setToolOutput,
    setWidgetState,
    setToolResponseMetadata,
  } = useWorkbenchStore(
    useShallow((s) => ({
      toolInput: s.toolInput,
      toolOutput: s.toolOutput,
      widgetState: s.widgetState,
      toolResponseMetadata: s.toolResponseMetadata,
      setToolInput: s.setToolInput,
      setToolOutput: s.setToolOutput,
      setWidgetState: s.setWidgetState,
      setToolResponseMetadata: s.setToolResponseMetadata,
    })),
  );

  const getActiveData = useCallback(
    (tab: ActiveJsonTab): Record<string, unknown> => {
      switch (tab) {
        case "toolInput":
          return toolInput;
        case "toolOutput":
          return toolOutput ?? {};
        case "widgetState":
          return widgetState ?? {};
        case "toolResponseMetadata":
          return toolResponseMetadata ?? {};
        default:
          return {};
      }
    },
    [toolInput, toolOutput, widgetState, toolResponseMetadata],
  );

  const handleChange = useCallback(
    (tab: ActiveJsonTab, value: Record<string, unknown>) => {
      const isEmpty = Object.keys(value).length === 0;

      switch (tab) {
        case "toolInput":
          setToolInput(value);
          break;
        case "toolOutput":
          setToolOutput(isEmpty ? null : value);
          break;
        case "widgetState":
          setWidgetState(isEmpty ? null : value);
          break;
        case "toolResponseMetadata":
          setToolResponseMetadata(isEmpty ? null : value);
          break;
      }
    },
    [setToolInput, setToolOutput, setWidgetState, setToolResponseMetadata],
  );

  const handleReset = useCallback(
    (tab: ActiveJsonTab) => {
      switch (tab) {
        case "toolInput": {
          const component = getComponent(selectedComponent);
          setToolInput(component?.defaultProps ?? {});
          break;
        }
        case "toolOutput":
          setToolOutput(null);
          break;
        case "widgetState":
          setWidgetState(null);
          break;
        case "toolResponseMetadata":
          setToolResponseMetadata(null);
          break;
      }
    },
    [
      selectedComponent,
      setToolInput,
      setToolOutput,
      setWidgetState,
      setToolResponseMetadata,
    ],
  );

  return { getActiveData, handleChange, handleReset };
}

function EditorPanel() {
  const activeJsonTab = useActiveJsonTab();
  const setActiveJsonTab = useWorkbenchStore((s) => s.setActiveJsonTab);
  const globals = useOpenAIGlobals();
  const { getActiveData, handleChange, handleReset } = useJsonEditorState();

  return (
    <div className="relative flex h-full flex-col">
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div
          className="pointer-events-none absolute top-0 z-10 h-20 w-full bg-linear-to-b from-neutral-100 via-neutral-100/90 to-transparent dark:from-neutral-950 dark:via-neutral-950"
          aria-hidden="true"
        />

        <div className="sticky top-0 z-20 flex items-center gap-2 p-2">
          <Tabs
            value={activeJsonTab}
            onValueChange={(v) => setActiveJsonTab(v as ActiveJsonTab)}
          >
            <TabsList className="bg-transparent">
              <TabsTrigger className={TAB_TRIGGER_CLASSES} value="toolInput">
                Input
              </TabsTrigger>
              <TabsTrigger
                className={TAB_TRIGGER_CLASSES}
                value="toolResponseMetadata"
              >
                Meta
              </TabsTrigger>
              <TabsTrigger className={TAB_TRIGGER_CLASSES} value="widgetState">
                State
              </TabsTrigger>
              <TabsTrigger
                className={`${TAB_TRIGGER_CLASSES} gap-1.5`}
                value="window"
              >
                Window
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeJsonTab === "window" ? (
          <ReadOnlyJsonView value={globals} />
        ) : (
          <JsonEditor
            key={activeJsonTab}
            label={TAB_LABELS[activeJsonTab]}
            value={getActiveData(activeJsonTab)}
            onChange={(value) => handleChange(activeJsonTab, value)}
          />
        )}
      </div>

      {activeJsonTab === "window" ? (
        <div className="text-muted-foreground bg-background/60 absolute right-3 bottom-3 z-20 rounded-full border px-2.5 py-1 text-xs backdrop-blur-sm">
          Read only
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-3 bottom-3 z-20 size-8 rounded-full opacity-60 hover:opacity-100"
              onClick={() => handleReset(activeJsonTab)}
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Reset {TAB_LABELS[activeJsonTab].toLowerCase()}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function PreviewPanel() {
  const displayMode = useDisplayMode();
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);
  const isTransitioning = useIsTransitioning();

  const handlePipClose = useCallback(() => {
    setDisplayMode("inline");
  }, [setDisplayMode]);

  return (
    <div
      className="bg-background relative flex h-full flex-col overflow-hidden dark:bg-neutral-900"
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
      {displayMode === "inline" && <InlineView />}
      {displayMode === "pip" && (
        <PipView onClose={handlePipClose}>
          <ComponentContent className="h-full" />
        </PipView>
      )}
      {displayMode === "fullscreen" && <FullscreenView />}
    </div>
  );
}

export function UnifiedWorkspace() {
  return (
    <PanelGroup
      direction="horizontal"
      className="flex h-full w-full flex-row"
      autoSaveId={PANEL_AUTO_SAVE_IDS.WORKSPACE_HORIZONTAL}
    >
      <Panel defaultSize={40} minSize={20} maxSize={80}>
        <EditorPanel />
      </Panel>

      <PanelResizeHandle className="group relative z-10 -ml-3 w-3 shrink-0">
        <div className="bg-border absolute inset-y-0 right-0 h-[calc(100%-1px)] w-px transition-colors group-hover:bg-neutral-400 group-data-resize-handle-active:bg-neutral-500 dark:group-hover:bg-neutral-500 dark:group-data-resize-handle-active:bg-neutral-400" />
      </PanelResizeHandle>

      <Panel defaultSize={60} minSize={20} style={{ minWidth: 320 }}>
        <PreviewPanel />
      </Panel>
    </PanelGroup>
  );
}
