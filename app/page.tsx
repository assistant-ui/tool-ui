"use client";

import {
  memo,
  type MutableRefObject,
  useCallback,
  useRef,
  useState,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Leva } from "leva";
import { DemoChat } from "@/components/demo-chat";
import { App as HypercubeCanvas } from "@/components/rotating-hypercube";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  ViewportControls,
  type ViewportSize,
} from "@/components/viewport-controls";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CHAT_MIN_SIZE = 50;
const CHAT_MAX_SIZE = 100;

const CHAT_VERTICAL_MIN_SIZE = 30;
const CHAT_VERTICAL_MAX_SIZE = 85;

const CHAT_LAYOUTS: Record<ViewportSize, [number, number, number]> = {
  mobile: [25, CHAT_MIN_SIZE, 25],
  desktop: [0, CHAT_MAX_SIZE, 0],
};

function HomePageContent({ showLogoDebug }: { showLogoDebug: boolean }) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [chatPanelSize, setChatPanelSize] = useState<number>(
    CHAT_LAYOUTS.desktop[1],
  );
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const verticalPanelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const isSyncingLayout = useRef(false);
  const isSyncingVerticalLayout = useRef(false);
  const defaultLayout = CHAT_LAYOUTS.desktop;
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");
  const isBuilder = pathname.startsWith("/builder");

  const updateViewportFromChatSize = useCallback((chatSize: number) => {
    const threshold = (CHAT_LAYOUTS.mobile[1] + CHAT_LAYOUTS.desktop[1]) / 2;

    const nextViewport: ViewportSize =
      chatSize <= threshold ? "mobile" : "desktop";

    setViewport((current) =>
      current === nextViewport ? current : nextViewport,
    );
  }, []);

  const handleLayout = useCallback(
    (sizes: number[]) => {
      if (!panelGroupRef.current) {
        return;
      }

      if (isSyncingLayout.current) {
        isSyncingLayout.current = false;
        return;
      }

      const [left, chat, right] = sizes;
      const clampedChat = Math.min(
        CHAT_MAX_SIZE,
        Math.max(CHAT_MIN_SIZE, chat),
      );
      const spacing = Math.max(0, (100 - clampedChat) / 2);
      const epsilon = 0.5;

      const isSymmetric =
        Math.abs(left - spacing) < epsilon &&
        Math.abs(right - spacing) < epsilon &&
        Math.abs(chat - clampedChat) < epsilon;

      if (!isSymmetric) {
        isSyncingLayout.current = true;
        panelGroupRef.current.setLayout([spacing, clampedChat, spacing]);
      }

      setChatPanelSize(clampedChat);
      updateViewportFromChatSize(clampedChat);
    },
    [updateViewportFromChatSize],
  );

  const handleVerticalLayout = useCallback(
    (sizes: number[]) => {
      if (!verticalPanelGroupRef.current) {
        return;
      }

      if (isSyncingVerticalLayout.current) {
        isSyncingVerticalLayout.current = false;
        return;
      }

      const [top, chat, bottom] = sizes;
      const clampedChat = Math.min(
        CHAT_VERTICAL_MAX_SIZE,
        Math.max(CHAT_VERTICAL_MIN_SIZE, chat),
      );
      const spacing = Math.max(0, (100 - clampedChat) / 2);
      const epsilon = 0.5;

      const isSymmetric =
        Math.abs(top - spacing) < epsilon &&
        Math.abs(bottom - spacing) < epsilon &&
        Math.abs(chat - clampedChat) < epsilon;

      if (!isSymmetric) {
        isSyncingVerticalLayout.current = true;
        verticalPanelGroupRef.current.setLayout([spacing, clampedChat, spacing]);
      }
    },
    [],
  );

  const changeViewport = (nextViewport: ViewportSize) => {
    setViewport(nextViewport);

    const layout = CHAT_LAYOUTS[nextViewport];
    setChatPanelSize(layout[1]);

    if (panelGroupRef.current) {
      isSyncingLayout.current = true;
      panelGroupRef.current.setLayout(layout);
    }
  };

  const cubeWidth =
    2.0 +
    ((chatPanelSize - CHAT_MIN_SIZE) / (CHAT_MAX_SIZE - CHAT_MIN_SIZE)) * 2.0;

  return (
    <div className="grid h-screen grid-cols-[minmax(200px,240px)_1fr] grid-rows-[auto_1fr] bg-background">
      {/* A1: Logo - centered */}
      <div className="bg-background border-b border-r flex items-center justify-center px-6 py-3">
        <Link href="/">
          <h1 className="text-xl font-semibold tracking-wide">tool-ui.com</h1>
        </Link>
      </div>

      {/* B1: Tabs */}
      <div className="bg-background border-b flex items-center px-6 py-3">
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isHome
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Home
          </Link>
          <Link
            href="/components"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isComponents
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Components
          </Link>
          <Link
            href="/builder"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isBuilder
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Builder
          </Link>
        </nav>
      </div>

      {/* A2 & B2: Main content spanning both columns for home */}
      <main className="relative col-span-2 flex flex-row items-end justify-center overflow-hidden bg-background">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
          aria-hidden
        />
        <ViewportControls viewport={viewport} onViewportChange={changeViewport} />

        <div className="relative z-10 flex max-w-2xl flex-col gap-5 p-8 pb-21 text-left">
          <div className="-mb-4 -ml-4 flex items-end justify-start">
            <HypercubeCanvas cubeWidth={cubeWidth} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-6xl font-bold tracking-tight">tool-ui.com</h1>
            <h2 className="text-2xl tracking-tight">
              Beautiful UI components for AI tool calls
            </h2>
          </div>
          <p className="text-muted-foreground mb-2 text-lg">
            Responsive, accessible, typed, copy-pasteable. <br />
            Built on Radix, shadcn/ui, and Tailwind. Open Source.
            <br />
          </p>
          <Button asChild className="group w-fit px-6 py-3" size="lg">
            <Link href="/components">
              See the Components
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="relative z-10 flex h-full flex-1 px-12 py-4">
          <ResizableChat
            panelGroupRef={panelGroupRef}
            verticalPanelGroupRef={verticalPanelGroupRef}
            handleLayout={handleLayout}
            handleVerticalLayout={handleVerticalLayout}
            defaultLayout={defaultLayout}
          />
        </div>

        <Leva hidden={!showLogoDebug} collapsed={!showLogoDebug} />
      </main>
    </div>
  );
}

