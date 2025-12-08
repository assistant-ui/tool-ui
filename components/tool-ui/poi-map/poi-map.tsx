"use client";

import { useCallback } from "react";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  MapPin,
} from "lucide-react";
import type { POI, POIMapWidgetState, MapCenter } from "./schema";
import { usePOIMap } from "./use-poi-map";
import { POIListInline } from "./poi-list-inline";
import { POIListSidebar } from "./poi-list-sidebar";
import { MapView } from "./map-view";
import {
  cn,
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./_ui";

type DisplayMode = "inline" | "pip" | "fullscreen";

export interface POIMapProps {
  id: string;
  pois: POI[];
  initialCenter?: MapCenter;
  initialZoom?: number;
  title?: string;
  className?: string;
  displayMode: DisplayMode;
  widgetState: POIMapWidgetState | null;
  theme: "light" | "dark";
  onWidgetStateChange: (state: Partial<POIMapWidgetState>) => void;
  onRequestDisplayMode: (mode: DisplayMode) => void;
  onRefresh?: () => void;
  onToggleFavorite?: (poiId: string, isFavorite: boolean) => void;
}

export function POIMap({
  id,
  pois,
  initialCenter,
  initialZoom,
  title,
  className,
  displayMode,
  widgetState,
  theme,
  onWidgetStateChange,
  onRequestDisplayMode,
  onRefresh,
  onToggleFavorite,
}: POIMapProps) {
  const {
    selectedPoiId,
    favoriteIds,
    mapCenter,
    mapZoom,
    filteredPois,
    selectPoi,
    toggleFavorite: internalToggleFavorite,
    setMapViewport,
  } = usePOIMap({
    pois,
    widgetState,
    initialCenter,
    initialZoom,
    onWidgetStateChange,
  });

  const handleToggleFavorite = useCallback(
    (poiId: string) => {
      internalToggleFavorite(poiId);
      onToggleFavorite?.(poiId, !favoriteIds.has(poiId));
    },
    [internalToggleFavorite, onToggleFavorite, favoriteIds],
  );

  const handleMoveEnd = useCallback(
    (center: MapCenter, zoom: number) => {
      setMapViewport(center, zoom);
    },
    [setMapViewport],
  );

  const handleToggleFullscreen = useCallback(() => {
    onRequestDisplayMode(displayMode === "fullscreen" ? "inline" : "fullscreen");
  }, [displayMode, onRequestDisplayMode]);

  const isFullscreen = displayMode === "fullscreen";

  if (isFullscreen) {
    return (
      <div
        id={id}
        className={cn("flex h-full w-full gap-3", className)}
      >
        <div className="flex w-72 shrink-0 flex-col">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <MapPin className="text-primary size-4" />
              <span className="text-sm font-medium">
                {title ?? "Locations"}
              </span>
              <span className="text-muted-foreground text-xs">
                ({filteredPois.length})
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onRefresh && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={onRefresh}
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="z-[1001]">Refresh locations</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={handleToggleFullscreen}
                  >
                    <Minimize2 className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="z-[1001]">Exit fullscreen</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <POIListSidebar
            pois={filteredPois}
            selectedPoiId={selectedPoiId}
            favoriteIds={favoriteIds}
            onSelectPoi={selectPoi}
            onToggleFavorite={handleToggleFavorite}
            className="flex-1"
          />
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl">
          <MapView
            pois={filteredPois}
            center={mapCenter}
            zoom={mapZoom}
            selectedPoiId={selectedPoiId}
            favoriteIds={favoriteIds}
            onSelectPoi={selectPoi}
            onMoveEnd={handleMoveEnd}
            theme={theme}
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cn("relative h-full w-full overflow-hidden rounded-xl", className)}
    >
      <MapView
        pois={filteredPois}
        center={mapCenter}
        zoom={mapZoom}
        selectedPoiId={selectedPoiId}
        favoriteIds={favoriteIds}
        onSelectPoi={selectPoi}
        onMoveEnd={handleMoveEnd}
        theme={theme}
        className="h-full w-full"
      />

      <div className="absolute top-3 right-3 z-[1000] flex gap-1">
        {onRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-background/80 size-8 backdrop-blur-md"
                onClick={onRefresh}
              >
                <RefreshCw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="z-[1001]">Refresh locations</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-background/80 size-8 backdrop-blur-md"
              onClick={handleToggleFullscreen}
            >
              <Maximize2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[1001]">Enter fullscreen</TooltipContent>
        </Tooltip>
      </div>

      {title && (
        <div className="bg-background/80 absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-md">
          <MapPin className="text-primary size-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
      )}

      <div className="absolute right-3 bottom-3 left-3 z-[1000]">
        <POIListInline
          pois={filteredPois}
          selectedPoiId={selectedPoiId}
          favoriteIds={favoriteIds}
          onSelectPoi={selectPoi}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
}
