"use client";

import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useShallow } from "zustand/react/shallow";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import {
  useWorkbenchStore,
  useDisplayMode,
  useIsTransitioning,
  useSelectedComponent,
  useToolInput,
  useDeviceType,
  useIsWidgetClosed,
  useActiveToolCall,
} from "@/app/workbench/lib/store";
import {
  DEVICE_PRESETS,
  isStructuredWidgetState,
  type StructuredWidgetState,
} from "@/app/workbench/lib/types";
import { getComponent } from "@/app/workbench/lib/component-registry";
import {
  StructuredWidgetStateEditor,
  createEmptyStructuredState,
} from "./structured-widget-state-editor";
import { OpenAIProvider } from "@/app/workbench/lib/openai-context";
import { JsonEditor } from "./json-editor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { RotateCcw, XCircle, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  VIEW_TRANSITION_NAME,
  VIEW_TRANSITION_PARENT_NAME,
  VIEW_TRANSITION_ROOT_NAME,
} from "@/app/workbench/lib/transition-config";
import { PANEL_AUTO_SAVE_IDS } from "@/app/workbench/lib/persistence";
import { ComponentErrorBoundary } from "./component-error-boundary";
import { IsolatedThemeWrapper } from "./isolated-theme-wrapper";
import { PipView } from "./pip-view";
import { MockComposer } from "./mock-composer";
import { MockConfigPanel } from "./mock-config-panel";
import { ModalOverlay } from "./modal-overlay";

type JsonEditorTab =
  | "toolInput"
  | "toolOutput"
  | "widgetState"
  | "toolResponseMetadata";

const PREVIEW_MIN_SIZE = 30;
const PREVIEW_MAX_SIZE = 100;

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

function CarouselView() {
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);

  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-4">
      <div className="flex items-center gap-6">
        <div className="bg-muted/30 h-48 w-32 shrink-0 rounded-lg opacity-40" />
        <MorphContainer
          className="shrink-0 overflow-hidden rounded-xl shadow-xl"
          style={{ height: maxHeight, width: 320 }}
        >
          <ComponentContent className="h-full" />
        </MorphContainer>
        <div className="bg-muted/30 h-48 w-32 shrink-0 rounded-lg opacity-40" />
      </div>
    </div>
  );
}

