"use client";

import {
  memo,
  type MutableRefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Leva } from "leva";
import { DemoChat } from "@/app/components/demo-chat";
import { App as HypercubeCanvas } from "@/app/components/rotating-hypercube";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";

type ViewportSize = "mobile" | "tablet" | "desktop";

const CHAT_MIN_SIZE = 50;
const CHAT_MAX_SIZE = 100;

const CHAT_LAYOUTS: Record<ViewportSize, [number, number, number]> = {
  mobile: [25, CHAT_MIN_SIZE, 25],
  tablet: [15, 70, 15],
  desktop: [0, CHAT_MAX_SIZE, 0],
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const showLogoDebug = searchParams.get("logoDebug") === "true";
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [chatPanelSize, setChatPanelSize] = useState<number>(
    CHAT_LAYOUTS.desktop[1],
  );
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const isSyncingLayout = useRef(false);
  const defaultLayout = CHAT_LAYOUTS.desktop;

  const updateViewportFromChatSize = useCallback((chatSize: number) => {
    const mobileThreshold =
      (CHAT_LAYOUTS.mobile[1] + CHAT_LAYOUTS.tablet[1]) / 2;
    const desktopThreshold =
      (CHAT_LAYOUTS.tablet[1] + CHAT_LAYOUTS.desktop[1]) / 2;

    let nextViewport: ViewportSize;

    if (chatSize <= mobileThreshold) {
      nextViewport = "mobile";
    } else if (chatSize < desktopThreshold) {
      nextViewport = "tablet";
    } else {
      nextViewport = "desktop";
    }

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

  // Map chat panel size (50-100) to cube width (2.0-4.0)
  const cubeWidth =
    2.0 +
    ((chatPanelSize - CHAT_MIN_SIZE) / (CHAT_MAX_SIZE - CHAT_MIN_SIZE)) * 2.0;

  return (
    <main className="relative flex min-h-screen flex-row items-end justify-center">
      {/* Background pattern overlay */}
      <div
        className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        aria-hidden
      />

      {/* Controls - Fixed in top right */}
      <div className="fixed top-8 right-8 z-20 flex items-center gap-2">
        {/* Viewport Controls */}
        <div className="bg-background flex gap-1 rounded-md border p-1 shadow-sm">
          <Button
            variant={viewport === "mobile" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => changeViewport("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "tablet" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => changeViewport("tablet")}
            title="Tablet view"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === "desktop" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => changeViewport("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>

      {/* Left Column - Static */}
      <div className="relative z-10 flex max-w-2xl flex-col gap-6 p-8 pb-21 text-left">
        <div className="-mb-4 -ml-4 flex items-end justify-start">
          <HypercubeCanvas cubeWidth={cubeWidth} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-bold tracking-tight">ToolUI</h1>
          <h2 className="text-2xl tracking-tight">
            Open source UI widgets for AI chat
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Responsive, accessible, themeable, data-driven. <br />
          Built with React, TypeScript, and Shadcn. <br />
        </p>
        <div className="flex justify-start gap-4">
          <Link
            href="/playground"
            className="bg-primary text-primary-foreground rounded-md px-6 py-3"
          >
            Go to Playground
          </Link>
        </div>
      </div>

      {/* Right Column - Resizable Chat Container */}
      <div className="relative z-10 flex h-screen flex-1 p-8">
        <ResizableChat
          panelGroupRef={panelGroupRef}
          handleLayout={handleLayout}
          defaultLayout={defaultLayout}
        />
      </div>

      <Leva hidden={!showLogoDebug} collapsed={!showLogoDebug} />
    </main>
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
      {/* Left spacing */}
      <Panel defaultSize={defaultLayout[0]} minSize={0} />

      {/* Left resize handle */}
      <PanelResizeHandle className="group relative w-4">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      {/* Chat container */}
      <Panel
        defaultSize={defaultLayout[1]}
        minSize={CHAT_MIN_SIZE}
        maxSize={CHAT_MAX_SIZE}
        style={{ overflow: "visible" }}
        className="relative flex justify-center"
      >
        <div className="bg-background pointer-events-auto flex h-full w-full rounded-4xl border shadow-lg transition-all">
          <DemoChat />
        </div>
      </Panel>

      {/* Right resize handle */}
      <PanelResizeHandle className="group relative w-4">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 group-hover:bg-gray-400 group-data-resize-handle-active:bg-gray-500 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      {/* Right spacing */}
      <Panel defaultSize={defaultLayout[2]} minSize={0} />
    </PanelGroup>
  );
});

ResizableChat.displayName = "ResizableChat";
