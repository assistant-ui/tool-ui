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
  MessageCircle,
  UtensilsCrossed,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Ticket,
  Mountain,
  Train,
  X,
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
  onDismissModal?: () => void;
  onOpenExternal?: (url: string) => void;
  onSendFollowUpMessage?: (prompt: string) => void;
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
  onDismissModal,
  onOpenExternal,
  onSendFollowUpMessage,
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
    isModalView && view?.params?.poiId ? String(view.params.poiId) : null;
  const modalPoi = useMemo(
    () => (modalPoiId ? pois.find((p) => p.id === modalPoiId) : null),
    [pois, modalPoiId],
  );

  const renderModalOverlay = () => {
    if (!isModalView || !modalPoi) return null;

    const CategoryIcon = CATEGORY_ICONS[modalPoi.category];
    const isFavorite = favoriteIds.has(modalPoi.id);

    return (
      <div className="absolute inset-0 z-[1100] flex items-center justify-center p-6">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onDismissModal}
          aria-hidden="true"
        />
        <div className="bg-card relative z-10 flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-xl shadow-xl">
          <button
            onClick={onDismissModal}
            className="bg-background/80 hover:bg-background absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          {modalPoi.imageUrl && (
            <div className="relative h-48 shrink-0 overflow-hidden">
              <img
                src={modalPoi.imageUrl}
                alt={modalPoi.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="scrollbar-subtle flex flex-col gap-3 overflow-y-auto p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{modalPoi.name}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
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

            <div className="mt-1 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  const url = `https://maps.google.com/?q=${modalPoi.lat},${modalPoi.lng}`;
                  if (onOpenExternal) {
                    onOpenExternal(url);
                  } else {
                    window.open(url, "_blank");
                  }
                }}
              >
                <ExternalLink className="size-4" />
                Open in Google Maps
              </Button>
              {onSendFollowUpMessage && (
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={() =>
                    onSendFollowUpMessage(
                      `Tell me more about ${modalPoi.name} in ${modalPoi.address || "this location"}`,
                    )
                  }
                >
                  <MessageCircle className="size-4" />
                  Ask ChatGPT about this place
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isFullscreen) {
    return (
      <div
        id={id}
        className={cn("relative flex h-full w-full gap-3", className)}
        data-tool-ui-id={id}
        data-slot="poi-map"
      >
        {renderModalOverlay()}
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

        <div className="border-border relative isolate min-w-0 flex-1 overflow-hidden rounded-xl border">
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
        "border-border relative isolate h-full w-full overflow-hidden rounded-xl border",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="poi-map"
    >
      {renderModalOverlay()}
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