type ResizableChatProps = {
  panelGroupRef: MutableRefObject<ImperativePanelGroupHandle | null>;
  verticalPanelGroupRef: MutableRefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
  handleVerticalLayout: (sizes: number[]) => void;
  defaultLayout: [number, number, number];
};

const ResizableChat = memo(function ResizableChat({
  panelGroupRef,
  verticalPanelGroupRef,
  handleLayout,
  handleVerticalLayout,
  defaultLayout,
}: ResizableChatProps) {
  return (
    <PanelGroup
      ref={panelGroupRef}
      direction="horizontal"
      autoSaveId="homepage-chat-layout"
      style={{ overflow: "visible" }}
      onLayout={handleLayout}
    >
      <Panel defaultSize={defaultLayout[0]} minSize={0} />

      <PanelResizeHandle className="group relative w-4">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      <Panel
        defaultSize={defaultLayout[1]}
        minSize={CHAT_MIN_SIZE}
        maxSize={CHAT_MAX_SIZE}
        style={{ overflow: "visible" }}
        className="relative flex items-center justify-center"
      >
        <PanelGroup
          ref={verticalPanelGroupRef}
          direction="vertical"
          className="w-full h-full"
          style={{ overflow: "visible" }}
          onLayout={handleVerticalLayout}
          autoSaveId="homepage-chat-vertical-layout"
        >
          <Panel defaultSize={0} minSize={0} />

          <PanelResizeHandle className="h-0" />

          <Panel defaultSize={100} minSize={CHAT_VERTICAL_MIN_SIZE} maxSize={CHAT_VERTICAL_MAX_SIZE}>
            <div className="bg-background pointer-events-auto flex h-full w-full overflow-hidden border-2 border-dashed border-border transition-all">
              <DemoChat />
            </div>
          </Panel>

          <PanelResizeHandle className="group relative h-4">
            <div className="absolute top-1/2 left-1/2 w-12 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
          </PanelResizeHandle>

          <Panel defaultSize={0} minSize={0} />
        </PanelGroup>
      </Panel>

      <PanelResizeHandle className="group relative w-4">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 group-hover:bg-gray-400 group-data-resize-handle-active:bg-gray-500 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      <Panel defaultSize={defaultLayout[2]} minSize={0} />
    </PanelGroup>
  );
});

ResizableChat.displayName = "ResizableChat";

function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  const showLogoDebug = searchParams.get("logoDebug") === "true";
  return <HomePageContent showLogoDebug={showLogoDebug} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageContent showLogoDebug={false} />}>
      <SearchParamsWrapper />
    </Suspense>
  );
}
