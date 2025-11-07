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
import { ResponsiveHeader } from "@/components/responsive-header";

const CHAT_MIN_SIZE = 50;
const CHAT_MAX_SIZE = 100;

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
  const isSyncingLayout = useRef(false);
  const defaultLayout = CHAT_LAYOUTS.desktop;

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
    <div className="flex h-screen flex-col">
      {/* Header with logo and tabs */}
      <ResponsiveHeader
        rightContent={
          <ViewportControls
            viewport={viewport}
            onViewportChange={changeViewport}
            showThemeToggle
            showViewportButtons
          />
        }
      />

      {/* Main content */}
      <main className="bg-background relative flex flex-1 flex-col overflow-hidden md:flex-row md:items-end md:justify-center">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
          aria-hidden="true"
        />

        <div className="relative z-10 flex max-w-2xl flex-col gap-5 p-6 pb-8 text-left md:p-8 md:pb-21">
          <div className="-mb-4 -ml-4 flex items-end justify-start">
            <HypercubeCanvas cubeWidth={cubeWidth} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Tool UI
            </h1>
            <h2 className="text-xl tracking-tight md:text-2xl">
              Beautiful UI components for AI tool calls
            </h2>
          </div>
          <p className="text-muted-foreground mb-2 text-base md:text-lg">
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

        <div className="relative z-10 hidden h-full flex-1 px-12 py-12 md:flex">
          <ResizableChat
            panelGroupRef={panelGroupRef}
            handleLayout={handleLayout}
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
  handleLayout: (sizes: number[]) => void;
  defaultLayout: [number, number, number];
};

const ResizableChat = memo(function ResizableChat({
  panelGroupRef,
  handleLayout,
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
        <div className="bg-background border-border pointer-events-auto flex h-full w-full overflow-hidden rounded-lg border-2 border-dashed transition-all">
          <DemoChat />
        </div>
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
