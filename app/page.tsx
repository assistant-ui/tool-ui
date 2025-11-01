"use client";

import {
  memo,
  type MutableRefObject,
  useCallback,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { DemoChat } from "@/app/components/demo-chat";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, Smartphone, Tablet } from "lucide-react";
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
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

      updateViewportFromChatSize(clampedChat);
    },
    [updateViewportFromChatSize],
  );

  const changeViewport = (nextViewport: ViewportSize) => {
    setViewport(nextViewport);

    const layout = CHAT_LAYOUTS[nextViewport];

    if (panelGroupRef.current) {
      isSyncingLayout.current = true;
      panelGroupRef.current.setLayout(layout);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <main className="flex min-h-screen flex-row items-center justify-center bg-gray-50 bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[24px_24px]">
      {/* Controls - Fixed in top right */}
      <div className="fixed top-8 right-8 z-10 flex items-center gap-2">
        {/* Viewport Controls */}
        <div className="flex gap-1 rounded-md border bg-white p-1 shadow-sm">
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
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-sm"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Left Column - Static */}
      <div className="max-w-2xl space-y-8 p-8 text-left">
        <h1 className="text-6xl font-bold tracking-tight">ToolUI</h1>
        <h2 className="text-2xl tracking-tight">
          Open source tool call components for AI chat interfaces
        </h2>
        <p className="text-muted-foreground text-lg">
          Responsive, accessible, themeable, data-driven. <br />
          Built with React, TypeScript, and Tailwind. <br />
          Animated with Motion.
        </p>
        <div className="flex justify-start gap-4">
          <Link
            href="/playground"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium transition-colors"
          >
            Go to Playground
          </Link>
        </div>
      </div>

      {/* Right Column - Resizable Chat Container */}
      <div className="flex h-screen flex-1 p-8">
        <ResizableChat
          panelGroupRef={panelGroupRef}
          handleLayout={handleLayout}
          defaultLayout={defaultLayout}
        />
      </div>
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
      <PanelResizeHandle className="group relative w-4 transition-colors">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100" />
      </PanelResizeHandle>

      {/* Chat container */}
      <Panel
        defaultSize={defaultLayout[1]}
        minSize={CHAT_MIN_SIZE}
        maxSize={CHAT_MAX_SIZE}
        style={{ overflow: "visible" }}
        className="flex justify-center"
      >
        <div className="pointer-events-auto flex h-full w-full rounded-4xl border border-gray-300 bg-white shadow-lg transition-all">
          <DemoChat />
        </div>
      </Panel>

      {/* Right resize handle */}
      <PanelResizeHandle className="group relative w-4 transition-colors">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 transition-colors group-hover:bg-gray-400 group-data-resize-handle-active:bg-gray-500" />
      </PanelResizeHandle>

      {/* Right spacing */}
      <Panel defaultSize={defaultLayout[2]} minSize={0} />
    </PanelGroup>
  );
});

ResizableChat.displayName = "ResizableChat";
