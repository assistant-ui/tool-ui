"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  previewConfigs,
  type ComponentId,
} from "@/lib/docs/preview-config";
import { getStagingConfig } from "@/lib/staging/staging-config";
import type { DebugLevel } from "@/lib/staging/types";
import { ChatContextPreview } from "@/app/docs/_components/chat-context-preview";

interface StagingCanvasProps {
  componentId: ComponentId;
  presetName: string;
  debugLevel: DebugLevel;
  isLoading: boolean;
}

export function StagingCanvas({
  componentId,
  presetName,
  debugLevel,
  isLoading,
}: StagingCanvasProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useState(0);
  const previewConfig = previewConfigs[componentId];
  const stagingConfig = getStagingConfig(componentId);

  const preset = previewConfig?.presets?.[presetName];
  const Wrapper = previewConfig?.wrapper;

  // Force re-render overlay on pointer events and animation frames during interaction
  const scheduleUpdate = useCallback(() => {
    forceUpdate((n) => n + 1);
  }, []);

  useEffect(() => {
    if (debugLevel === "off") return;

    const container = componentRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let isInteracting = false;

    const updateLoop = () => {
      if (isInteracting) {
        scheduleUpdate();
        rafId = requestAnimationFrame(updateLoop);
      }
    };

    const handlePointerDown = () => {
      isInteracting = true;
      rafId = requestAnimationFrame(updateLoop);
    };

    const handlePointerUp = () => {
      isInteracting = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      // One final update after release
      scheduleUpdate();
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [debugLevel, scheduleUpdate]);

  if (!previewConfig || !preset) {
    return (
      <div className="text-muted-foreground text-sm">
        Component or preset not found
      </div>
    );
  }

  const componentData =
    typeof preset.data === "object" && preset.data !== null
      ? { ...preset.data, isLoading }
      : preset.data;

  const component = previewConfig.renderComponent({
    data: componentData,
    presetName,
    state: {},
    setState: () => {},
  });

  const wrappedComponent = Wrapper ? <Wrapper>{component}</Wrapper> : component;

  const hasDebugOverlay = stagingConfig?.renderDebugOverlay != null;
  const shouldShowOverlay = hasDebugOverlay && debugLevel !== "off";

  return (
    <div className="relative w-full max-w-3xl">
      <ChatContextPreview
        userMessage={previewConfig.chatContext.userMessage}
        preamble={previewConfig.chatContext.preamble}
      >
        <div ref={componentRef} className="relative min-w-[500px] [&_article]:max-w-none">
          {wrappedComponent}

          {debugLevel !== "off" && (
            <div className="pointer-events-none absolute inset-0">
              {!hasDebugOverlay && (
                <div className="absolute top-0 left-0 bg-orange-500 px-2 py-1 text-xs text-white rounded">
                  No debug overlay for {componentId}
                </div>
              )}
              {shouldShowOverlay && stagingConfig?.renderDebugOverlay?.({
                level: debugLevel,
                componentRef,
              })}
            </div>
          )}
        </div>
      </ChatContextPreview>
    </div>
  );
}
