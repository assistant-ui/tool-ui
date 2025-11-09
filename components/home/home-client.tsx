"use client";

import { memo, useCallback, useEffect, useRef, type RefObject } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import { Leva } from "leva";
import { DemoChat } from "@/components/demo-chat";
import { ResizableViewportControls } from "@/components/resizable-viewport-controls";
import { CHAT_MIN_SIZE, CHAT_MAX_SIZE, useHomeStore } from "./home-store";

type Layout = [number, number, number];

type ResizableChatProps = {
  panelGroupRef: RefObject<ImperativePanelGroupHandle | null>;
  layout: Layout;
  onLayoutChange: (sizes: Layout) => void;
};

const ResizableChat = memo(function ResizableChat({
  panelGroupRef,
  layout,
  onLayoutChange,
}: ResizableChatProps) {
  const isSyncingLayout = useRef(false);

  useEffect(() => {
    if (!panelGroupRef.current) {
      return;
    }
    isSyncingLayout.current = true;
    panelGroupRef.current.setLayout(layout);
  }, [layout, panelGroupRef]);

  const handleLayout = useCallback(
    (sizes: number[]) => {
      if (isSyncingLayout.current) {
        isSyncingLayout.current = false;
        return;
      }

      onLayoutChange([sizes[0] ?? 0, sizes[1] ?? 0, sizes[2] ?? 0]);
    },
    [onLayoutChange],
  );

  return (
    <PanelGroup
      ref={panelGroupRef}
      className="h-full w-full"
      direction="horizontal"
      style={{ overflow: "visible" }}
      onLayout={handleLayout}
    >
      <Panel defaultSize={layout[0]} minSize={0} />

      <PanelResizeHandle className="group relative w-4">
        <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
      </PanelResizeHandle>

      <Panel
        defaultSize={layout[1]}
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

      <Panel defaultSize={layout[2]} minSize={0} />
    </PanelGroup>
  );
});

ResizableChat.displayName = "ResizableChat";

export function HomeViewportControls() {
  const viewport = useHomeStore((state) => state.viewport);
  const setViewport = useHomeStore((state) => state.setViewport);

  return (
    <ResizableViewportControls
      viewport={viewport}
      onViewportChange={setViewport}
      showThemeToggle
      showViewportButtons
    />
  );
}

export function HomeDebugPanel() {
  const showLogoDebug = useHomeStore((state) => state.showLogoDebug);

  return <Leva hidden={!showLogoDebug} collapsed={!showLogoDebug} />;
}

export function HomeClient({ showLogoDebug }: { showLogoDebug: boolean }) {
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const layout = useHomeStore((state) => state.chatLayout);
  const setChatLayout = useHomeStore((state) => state.setChatLayout);
  const setShowLogoDebug = useHomeStore((state) => state.setShowLogoDebug);

  useEffect(() => {
    setShowLogoDebug(showLogoDebug);
  }, [setShowLogoDebug, showLogoDebug]);

  return (
    <div className="relative hidden h-full min-h-0 flex-1 md:flex">
      <ResizableChat
        panelGroupRef={panelGroupRef}
        layout={layout}
        onLayoutChange={setChatLayout}
      />
    </div>
  );
}
