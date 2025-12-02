"use client";

import { useMemo, useEffect, useRef, Component, type ReactNode } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import {
  useWorkbenchStore,
  useDisplayMode,
  useSelectedComponent,
  useToolInput,
  useDeviceType,
} from "@/lib/workbench/store";
import { getComponent } from "@/lib/workbench/component-registry";
import { OpenAIProvider } from "@/lib/workbench/openai-context";
import type { DeviceType } from "@/lib/workbench/types";
import { cn } from "@/lib/ui/cn";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Device Viewport Sizes (percentage of available width)
// ─────────────────────────────────────────────────────────────────────────────

const DEVICE_VIEWPORT_SIZES: Record<DeviceType, number> = {
  mobile: 40, // ~375px equivalent
  tablet: 65, // ~768px equivalent
  desktop: 90, // Full width
};

// ─────────────────────────────────────────────────────────────────────────────
// Error Boundary for Component Rendering
// ─────────────────────────────────────────────────────────────────────────────

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
    // Reset error state when toolInput changes (user fixed the JSON)
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

  // Try to parse Zod-style error messages for better display
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
      // Keep original message if parsing fails
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

/**
 * Fallback component when the selected component isn't found
 */
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

/**
 * The actual component renderer that lives inside the OpenAI context
 */
function ComponentRenderer() {
  const selectedComponent = useSelectedComponent();
  const toolInput = useToolInput();

  // Get the component from registry
  const entry = useMemo(
    () => getComponent(selectedComponent),
    [selectedComponent],
  );

  // Merge default props with current toolInput
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

export function CanvasFrame() {
  const displayMode = useDisplayMode();
  const deviceType = useDeviceType();
  const theme = useWorkbenchStore((s) => s.theme);
  const toolInput = useToolInput();
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);

  // Ref for programmatic panel control
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const isSyncingLayout = useRef(false);

  // Update panel layout when device type changes
  useEffect(() => {
    if (!panelGroupRef.current) return;

    const targetSize = DEVICE_VIEWPORT_SIZES[deviceType];
    const spacing = Math.max(0, (100 - targetSize) / 2);

    isSyncingLayout.current = true;
    panelGroupRef.current.setLayout([spacing, targetSize, spacing]);
  }, [deviceType]);

  // Keep panels symmetrical when user resizes manually
  const handleLayout = (sizes: number[]) => {
    if (isSyncingLayout.current) {
      isSyncingLayout.current = false;
      return;
    }

    // Maintain symmetry: if center panel changes, adjust spacers equally
    if (panelGroupRef.current && sizes.length === 3) {
      const centerSize = sizes[1];
      const spacing = Math.max(0, (100 - centerSize) / 2);

      if (
        Math.abs(sizes[0] - spacing) > 0.5 ||
        Math.abs(sizes[2] - spacing) > 0.5
      ) {
        isSyncingLayout.current = true;
        panelGroupRef.current.setLayout([spacing, centerSize, spacing]);
      }
    }
  };

  // Handle close for fullscreen/pip modes
  const handleClose = () => {
    setDisplayMode("inline");
  };

  return (
    <div className="bg-dot-grid bg-wash relative h-full w-full overflow-hidden">
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-40"
        aria-hidden="true"
      />

      {/* Resizable panel layout for device simulation */}
      <PanelGroup
        ref={panelGroupRef}
        direction="horizontal"
        onLayout={handleLayout}
        className="h-full py-4"
      >
        {/* Left spacer panel */}
        <Panel defaultSize={5} minSize={0} />

        {/* Left resize handle */}
        <PanelResizeHandle className="group relative w-4">
          <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-[resize-handle-active]:bg-gray-500 group-data-[resize-handle-active]:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-[resize-handle-active]:bg-gray-400" />
        </PanelResizeHandle>

        {/* Center content panel */}
        <Panel defaultSize={90} minSize={30} maxSize={100}>
          <div
            className={cn(
              "h-full overflow-auto rounded-xl border-2 border-dashed transition-all",
              "border-border bg-transparent",
              theme === "dark" && "dark",
            )}
          >
            {/* Close button for pip/fullscreen */}
            {displayMode !== "inline" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 size-8"
                onClick={handleClose}
              >
                <X className="size-4" />
              </Button>
            )}

            {/* Component wrapped in error boundary and OpenAI context */}
            <div className="flex min-h-full items-center justify-center p-4">
              <OpenAIProvider>
                <ComponentErrorBoundary toolInput={toolInput}>
                  <ComponentRenderer />
                </ComponentErrorBoundary>
              </OpenAIProvider>
            </div>
          </div>
        </Panel>

        {/* Right resize handle */}
        <PanelResizeHandle className="group relative w-4">
          <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-[resize-handle-active]:bg-gray-500 group-data-[resize-handle-active]:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-[resize-handle-active]:bg-gray-400" />
        </PanelResizeHandle>

        {/* Right spacer panel */}
        <Panel defaultSize={5} minSize={0} />
      </PanelGroup>

      {/* Display mode indicator */}
      <div className="bg-background/80 text-muted-foreground absolute bottom-2 left-2 z-10 rounded px-2 py-1 text-xs backdrop-blur-sm">
        {deviceType} • {theme}
      </div>
    </div>
  );
}
