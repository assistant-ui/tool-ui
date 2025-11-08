"use client";

import {
  memo,
  useCallback,
  useRef,
  useState,
  Suspense,
  type RefObject,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Leva } from "leva";
import { DemoChat } from "@/components/demo-chat";
import { App as HypercubeCanvas } from "@/components/rotating-hypercube";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import { ViewportControls, ViewportSize } from "@/components/viewport-controls";
import AppShell from "@/components/app-shell";

const CHAT_MIN_SIZE = 50;
const CHAT_MAX_SIZE = 100;

const CHAT_LAYOUTS: Record<ViewportSize, [number, number, number]> = {
  mobile: [25, CHAT_MIN_SIZE, 25],
  desktop: [0, CHAT_MAX_SIZE, 0],
};

type ResizableChatProps = {
  panelGroupRef: RefObject<ImperativePanelGroupHandle | null>;
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
      className="h-full w-full"
      direction="horizontal"
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
        className="relative flex"
      >
        <div className="bg-background border-border pointer-events-auto flex h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg border-2 border-dashed transition-all *:h-full *:min-h-0">
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

function HomePageContent({ showLogoDebug }: { showLogoDebug: boolean }) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [chatPanelSize, setChatPanelSize] = useState<number>(
    CHAT_LAYOUTS.desktop[1],
  );
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
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
    <AppShell
      noScroll
      rightContent={
        <ViewportControls
          viewport={viewport}
          onViewportChange={changeViewport}
          showThemeToggle
          showViewportButtons
        />
      }
    >
      <main className="bg-background relative grid h-full max-h-[800px] min-h-0 max-w-[1400px] grid-cols-[2fr_3fr] gap-10 overflow-hidden p-6">
        <div
          className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
          aria-hidden="true"
        />

        <div className="relative z-10 flex max-w-2xl shrink-0 flex-col justify-end gap-7 overflow-y-auto pb-[8vh] pl-6">
          <div className="-mb-4 -ml-4 flex items-end justify-start">
            <HypercubeCanvas cubeWidth={cubeWidth} />
          </div>
          <div className="flex flex-col gap-3">
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
          <Button asChild className="group" size="homeCTA">
            <Link href="/docs/gallery">
              See the Components
              <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="relative hidden h-full min-h-0 flex-1 md:flex">
          <ResizableChat
            panelGroupRef={panelGroupRef}
            handleLayout={handleLayout}
            defaultLayout={defaultLayout}
          />
        </div>

        <Leva hidden={!showLogoDebug} collapsed={!showLogoDebug} />
      </main>
    </AppShell>
  );
}

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
