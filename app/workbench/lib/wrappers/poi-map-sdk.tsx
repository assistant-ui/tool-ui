"use client";

import { useCallback, useMemo } from "react";
import {
  POIMap,
  parseSerializablePOIMap,
  type POIMapViewState,
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
  useView,
  useOpenExternal,
  useSendFollowUpMessage,
} from "../openai-context";
import { useWorkbenchStore } from "../store";
import type { DisplayMode } from "../types";

const DEFAULT_WIDGET_STATE: POIMapViewState = {
  selectedPoiId: null,
  favoriteIds: [],
  mapCenter: DEFAULT_CENTER,
  mapZoom: DEFAULT_ZOOM,
  categoryFilter: null,
};

export function POIMapSDK(props: Record<string, unknown>) {
  const parsed = parseSerializablePOIMap(props);
  const { setWidgetState, requestModal } = useOpenAI();
  const [widgetState] = useWidgetState<POIMapViewState>(DEFAULT_WIDGET_STATE);
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const callTool = useCallTool();
  const theme = useTheme();
  const view = useView();
  const setView = useWorkbenchStore((s) => s.setView);
  const openExternal = useOpenExternal();
  const sendFollowUpMessage = useSendFollowUpMessage();

  const currentWidgetState = useMemo<POIMapViewState>(
    () => ({
      ...DEFAULT_WIDGET_STATE,
      mapCenter: parsed.initialCenter ?? DEFAULT_CENTER,
      mapZoom: parsed.initialZoom ?? DEFAULT_ZOOM,
      ...widgetState,
    }),
    [widgetState, parsed.initialCenter, parsed.initialZoom],
  );

  const handleWidgetStateChange = useCallback(
    async (partialState: Partial<POIMapViewState>) => {
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

  const handleViewDetails = useCallback(
    async (poiId: string) => {
      const poi = parsed.pois.find((p) => p.id === poiId);
      await requestModal({
        title: poi?.name ?? "Location Details",
        params: { poiId },
      });
    },
    [requestModal, parsed.pois],
  );

  const handleDismissModal = useCallback(() => {
    setView(null);
  }, [setView]);

  const handleOpenExternal = useCallback(
    (url: string) => {
      openExternal({ href: url });
    },
    [openExternal],
  );

  const handleSendFollowUpMessage = useCallback(
    async (prompt: string) => {
      await sendFollowUpMessage({ prompt });
    },
    [sendFollowUpMessage],
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
      view={view}
      onWidgetStateChange={handleWidgetStateChange}
      onRequestDisplayMode={handleRequestDisplayMode}
      onRefresh={handleRefresh}
      onToggleFavorite={handleToggleFavorite}
      onFilterCategory={handleFilterCategory}
      onViewDetails={handleViewDetails}
      onDismissModal={handleDismissModal}
      onOpenExternal={handleOpenExternal}
      onSendFollowUpMessage={handleSendFollowUpMessage}
    />
  );
}
