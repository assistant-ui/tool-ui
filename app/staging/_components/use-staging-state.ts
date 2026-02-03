"use client";

import { create } from "zustand";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import {
  previewConfigs,
  type ComponentId,
} from "@/lib/docs/preview-config";
import type { DebugLevel } from "@/lib/staging/types";

type ViewMode = "static" | "showcase";

interface StagingState {
  componentId: ComponentId;
  presetName: string;
  debugLevel: DebugLevel;
  viewMode: ViewMode;
  setComponent: (id: ComponentId) => void;
  setPreset: (name: string) => void;
  setDebugLevel: (level: DebugLevel) => void;
  cycleDebugLevel: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const DEBUG_LEVELS: DebugLevel[] = ["off", "boundaries", "margins", "full"];

export const useStagingStore = create<StagingState>((set, get) => ({
  componentId: "parameter-slider",
  presetName: "photo-adjustments",
  debugLevel: "off",
  viewMode: "static",

  setComponent: (id) => {
    const config = previewConfigs[id];
    set({
      componentId: id,
      presetName: config?.defaultPreset ?? Object.keys(config?.presets ?? {})[0] ?? "",
      debugLevel: "off",
    });
  },

  setPreset: (name) => set({ presetName: name }),

  setDebugLevel: (level) => set({ debugLevel: level }),

  cycleDebugLevel: () => {
    const current = get().debugLevel;
    const currentIndex = DEBUG_LEVELS.indexOf(current);
    const nextIndex = (currentIndex + 1) % DEBUG_LEVELS.length;
    set({ debugLevel: DEBUG_LEVELS[nextIndex] });
  },

  setViewMode: (mode) => set({ viewMode: mode }),
}));

export function useStagingState() {
  const store = useStagingStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Sync URL params to store on mount
  useEffect(() => {
    const componentParam = searchParams.get("component") as ComponentId | null;
    const presetParam = searchParams.get("preset");
    const debugParam = searchParams.get("debug") as DebugLevel | null;

    if (componentParam && componentParam in previewConfigs) {
      const config = previewConfigs[componentParam];
      const presetName =
        presetParam && presetParam in (config?.presets ?? {})
          ? presetParam
          : config?.defaultPreset ?? "";

      const debugLevel = debugParam && DEBUG_LEVELS.includes(debugParam) ? debugParam : "off";

      // Only update store if values have changed to prevent infinite loop
      const currentState = useStagingStore.getState();
      if (
        currentState.componentId !== componentParam ||
        currentState.presetName !== presetName ||
        currentState.debugLevel !== debugLevel
      ) {
        useStagingStore.setState({
          componentId: componentParam,
          presetName,
          debugLevel,
        });
      }
    }
  }, [searchParams]);

  // Sync store to URL params
  const syncToUrl = useCallback(() => {
    const state = useStagingStore.getState();
    const params = new URLSearchParams();
    params.set("component", state.componentId);
    params.set("preset", state.presetName);
    if (state.debugLevel !== "off") {
      params.set("debug", state.debugLevel);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = useStagingStore.subscribe(() => {
      syncToUrl();
    });
    return unsubscribe;
  }, [syncToUrl]);

  return store;
}

export function usePresetNames(): string[] {
  const { componentId } = useStagingStore();
  const config = previewConfigs[componentId];
  return Object.keys(config?.presets ?? {});
}
