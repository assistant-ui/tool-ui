"use client";

import { useMemo, Component, type ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  useWorkbenchStore,
  useActiveJsonTab,
  useDisplayMode,
  useSelectedComponent,
  useToolInput,
  type ActiveJsonTab,
} from "@/lib/workbench/store";
import { getComponent } from "@/lib/workbench/component-registry";
import { OpenAIProvider } from "@/lib/workbench/openai-context";
import { JsonEditor } from "./json-editor";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { RotateCcw, X, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  toolInput: Record<string, unknown>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ComponentErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.toolInput !== this.props.toolInput) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorDisplay({ error }: { error: Error | null }) {
  const message = error?.message ?? "Unknown error";

  let formattedError = message;
  if (message.includes("Invalid") && message.includes("[")) {
    try {
      const jsonStart = message.indexOf("[");
      const jsonPart = message.slice(jsonStart);
      const parsed = JSON.parse(jsonPart);
      if (Array.isArray(parsed)) {
        formattedError = parsed
          .map(
            (e: { path?: string[]; message?: string }) =>
              `${e.path?.join(".") ?? "root"}: ${e.message ?? "invalid"}`,
          )
          .join("\n");
      }
    } catch {
      // Keep original if parsing fails
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-2">
            <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Invalid Props
            </div>
            <pre className="text-xs whitespace-pre-wrap text-amber-700 dark:text-amber-300">
              {formattedError}
            </pre>
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Fix the toolInput JSON to see the component
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

const LIGHT_THEME_VARS: React.CSSProperties = {
  "--background": "0 0% 100%",
  "--foreground": "240 10% 3.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "240 10% 3.9%",
  "--primary": "240 5.9% 10%",
  "--primary-foreground": "0 0% 98%",
  "--muted": "240 4.8% 95.9%",
  "--muted-foreground": "240 3.8% 46.1%",
  "--border": "240 5.9% 90%",
} as React.CSSProperties;

const DARK_THEME_VARS: React.CSSProperties = {
  "--background": "240 10% 3.9%",
  "--foreground": "0 0% 98%",
  "--card": "240 10% 3.9%",
  "--card-foreground": "0 0% 98%",
  "--primary": "0 0% 98%",
  "--primary-foreground": "240 5.9% 10%",
  "--muted": "240 3.7% 15.9%",
  "--muted-foreground": "240 5% 64.9%",
  "--border": "240 3.7% 15.9%",
} as React.CSSProperties;

function IsolatedThemeWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const theme = useWorkbenchStore((s) => s.theme);
  const themeVars = theme === "dark" ? DARK_THEME_VARS : LIGHT_THEME_VARS;

  return (
    <div
      data-theme={theme}
      className={cn("bg-background text-foreground", className)}
      style={{ colorScheme: theme, ...themeVars }}
    >
      {children}
    </div>
  );
}

function ComponentContent({ className }: { className?: string }) {
  const toolInput = useToolInput();

  return (
    <IsolatedThemeWrapper
      className={cn(
        "flex min-h-full items-center justify-center p-4",
        className,
      )}
    >
      <OpenAIProvider>
        <ComponentErrorBoundary toolInput={toolInput}>
          <ComponentRenderer />
        </ComponentErrorBoundary>
      </OpenAIProvider>
    </IsolatedThemeWrapper>
  );
}

function InlineView() {
  return (
    <div className="h-full py-4">
      <div className="border-border h-full overflow-auto rounded-xl border transition-all">
        <ComponentContent className="h-full" />
      </div>
    </div>
  );
}

function PipView({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-80 w-96 overflow-hidden rounded-xl border shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 size-6"
          onClick={onClose}
        >
          <X className="size-3" />
        </Button>
        <ComponentContent className="h-full" />
      </div>
    </div>
  );
}

function FullscreenView({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 z-10 size-8"
        onClick={onClose}
      >
        <X className="size-4" />
      </Button>
      <ComponentContent className="h-full" />
    </div>
  );
}

export function UnifiedWorkspace() {
  const activeJsonTab = useActiveJsonTab();
  const selectedComponent = useSelectedComponent();
  const displayMode = useDisplayMode();
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);

  const {
    toolInput,
    toolOutput,
    widgetState,
    toolResponseMetadata,
    setToolInput,
    setToolOutput,
    setWidgetState,
    setToolResponseMetadata,
    setActiveJsonTab,
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
      setActiveJsonTab: s.setActiveJsonTab,
    })),
  );

  const getActiveData = (): Record<string, unknown> => {
    switch (activeJsonTab) {
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
  };

  const handleChange = (value: Record<string, unknown>) => {
    const isEmpty = Object.keys(value).length === 0;

    switch (activeJsonTab) {
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
  };

  const handleReset = () => {
    switch (activeJsonTab) {
      case "toolInput": {
        // Reset to component's default props
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
  };

  const handleClose = () => {
    setDisplayMode("inline");
  };

  const tabLabels: Record<ActiveJsonTab, string> = {
    toolInput: "Tool Input",
    toolOutput: "Tool Output",
    widgetState: "Widget State",
    toolResponseMetadata: "Metadata",
  };

  return (
    <PanelGroup
      direction="horizontal"
      className="bg-background flex h-full w-full flex-row"
    >
      <Panel defaultSize={40} minSize={20} maxSize={80}>
        <div className="relative isolate flex h-full flex-col">
          <div className="h-full overflow-y-auto bg-white dark:bg-[#0d1117]">
            <div
              className="pointer-events-none absolute top-0 z-10 h-20 w-full bg-linear-to-b from-white via-white to-transparent dark:from-[#0d1117] dark:via-[#0d1117]"
              aria-hidden="true"
            />

            <div className="sticky top-0 z-20 flex items-center gap-2 px-3 py-3">
              <Tabs
                value={activeJsonTab}
                onValueChange={(v) => setActiveJsonTab(v as ActiveJsonTab)}
              >
                <TabsList>
                  <TabsTrigger value="toolInput">Tool Input</TabsTrigger>
                  <TabsTrigger value="toolOutput">Output</TabsTrigger>
                  <TabsTrigger value="widgetState">State</TabsTrigger>
                  <TabsTrigger value="toolResponseMetadata">
                    Metadata
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 px-2"
                onClick={handleReset}
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>

            <JsonEditor
              key={activeJsonTab}
              label={tabLabels[activeJsonTab]}
              value={getActiveData()}
              onChange={handleChange}
            />
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="group relative w-2 shrink-0 bg-white dark:bg-[#0d1117]">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      <Panel defaultSize={60} minSize={20}>
        <div className="relative flex h-full flex-col overflow-hidden bg-white pr-4 dark:bg-[#0d1117]">
          {displayMode === "inline" && <InlineView />}
          {displayMode === "pip" && <PipView onClose={handleClose} />}
          {displayMode === "fullscreen" && (
            <FullscreenView onClose={handleClose} />
          )}
        </div>
      </Panel>
    </PanelGroup>
  );
}
