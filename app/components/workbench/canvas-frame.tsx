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

type ThemeVariables = Record<`--${string}`, string>;

const DEVICE_VIEWPORT_SIZES: Record<DeviceType, number> = {
  mobile: 40,
  tablet: 65,
  desktop: 90,
};

const LIGHT_THEME_VARS: ThemeVariables = {
  "--background": "0 0% 100%",
  "--foreground": "240 10% 3.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "240 10% 3.9%",
  "--primary": "240 5.9% 10%",
  "--primary-foreground": "0 0% 98%",
  "--muted": "240 4.8% 95.9%",
  "--muted-foreground": "240 3.8% 46.1%",
  "--border": "240 5.9% 90%",
};

const DARK_THEME_VARS: ThemeVariables = {
  "--background": "240 10% 3.9%",
  "--foreground": "0 0% 98%",
  "--card": "240 10% 3.9%",
  "--card-foreground": "0 0% 98%",
  "--primary": "0 0% 98%",
  "--primary-foreground": "240 5.9% 10%",
  "--muted": "240 3.7% 15.9%",
  "--muted-foreground": "240 5% 64.9%",
  "--border": "240 3.7% 15.9%",
};

const RESIZE_HANDLE_CLASSES =
  "absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 opacity-40 transition-all group-hover:bg-neutral-400 group-hover:opacity-100 group-data-resize-handle-active:bg-neutral-500 group-data-resize-handle-active:opacity-100 dark:bg-neutral-600 dark:group-hover:bg-neutral-500 dark:group-data-resize-handle-active:bg-neutral-400";

interface ZodErrorItem {
  path?: string[];
  message?: string;
}

function parseZodErrorMessage(message: string): string {
  if (!message.includes("Invalid") || !message.includes("[")) {
    return message;
  }

  try {
    const jsonStart = message.indexOf("[");
    const jsonPart = message.slice(jsonStart);
    const parsed: unknown = JSON.parse(jsonPart);

    if (!Array.isArray(parsed)) {
      return message;
    }

    return parsed
      .map((item: ZodErrorItem) => {
        const path = item.path?.join(".") ?? "root";
        const msg = item.message ?? "invalid";
        return `${path}: ${msg}`;
      })
      .join("\n");
  } catch {
    return message;
  }
}

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
  const formattedError = parseZodErrorMessage(
    error?.message ?? "Unknown error",
  );

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

function ConstrainedContainer({ children }: { children: ReactNode }) {
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);
  const safeAreaInsets = useWorkbenchStore((s) => s.safeAreaInsets);

  const containerStyle: React.CSSProperties = {
    maxHeight: maxHeight > 0 ? maxHeight : undefined,
    paddingTop: safeAreaInsets.top,
    paddingBottom: safeAreaInsets.bottom,
    paddingLeft: safeAreaInsets.left,
    paddingRight: safeAreaInsets.right,
  };

  const hasConstraints =
    maxHeight > 0 ||
    safeAreaInsets.top > 0 ||
    safeAreaInsets.bottom > 0 ||
    safeAreaInsets.left > 0 ||
    safeAreaInsets.right > 0;

  if (!hasConstraints) {
    return <>{children}</>;
  }

  return (
    <div style={containerStyle} className="overflow-auto">
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
        <ConstrainedContainer>
          <ComponentErrorBoundary toolInput={toolInput}>
            <ComponentRenderer />
          </ComponentErrorBoundary>
        </ConstrainedContainer>
      </OpenAIProvider>
    </IsolatedThemeWrapper>
  );
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group relative w-4">
      <div className={RESIZE_HANDLE_CLASSES} />
    </PanelResizeHandle>
  );
}

function InlineView() {
  const deviceType = useDeviceType();
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const isSyncingLayout = useRef(false);

  useEffect(() => {
    if (!panelGroupRef.current) return;

    const targetSize = DEVICE_VIEWPORT_SIZES[deviceType];
    const spacing = Math.max(0, (100 - targetSize) / 2);

    isSyncingLayout.current = true;
    panelGroupRef.current.setLayout([spacing, targetSize, spacing]);
  }, [deviceType]);

  const handleLayout = (sizes: number[]) => {
    if (isSyncingLayout.current) {
      isSyncingLayout.current = false;
      return;
    }

    if (panelGroupRef.current && sizes.length === 3) {
      const centerSize = sizes[1];
      const spacing = Math.max(0, (100 - centerSize) / 2);
      const needsSync =
        Math.abs(sizes[0] - spacing) > 0.5 ||
        Math.abs(sizes[2] - spacing) > 0.5;

      if (needsSync) {
        isSyncingLayout.current = true;
        panelGroupRef.current.setLayout([spacing, centerSize, spacing]);
      }
    }
  };

  return (
    <PanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      onLayout={handleLayout}
      className="h-full py-4"
    >
      <Panel defaultSize={5} minSize={0} />
      <ResizeHandle />
      <Panel defaultSize={90} minSize={30} maxSize={100}>
        <div className="border-border h-full overflow-auto rounded-xl border-2 border-dashed transition-all">
          <ComponentContent className="h-full" />
        </div>
      </Panel>
      <ResizeHandle />
      <Panel defaultSize={5} minSize={0} />
    </PanelGroup>
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

export function CanvasFrame() {
  const displayMode = useDisplayMode();
  const deviceType = useDeviceType();
  const theme = useWorkbenchStore((s) => s.theme);
  const setDisplayMode = useWorkbenchStore((s) => s.setDisplayMode);

  const handleClose = () => setDisplayMode("inline");

  return (
    <div className="bg-dot-grid bg-wash relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60 dark:opacity-40"
        aria-hidden="true"
      />

      {displayMode === "inline" && <InlineView />}
      {displayMode === "pip" && <PipView onClose={handleClose} />}
      {displayMode === "fullscreen" && <FullscreenView onClose={handleClose} />}

      <div className="bg-background/80 text-muted-foreground absolute bottom-2 left-2 z-10 rounded px-2 py-1 text-xs backdrop-blur-sm">
        {displayMode === "inline" ? deviceType : displayMode} • {theme}
      </div>
    </div>
  );
}
