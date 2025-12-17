"use client";

import { useCallback, useMemo } from "react";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Check,
  MapPin,
  Star,
  Heart,
  ExternalLink,
  UtensilsCrossed,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Ticket,
  Mountain,
  Train,
} from "lucide-react";
import type { POI, POIMapViewState, MapCenter, POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";
import { usePOIMap } from "./use-poi-map";
import { POIListInline } from "./poi-list-inline";
import { POIListSidebar } from "./poi-list-sidebar";
import { MapView } from "./map-view";
import {
  cn,
  Button,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./_adapter";

type DisplayMode = "inline" | "pip" | "fullscreen";

interface View {
  mode: "modal" | "inline";
  params: Record<string, unknown> | null;
}

const CATEGORY_ICONS: Record<POICategory, typeof MapPin> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  museum: Landmark,
  park: Trees,
  shopping: ShoppingBag,
  entertainment: Ticket,
  landmark: Mountain,
  transit: Train,
  other: MapPin,
};

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
  view?: View | null;
  onWidgetStateChange: (state: Partial<POIMapViewState>) => void;
  onRequestDisplayMode: (mode: DisplayMode) => void;
  onRefresh?: () => void;
  onToggleFavorite?: (poiId: string, isFavorite: boolean) => void;
  onFilterCategory?: (category: POICategory | null) => void;
  onViewDetails?: (poiId: string) => void;
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
  view,
  onWidgetStateChange,
  onRequestDisplayMode,
  onRefresh,
  onToggleFavorite,
  onFilterCategory,
  onViewDetails,
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
  const isModalView = view?.mode === "modal";
  const modalPoiId =
    isModalView && view?.params?.poiId
      ? String(view.params.poiId)
      : null;
  const modalPoi = useMemo(
    () => (modalPoiId ? pois.find((p) => p.id === modalPoiId) : null),
    [pois, modalPoiId],
  );

  if (isModalView && modalPoi) {
    const CategoryIcon = CATEGORY_ICONS[modalPoi.category];
    const isFavorite = favoriteIds.has(modalPoi.id);

    return (
      <div
        id={id}
        className={cn("flex flex-col gap-4 p-4", className)}
        data-tool-ui-id={id}
        data-slot="poi-map"
      >
        <div className="flex items-start gap-4">
          <Avatar className="size-20 shrink-0 rounded-lg">
            <AvatarImage
              src={modalPoi.imageUrl}
              alt={modalPoi.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-lg">
              <CategoryIcon className="text-muted-foreground size-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{modalPoi.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => handleToggleFavorite(modalPoi.id)}
              >
                <Heart
                  className={cn(
                    "size-5 transition-colors",
                    isFavorite
                      ? "fill-rose-500 text-rose-500"
                      : "text-muted-foreground hover:text-rose-500",
                  )}
                />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <CategoryIcon className="size-3" />
                {CATEGORY_LABELS[modalPoi.category]}
              </Badge>
              {modalPoi.rating !== undefined && (
                <Badge variant="outline" className="gap-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {modalPoi.rating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {modalPoi.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {modalPoi.description}
          </p>
        )}

        {modalPoi.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span>{modalPoi.address}</span>
          </div>
        )}

        {modalPoi.tags && modalPoi.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {modalPoi.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="border-border isolate mt-2 h-48 overflow-hidden rounded-lg border">
          <MapView
            pois={[modalPoi]}
            center={{ lat: modalPoi.lat, lng: modalPoi.lng }}
            zoom={15}
            selectedPoiId={modalPoi.id}
            favoriteIds={favoriteIds}
            onSelectPoi={() => {}}
            onMoveEnd={() => {}}
            theme={theme}
            className="h-full w-full"
          />
        </div>

        <Button
          variant="outline"
          className="mt-2 w-full gap-2"
          onClick={() =>
            window.open(
              `https://maps.google.com/?q=${modalPoi.lat},${modalPoi.lng}`,
              "_blank",
            )
          }
        >
          <ExternalLink className="size-4" />
          Open in Google Maps
        </Button>
      </div>
    );
  }

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
            onViewDetails={onViewDetails}
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
