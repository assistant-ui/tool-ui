"use client";

import { useMemo, Component, type ReactNode } from "react";
import {
  useWorkbenchStore,
  useDisplayMode,
  useSelectedComponent,
  useToolInput,
} from "@/lib/workbench/store";
import { getComponent } from "@/lib/workbench/component-registry";
import { OpenAIProvider } from "@/lib/workbench/openai-context";
import type { DisplayMode } from "@/lib/workbench/types";
import { cn } from "@/lib/ui/cn";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

class ComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
          .map((e: { path?: string[]; message?: string }) =>
            `${e.path?.join(".") ?? "root"}: ${e.message ?? "invalid"}`
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
            <pre className="whitespace-pre-wrap text-xs text-amber-700 dark:text-amber-300">
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
 * Display mode styles for the component container
 */
const displayModeStyles: Record<DisplayMode, string> = {
  inline: "relative h-full w-full",
  pip: "absolute bottom-4 right-4 h-64 w-96 rounded-lg shadow-2xl ring-1 ring-black/10 z-50",
  fullscreen: "absolute inset-0 z-50",
};

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
    [selectedComponent]
  );

  // Merge default props with current toolInput
  const props = useMemo(
    () => ({
      ...(entry?.defaultProps ?? {}),
      ...toolInput,
    }),
    [entry?.defaultProps, toolInput]
  );

  if (!entry) {
    return <FallbackComponent componentId={selectedComponent} />;
  }

  const Component = entry.component;

  return <Component {...props} />;
}

export function CanvasFrame() {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchStore((s) => s.theme);
  const toolInput = useToolInput();
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);

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

      {/* Component container with display mode styling */}
      <div
        className={cn(
          displayModeStyles[displayMode],
          "overflow-auto",
          theme === "dark" ? "dark bg-gray-900" : "bg-white"
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
        <div className="p-4">
          <OpenAIProvider>
            <ComponentErrorBoundary toolInput={toolInput}>
              <ComponentRenderer />
            </ComponentErrorBoundary>
          </OpenAIProvider>
        </div>
      </div>

      {/* Display mode indicator */}
      <div className="bg-background/80 text-muted-foreground absolute bottom-2 left-2 z-10 rounded px-2 py-1 text-xs backdrop-blur-sm">
        {displayMode} • {theme}
      </div>
    </div>
  );
}
