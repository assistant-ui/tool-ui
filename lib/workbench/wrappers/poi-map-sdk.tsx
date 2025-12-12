"use client";

import { useCallback, useMemo } from "react";
import {
  POIMap,
  parseSerializablePOIMap,
  type POIMapWidgetState,
  type POICategory,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from "@/components/tool-ui/poi-map";
import {
  useWidgetState,
  useOpenAI,
  useDisplayMode,
  useRequestDisplayMode,
  useCallTool,
  useTheme,
} from "../openai-context";
import type { DisplayMode } from "../types";

const DEFAULT_WIDGET_STATE: POIMapWidgetState = {
  selectedPoiId: null,
  favoriteIds: [],
  mapCenter: DEFAULT_CENTER,
  mapZoom: DEFAULT_ZOOM,
  categoryFilter: null,
};

export function POIMapSDK(props: Record<string, unknown>) {
  const parsed = parseSerializablePOIMap(props);
  const { setWidgetState } = useOpenAI();
  const [widgetState] = useWidgetState<POIMapWidgetState>(DEFAULT_WIDGET_STATE);
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const callTool = useCallTool();
  const theme = useTheme();

  const currentWidgetState = useMemo<POIMapWidgetState>(
    () => ({
      ...DEFAULT_WIDGET_STATE,
      mapCenter: parsed.initialCenter ?? DEFAULT_CENTER,
      mapZoom: parsed.initialZoom ?? DEFAULT_ZOOM,
      ...widgetState,
    }),
    [widgetState, parsed.initialCenter, parsed.initialZoom],
  );

  const handleWidgetStateChange = useCallback(
    async (partialState: Partial<POIMapWidgetState>) => {
      await setWidgetState({
        ...currentWidgetState,
        ...partialState,
      });
    },
    [setWidgetState, currentWidgetState],
  );

  const handleRequestDisplayMode = useCallback(
    async (mode: DisplayMode) => {
      await requestDisplayMode({ mode });
    },
    [requestDisplayMode],
  );

  const handleRefresh = useCallback(async () => {
    await callTool("refresh_pois", {
      center: currentWidgetState.mapCenter,
      zoom: currentWidgetState.mapZoom,
    });
  }, [callTool, currentWidgetState.mapCenter, currentWidgetState.mapZoom]);

  const handleToggleFavorite = useCallback(
    async (poiId: string, isFavorite: boolean) => {
      await callTool("toggle_favorite", {
        poi_id: poiId,
        is_favorite: isFavorite,
      });
    },
    [callTool],
  );

  const handleFilterCategory = useCallback(
    async (category: POICategory | null) => {
      await callTool("filter_pois", {
        category,
      });
    },
    [callTool],
  );

  return (
    <POIMap
      id={parsed.id}
      pois={parsed.pois}
      initialCenter={parsed.initialCenter}
      initialZoom={parsed.initialZoom}
      title={parsed.title}
      displayMode={displayMode}
      widgetState={currentWidgetState}
      theme={theme}
      onWidgetStateChange={handleWidgetStateChange}
      onRequestDisplayMode={handleRequestDisplayMode}
      onRefresh={handleRefresh}
      onToggleFavorite={handleToggleFavorite}
      onFilterCategory={handleFilterCategory}
    />
  );
}
