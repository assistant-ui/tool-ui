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
        className={cn("relative flex h-full w-full", className)}
      >
        <div className="bg-background/95 border-border relative z-10 flex w-72 shrink-0 flex-col border-r backdrop-blur-sm">
          <div className="border-border flex items-center justify-between border-b px-3 py-2">
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
                  <TooltipContent>Refresh locations</TooltipContent>
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
                <TooltipContent>Exit fullscreen</TooltipContent>
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

        <div className="relative flex-1">
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
      className={cn("relative flex h-full w-full flex-col", className)}
    >
      <div className="relative flex-1">
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

        <div className="absolute top-3 right-3 z-10 flex gap-1">
          {onRefresh && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/90 size-8 backdrop-blur-sm"
                  onClick={onRefresh}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh locations</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="bg-background/90 size-8 backdrop-blur-sm"
                onClick={handleToggleFullscreen}
              >
                <Maximize2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enter fullscreen</TooltipContent>
          </Tooltip>
        </div>

        {title && (
          <div className="bg-background/90 absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <MapPin className="text-primary size-4" />
            <span className="text-sm font-medium">{title}</span>
          </div>
        )}
      </div>

      <div className="bg-background/95 border-border shrink-0 border-t backdrop-blur-sm">
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
