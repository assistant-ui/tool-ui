"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelGroupHandle,
} from "react-resizable-panels";
import {
  useWorkbenchStore,
  useIsTransitioning,
  useDeviceType,
} from "@/app/workbench/lib/store";
import { DEVICE_PRESETS } from "@/app/workbench/lib/types";
import { cn } from "@/lib/ui/cn";
import { ComponentContent, MorphContainer } from "./component-renderer";
import { MockComposer } from "./mock-composer";

const PREVIEW_MIN_SIZE = 30;
const PREVIEW_MAX_SIZE = 100;

const RESIZE_HANDLE_CLASSES =
  "absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400";

function PreviewResizeHandle({
  isTransitioning,
}: {
  isTransitioning: boolean;
}) {
  return (
    <PanelResizeHandle
      className={cn(
        "group relative w-4 transition-opacity",
        isTransitioning ? "opacity-0 duration-50" : "opacity-100 duration-300",
      )}
    >
      <div className={RESIZE_HANDLE_CLASSES} />
    </PanelResizeHandle>
  );
}

export function InlineView() {
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);
  const deviceType = useDeviceType();
  const isTransitioning = useIsTransitioning();
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isSyncingLayout = useRef(false);

  const devicePreset = DEVICE_PRESETS[deviceType];

  useEffect(() => {
    if (!panelGroupRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let centerSize: number;

    if (devicePreset.width === "100%") {
      centerSize = 90;
    } else {
      const targetWidth = devicePreset.width + 32;
      centerSize = Math.min(
        PREVIEW_MAX_SIZE,
        Math.max(PREVIEW_MIN_SIZE, (targetWidth / containerWidth) * 100),
      );
    }

    const spacing = (100 - centerSize) / 2;
    isSyncingLayout.current = true;
    panelGroupRef.current.setLayout([spacing, centerSize, spacing]);
  }, [devicePreset.width]);

  const handleLayout = useCallback((sizes: number[]) => {
    if (!panelGroupRef.current) return;
    if (isSyncingLayout.current) {
      isSyncingLayout.current = false;
      return;
    }

    const [left, center, right] = sizes;
    const clampedCenter = Math.min(
      PREVIEW_MAX_SIZE,
      Math.max(PREVIEW_MIN_SIZE, center),
    );
    const spacing = Math.max(0, (100 - clampedCenter) / 2);
    const epsilon = 0.5;

    const isSymmetric =
      Math.abs(left - spacing) < epsilon &&
      Math.abs(right - spacing) < epsilon &&
      Math.abs(center - clampedCenter) < epsilon;

    if (!isSymmetric) {
      isSyncingLayout.current = true;
      panelGroupRef.current.setLayout([spacing, clampedCenter, spacing]);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="scrollbar-subtle h-full w-full overflow-auto p-4"
    >
      <div className="flex min-h-full w-full items-start justify-center">
        <PanelGroup
          ref={panelGroupRef}
          direction="horizontal"
          onLayout={handleLayout}
          className="w-full"
        >
          <Panel defaultSize={5} minSize={0} />
          <PreviewResizeHandle isTransitioning={isTransitioning} />
          <Panel
            defaultSize={90}
            minSize={PREVIEW_MIN_SIZE}
            maxSize={PREVIEW_MAX_SIZE}
          >
            <MorphContainer
              className="overflow-hidden rounded-xl"
              style={{ height: maxHeight }}
            >
              <ComponentContent className="h-full" />
            </MorphContainer>
          </Panel>
          <PreviewResizeHandle isTransitioning={isTransitioning} />
          <Panel defaultSize={5} minSize={0} />
        </PanelGroup>
      </div>
    </div>
  );
}

export function FullscreenView() {
  const deviceType = useDeviceType();
  const devicePreset = DEVICE_PRESETS[deviceType];
  const isFixedWidth = typeof devicePreset.width === "number";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        isFixedWidth && "flex justify-center",
      )}
    >
      <MorphContainer
        className="relative h-full overflow-hidden"
        style={isFixedWidth ? { width: devicePreset.width } : undefined}
      >
        <div className="isolate h-full">
          <ComponentContent className="h-full p-4" />
          <MockComposer />
        </div>
      </MorphContainer>
    </div>
  );
}

export function CarouselView() {
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);

  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-4">
      <div className="flex items-center gap-6">
        <div className="bg-muted/30 h-48 w-32 shrink-0 rounded-lg opacity-40" />
        <MorphContainer
          className="shrink-0 overflow-hidden rounded-xl shadow-xl"
          style={{ height: maxHeight, width: 320 }}
        >
          <ComponentContent className="h-full" />
        </MorphContainer>
        <div className="bg-muted/30 h-48 w-32 shrink-0 rounded-lg opacity-40" />
      </div>
    </div>
  );
}
