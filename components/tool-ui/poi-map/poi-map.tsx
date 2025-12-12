"use client";

import { useCallback } from "react";
import { Maximize2, Minimize2, RefreshCw, Filter, Check } from "lucide-react";
import type { POI, POIMapViewState, MapCenter, POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  widgetState: POIMapViewState | null;
  theme: "light" | "dark";
  onWidgetStateChange: (state: Partial<POIMapViewState>) => void;
  onRequestDisplayMode: (mode: DisplayMode) => void;
  onRefresh?: () => void;
  onToggleFavorite?: (poiId: string, isFavorite: boolean) => void;
  onFilterCategory?: (category: POICategory | null) => void;
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
  onFilterCategory,
}: POIMapProps) {
  const {
    selectedPoiId,
    favoriteIds,
    mapCenter,
    mapZoom,
    categoryFilter,
    filteredPois,
    categories,
    selectPoi,
    toggleFavorite: toggleFavoriteInternal,
    setMapViewport,
    setCategoryFilter,
  } = usePOIMap({
    pois,
    widgetState,
    initialCenter,
    initialZoom,
    onWidgetStateChange,
  });

  const handleToggleFavorite = useCallback(
    (poiId: string) => {
      toggleFavoriteInternal(poiId);
      onToggleFavorite?.(poiId, !favoriteIds.has(poiId));
    },
    [toggleFavoriteInternal, onToggleFavorite, favoriteIds],
  );

  const handleMoveEnd = useCallback(
    (center: MapCenter, zoom: number) => {
      setMapViewport(center, zoom);
    },
    [setMapViewport],
  );

  const handleToggleFullscreen = useCallback(() => {
    onRequestDisplayMode(
      displayMode === "fullscreen" ? "inline" : "fullscreen",
    );
  }, [displayMode, onRequestDisplayMode]);

  const handleFilterCategory = useCallback(
    (category: POICategory | null) => {
      setCategoryFilter(category);
      onFilterCategory?.(category);
    },
    [setCategoryFilter, onFilterCategory],
  );

  const handleSelectPoiInline = useCallback(
    (poiId: string) => {
      selectPoi(poiId);
      onRequestDisplayMode("fullscreen");
    },
    [selectPoi, onRequestDisplayMode],
  );

  const isFullscreen = displayMode === "fullscreen";

  if (isFullscreen) {
    return (
      <div
        id={id}
        className={cn("flex h-full w-full gap-3", className)}
        data-tool-ui-id={id}
        data-slot="poi-map"
      >
        <div className="flex w-72 shrink-0 flex-col py-3 pl-3">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {title ?? "Locations"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("size-7", categoryFilter && "text-primary")}
                  >
                    <Filter className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleFilterCategory(null)}>
                    <span className="flex-1">All categories</span>
                    {categoryFilter === null && <Check className="size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => handleFilterCategory(category)}
                    >
                      <span className="flex-1">
                        {CATEGORY_LABELS[category]}
                      </span>
                      {categoryFilter === category && (
                        <Check className="size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {filteredPois.length} location{filteredPois.length !== 1 && "s"}
              {categoryFilter && ` · ${CATEGORY_LABELS[categoryFilter]}`}
            </p>
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

        <div className="border-border isolate relative min-w-0 flex-1 overflow-hidden rounded-xl border">
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
                <TooltipContent className="z-[1001]">
                  Refresh locations
                </TooltipContent>
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
                  <Minimize2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[1001]">
                Exit fullscreen
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "border-border isolate relative h-full w-full overflow-hidden rounded-xl border",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="poi-map"
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
            <TooltipContent className="z-[1001]">
              Refresh locations
            </TooltipContent>
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
        <div className="bg-background/80 absolute top-3 left-3 z-[1000] rounded-lg px-3 py-1.5 backdrop-blur-md">
          <span className="text-sm font-medium">{title}</span>
        </div>
      )}

      <div className="absolute right-3 bottom-3 left-3 z-[1000]">
        <POIListInline
          pois={filteredPois}
          selectedPoiId={selectedPoiId}
          favoriteIds={favoriteIds}
          onSelectPoi={handleSelectPoiInline}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </div>
  );
}