function WidgetClosedOverlay({ onReopen }: { onReopen: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white/10 p-8 text-white">
        <XCircle className="h-12 w-12 opacity-60" />
        <div className="text-center">
          <div className="text-lg font-medium">Widget Closed</div>
          <div className="mt-1 text-sm opacity-70">
            The widget has been closed by the server or user request
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onReopen}
          className="mt-2 gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reopen Widget
        </Button>
      </div>
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
    (tab: JsonEditorTab): Record<string, unknown> => {
      switch (tab) {
        case "toolInput":
          return toolInput;
        case "toolOutput":
          return toolOutput ?? {};
        case "widgetState":
          return (widgetState as Record<string, unknown>) ?? {};
        case "toolResponseMetadata":
          return toolResponseMetadata ?? {};
        default:
          return {};
      }
    },
    [toolInput, toolOutput, widgetState, toolResponseMetadata],
  );

  const handleChange = useCallback(
    (tab: JsonEditorTab, value: Record<string, unknown>) => {
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
    (tab: JsonEditorTab) => {
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

interface EditorSectionTriggerProps {
  title: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function EditorSectionTrigger({
  title,
  hint,
  isOpen,
  onToggle,
}: EditorSectionTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="border-border/40 hover:bg-muted/30 flex shrink-0 items-center justify-between gap-4 border-b px-3 py-2 text-left transition-colors"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-sm">{title}</span>
        {hint && (
          <span className="text-muted-foreground/60 text-[10px]">{hint}</span>
        )}
      </div>
      <ChevronDown
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

interface EditorSectionContentProps {
  isOpen: boolean;
  onReset?: () => void;
  children: ReactNode;
}

function EditorSectionContent({
  isOpen,
  onReset,
  children,
}: EditorSectionContentProps) {
  return (
    <div
      className={cn(
        "border-border/40 relative grid min-h-0 border-b transition-[grid-template-rows,opacity] duration-200 ease-out",
        isOpen
          ? "grid-rows-[1fr] opacity-100"
          : "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        {onReset && (
          <div className="absolute top-1 right-3 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                  onClick={onReset}
                >
                  <RotateCcw className="size-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Reset</TooltipContent>
            </Tooltip>
          </div>
        )}
        <div className="scrollbar-subtle h-full overflow-y-auto px-3 py-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 border-border/40 border-b px-3 py-1.5">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {children}
      </span>
    </div>
  );
}

function formatDelay(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

function ToolCallLoadingIndicator() {
  const activeToolCall = useActiveToolCall();

  if (!activeToolCall) return null;

  return (
    <div className="border-border/40 bg-primary/5 flex items-center gap-2 border-b px-3 py-2">
      <Loader2 className="text-primary size-3.5 animate-spin" />
      <span className="text-muted-foreground text-xs">
        <span className="font-medium">{activeToolCall.toolName}</span>
        <span className="text-muted-foreground/60 ml-1.5">
          ({formatDelay(activeToolCall.delay)} delay)
        </span>
      </span>
    </div>
  );
}

interface WidgetStateSectionProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

function WidgetStateSection({ value, onChange }: WidgetStateSectionProps) {
  const [preferRawMode, setPreferRawMode] = useState(false);
  const isStructured = isStructuredWidgetState(value);
  const showStructured = isStructured && !preferRawMode;

  const handleStructuredChange = useCallback(
    (structured: StructuredWidgetState) => {
      onChange(structured as unknown as Record<string, unknown>);
    },
    [onChange],
  );

  const handleConvertToStructured = useCallback(() => {
    const structured = createEmptyStructuredState();
    onChange(structured as unknown as Record<string, unknown>);
    setPreferRawMode(false);
  }, [onChange]);

  const handleSwitchToRaw = useCallback(() => {
    setPreferRawMode(true);
  }, []);

  if (showStructured) {
    return (
      <StructuredWidgetStateEditor
        value={value as unknown as StructuredWidgetState}
        onChange={handleStructuredChange}
        onSwitchToRaw={handleSwitchToRaw}
      />
    );
  }

  const hasData = Object.keys(value).length > 0;

  return (
    <div className="flex flex-col gap-2">
      <JsonEditor
        label="Widget State"
        value={value}
        onChange={onChange}
      />
      {!isStructured && hasData && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={handleConvertToStructured}
        >
          Convert to structured
        </Button>
      )}
      {!hasData && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={handleConvertToStructured}
        >
          Use structured format
        </Button>
      )}
      {isStructured && preferRawMode && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-6 gap-1 self-start text-[10px]"
          onClick={() => setPreferRawMode(false)}
        >
          Switch to structured view
        </Button>
      )}
    </div>
  );
}

function EditorPanel() {
  const { getActiveData, handleChange, handleReset } = useJsonEditorState();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    toolInput: true,
    widgetState: true,
    toolResponseMetadata: false,
    toolSimulation: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stateGridRows = [
    "auto", // Component Props trigger
    openSections.toolInput ? "1fr" : "0fr", // Component Props content
    "auto", // Widget State trigger
    openSections.widgetState ? "1fr" : "0fr", // Widget State content
    "auto", // Widget Metadata trigger
    openSections.toolResponseMetadata ? "1fr" : "0fr", // Widget Metadata content
  ].join(" ");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ToolCallLoadingIndicator />
      <SectionHeader>Component State</SectionHeader>
      <div
        className="grid min-h-0 flex-1 transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: stateGridRows }}
      >
        <EditorSectionTrigger
          title="Component Props"
          isOpen={openSections.toolInput}
          onToggle={() => toggleSection("toolInput")}
        />
        <EditorSectionContent
          isOpen={openSections.toolInput}
          onReset={() => handleReset("toolInput")}
        >
          <JsonEditor
            label="Component Props"
            value={getActiveData("toolInput")}
            onChange={(value) => handleChange("toolInput", value)}
          />
        </EditorSectionContent>

        <EditorSectionTrigger
          title="Widget State"
          hint="Persisted between interactions"
          isOpen={openSections.widgetState}
          onToggle={() => toggleSection("widgetState")}
        />
        <EditorSectionContent
          isOpen={openSections.widgetState}
          onReset={() => handleReset("widgetState")}
        >
          <WidgetStateSection
            value={getActiveData("widgetState")}
            onChange={(value) => handleChange("widgetState", value)}
          />
        </EditorSectionContent>

        <EditorSectionTrigger
          title="Widget Metadata (_meta)"
          hint="Widget-only. Model never sees this."
          isOpen={openSections.toolResponseMetadata}
          onToggle={() => toggleSection("toolResponseMetadata")}
        />
        <EditorSectionContent
          isOpen={openSections.toolResponseMetadata}
          onReset={() => handleReset("toolResponseMetadata")}
        >
          <JsonEditor
            label="Widget Metadata (_meta)"
            value={getActiveData("toolResponseMetadata")}
            onChange={(value) => handleChange("toolResponseMetadata", value)}
          />
        </EditorSectionContent>
      </div>

      <div className="border-border/40 shrink-0 border-t">
        <button
          type="button"
          onClick={() => toggleSection("toolSimulation")}
          className="bg-muted/30 hover:bg-muted/50 flex w-full items-center justify-between px-3 py-1.5 transition-colors"
        >
          <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Tool Simulation
          </span>
          <ChevronDown
            className={cn(
              "text-muted-foreground size-3.5 transition-transform duration-200",
              openSections.toolSimulation && "rotate-180",
            )}
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            openSections.toolSimulation ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <MockConfigPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel() {
  const displayMode = useDisplayMode();
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);
  const isTransitioning = useIsTransitioning();
  const isWidgetClosed = useIsWidgetClosed();
  const setWidgetClosed = useWorkbenchStore((s) => s.setWidgetClosed);
  const view = useWorkbenchStore((s) => s.view);
  const setView = useWorkbenchStore((s) => s.setView);

  const handlePipClose = useCallback(() => {
    setDisplayMode("inline");
  }, [setDisplayMode]);

  const handleReopenWidget = useCallback(() => {
    setWidgetClosed(false);
  }, [setWidgetClosed]);

  const handleModalClose = useCallback(() => {
    setView(null);
  }, [setView]);

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
      {displayMode === "carousel" && <CarouselView />}
      {isWidgetClosed && <WidgetClosedOverlay onReopen={handleReopenWidget} />}
      {view?.mode === "modal" && (
        <ModalOverlay view={view} onClose={handleModalClose} />
      )}
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
