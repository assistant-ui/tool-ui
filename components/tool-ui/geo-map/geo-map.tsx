"use client";

import type { Map as LeafletMap } from "leaflet";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Supercluster from "supercluster";
import {
  CircleMarker,
  cn,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  ZoomControl,
} from "./_adapter";
import { createClusterIcon, resolveMarkerIcon } from "./geo-map-icons";
import { GeoMapOverlays } from "./geo-map-overlays";
import type { LeafletRuntime } from "./geo-map-runtime";
import styles from "./geo-map-theme.module.css";
import {
  areViewportStatesEqual,
  DEFAULT_VIEW_ZOOM,
  MapObserver,
  normalizeViewportState,
  resolveInitialView,
  type MapViewportState,
  ViewportController,
} from "./geo-map-viewport";
import type { GeoMapMarker, GeoMapProps, GeoMapRoute } from "./schema";
import {
  getClustersForDatelineAwareBbox,
  toSafeExpansionZoom,
  type GeoMapClusterFeature,
  type GeoMapClusterProperties,
} from "./spatial";

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const LIGHT_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const ROUTE_DEFAULT_COLOR = "var(--primary)";
const ROUTE_DEFAULT_WEIGHT = 3;
const ROUTE_DEFAULT_OPACITY = 0.85;
const EMPTY_ROUTES: GeoMapRoute[] = [];

const CLUSTER_RADIUS_DEFAULT = 60;
const CLUSTER_MAX_ZOOM_DEFAULT = 16;
const CLUSTER_MIN_POINTS_DEFAULT = 2;
const LOADING_MESSAGE_DELAY_MS = 1000;
const LOADING_FADE_DURATION_MS = 250;

type MarkerClusterPointProperties = GeoMapClusterProperties & {
  markerId?: string;
  marker?: GeoMapMarker;
};

function resolveMapAriaLabel(title?: string, description?: string): string {
  if (title && description) {
    return `${title}. ${description}`;
  }

  return title ?? description ?? "Geographic map";
}

function resolveMarkerAriaLabel(marker: GeoMapMarker): string {
  if (marker.label && marker.description) {
    return `${marker.label}. ${marker.description}`;
  }

  return (
    marker.label ??
    marker.description ??
    `Marker at ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`
  );
}

export const GeoMap = memo(function GeoMap({
  id,
  role: _role,
  receipt: _receipt,
  title,
  description,
  markers,
  routes,
  clustering,
  viewport,
  showZoomControl = true,
  theme = "light",
  className,
  style,
  mapClassName,
  overlayClassName,
  tooltipClassName,
  popupClassName,
  popupContentClassName,
  popupTitleClassName,
  popupDescriptionClassName,
  onMarkerClick,
  onRouteClick,
}: GeoMapProps) {
  const resolvedRoutes = routes ?? EMPTY_ROUTES;
  const [isMounted, setIsMounted] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [isLoadingOverlayVisible, setIsLoadingOverlayVisible] = useState(false);
  const [showLoadingLabel, setShowLoadingLabel] = useState(false);
  const [leafletRuntime, setLeafletRuntime] = useState<LeafletRuntime | null>(
    null,
  );
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [viewportState, setViewportState] = useState<MapViewportState | null>(
    null,
  );

  const handleViewportChange = useCallback((nextState: MapViewportState) => {
    const normalized = normalizeViewportState(nextState);
    setViewportState((previousState) =>
      areViewportStatesEqual(previousState, normalized)
        ? previousState
        : normalized,
    );
  }, []);

  useEffect(() => {
    setIsMounted(true);
    let isActive = true;

    void import("leaflet").then((module) => {
      if (!isActive) {
        return;
      }

      setLeafletRuntime({
        divIcon: module.divIcon,
        latLngBounds: module.latLngBounds,
      });
    });

    return () => {
      isActive = false;
    };
  }, []);

  const tileUrl = theme === "dark" ? DARK_TILE_URL : LIGHT_TILE_URL;
  const isMapReady = isMounted && leafletRuntime !== null;
  const mapAriaLabel = useMemo(
    () => resolveMapAriaLabel(title, description),
    [description, title],
  );
  const resolvedRootStyle = useMemo(
    () =>
      ({
        "--geo-map-canvas-bg":
          theme === "dark" ? "var(--background)" : "var(--muted)",
        ...style,
      }) satisfies CSSProperties,
    [style, theme],
  );

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    const container = mapInstance.getContainer();
    container.setAttribute("role", "region");
    container.setAttribute("aria-label", mapAriaLabel);
  }, [mapAriaLabel, mapInstance]);

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        mapInstance.closePopup();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mapInstance]);

  useEffect(() => {
    let labelTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let fadeInTimer: ReturnType<typeof setTimeout> | undefined;

    if (!isMapReady) {
      setShowLoadingOverlay(true);
      setShowLoadingLabel(false);
      fadeInTimer = setTimeout(() => {
        setIsLoadingOverlayVisible(true);
      }, 0);
      labelTimer = setTimeout(() => {
        setShowLoadingLabel(true);
      }, LOADING_MESSAGE_DELAY_MS);
    } else {
      setShowLoadingLabel(false);
      setIsLoadingOverlayVisible(false);
      hideTimer = setTimeout(() => {
        setShowLoadingOverlay(false);
      }, LOADING_FADE_DURATION_MS);
    }

    return () => {
      if (fadeInTimer !== undefined) {
        clearTimeout(fadeInTimer);
      }
      if (labelTimer !== undefined) {
        clearTimeout(labelTimer);
      }
      if (hideTimer !== undefined) {
        clearTimeout(hideTimer);
      }
    };
  }, [isMapReady]);

  const initialView = useMemo(
    () => resolveInitialView(markers, resolvedRoutes, viewport),
    [markers, resolvedRoutes, viewport],
  );

  const markerById = useMemo(() => {
    const map = new Map<string, GeoMapMarker>();
    markers.forEach((marker, index) => {
      map.set(marker.id ?? `marker-${index}`, marker);
    });
    return map;
  }, [markers]);

  const clusterConfig = useMemo(
    () => ({
      enabled: clustering?.enabled === true,
      radius: clustering?.radius ?? CLUSTER_RADIUS_DEFAULT,
      maxZoom: clustering?.maxZoom ?? CLUSTER_MAX_ZOOM_DEFAULT,
      minPoints: clustering?.minPoints ?? CLUSTER_MIN_POINTS_DEFAULT,
    }),
    [clustering],
  );

  const clusterIndex = useMemo(() => {
    if (!clusterConfig.enabled) {
      return null;
    }

    const index = new Supercluster<MarkerClusterPointProperties>({
      radius: clusterConfig.radius,
      maxZoom: clusterConfig.maxZoom,
      minPoints: clusterConfig.minPoints,
    });

    const points = markers.map((marker, index) => {
      const markerId = marker.id ?? `marker-${index}`;
      return {
        type: "Feature" as const,
        id: markerId,
        geometry: {
          type: "Point" as const,
          coordinates: [marker.lng, marker.lat] as [number, number],
        },
        properties: {
          markerId,
          marker,
        },
      };
    });

    index.load(points);
    return index;
  }, [
    clusterConfig.enabled,
    clusterConfig.maxZoom,
    clusterConfig.minPoints,
    clusterConfig.radius,
    markers,
  ]);

  const clusteredFeatures = useMemo(() => {
    if (!clusterConfig.enabled || !clusterIndex || !viewportState) {
      return [] as GeoMapClusterFeature[];
    }

    return getClustersForDatelineAwareBbox(
      viewportState.bbox,
      viewportState.zoom,
      (bbox, zoom) =>
        clusterIndex.getClusters(bbox, zoom) as GeoMapClusterFeature[],
    );
  }, [clusterConfig.enabled, clusterIndex, viewportState]);

  const renderMarker = useCallback(
    (
      marker: GeoMapMarker,
      markerKey: string,
      markerPositionOverride?: [number, number],
    ) => {
      const markerPosition: [number, number] = markerPositionOverride ?? [
        marker.lat,
        marker.lng,
      ];
      const tooltipMode = marker.tooltip ?? "hover";
      const tooltipContent = marker.label ?? marker.description;
      const icon = marker.icon;
      const markerAriaLabel = resolveMarkerAriaLabel(marker);

      if (!leafletRuntime) {
        return null;
      }

      const leafletIcon = resolveMarkerIcon(icon, leafletRuntime);
      if (leafletIcon) {
        return (
          <Marker
            key={markerKey}
            position={markerPosition}
            icon={leafletIcon}
            title={markerAriaLabel}
            alt={markerAriaLabel}
            eventHandlers={{
              click: () => onMarkerClick?.(marker),
            }}
          >
            <GeoMapOverlays
              tooltipMode={tooltipMode}
              tooltipContent={tooltipContent}
              label={marker.label}
              description={marker.description}
              tooltipClassName={tooltipClassName}
              popupClassName={popupClassName}
              popupContentClassName={popupContentClassName}
              popupTitleClassName={popupTitleClassName}
              popupDescriptionClassName={popupDescriptionClassName}
            />
          </Marker>
        );
      }

      const markerStroke =
        icon?.type === "dot"
          ? (icon.borderColor ?? "var(--border)")
          : "var(--border)";
      const markerFill =
        icon?.type === "dot"
          ? (icon.color ?? "var(--primary)")
          : "var(--primary)";
      const markerRadius = icon?.type === "dot" ? (icon.radius ?? 7) : 7;

      return (
        <CircleMarker
          key={markerKey}
          center={markerPosition}
          radius={markerRadius}
          pathOptions={{
            color: markerStroke,
            fillColor: markerFill,
            fillOpacity: 0.95,
            weight: 2,
          }}
          eventHandlers={{
            click: () => onMarkerClick?.(marker),
          }}
        >
          <GeoMapOverlays
            tooltipMode={tooltipMode}
            tooltipContent={tooltipContent}
            label={marker.label}
            description={marker.description}
            tooltipClassName={tooltipClassName}
            popupClassName={popupClassName}
            popupContentClassName={popupContentClassName}
            popupTitleClassName={popupTitleClassName}
            popupDescriptionClassName={popupDescriptionClassName}
          />
        </CircleMarker>
      );
    },
    [
      leafletRuntime,
      onMarkerClick,
      popupClassName,
      popupContentClassName,
      popupDescriptionClassName,
      popupTitleClassName,
      tooltipClassName,
    ],
  );

  return (
    <div
      className={cn("w-full min-w-80", styles.root, className)}
      style={resolvedRootStyle}
      data-slot="geo-map"
      data-tool-ui-id={id}
    >
      <div
        className={cn(
          "bg-muted/20 relative h-[320px] w-full overflow-hidden rounded-lg border",
          mapClassName,
        )}
        role="region"
        aria-label={mapAriaLabel}
      >
        {isMapReady && (
          <>
            <MapContainer
              center={initialView.center}
              zoom={initialView.zoom}
              zoomControl={false}
              className="h-full w-full"
              scrollWheelZoom
            >
              <TileLayer attribution={TILE_ATTRIBUTION} url={tileUrl} />
              {showZoomControl && <ZoomControl position="topright" />}
              <MapObserver
                onMapReady={setMapInstance}
                onViewportChange={handleViewportChange}
              />
              <ViewportController
                leafletRuntime={leafletRuntime}
                markers={markers}
                routes={resolvedRoutes}
                viewport={viewport}
              />

              {resolvedRoutes.map((route, routeIndex) => {
                const routeKey = route.id ?? `${id}-route-${routeIndex}`;
                const positions = route.points.map((point) => [
                  point.lat,
                  point.lng,
                ]) as [number, number][];
                const tooltipMode = route.tooltip ?? "hover";
                const tooltipContent = route.label ?? route.description;

                return (
                  <Polyline
                    key={routeKey}
                    positions={positions}
                    pathOptions={{
                      color: route.color ?? ROUTE_DEFAULT_COLOR,
                      weight: route.weight ?? ROUTE_DEFAULT_WEIGHT,
                      opacity: route.opacity ?? ROUTE_DEFAULT_OPACITY,
                      dashArray: route.dashArray,
                    }}
                    eventHandlers={{
                      click: () => onRouteClick?.(route),
                    }}
                  >
                    <GeoMapOverlays
                      tooltipMode={tooltipMode}
                      tooltipContent={tooltipContent}
                      label={route.label}
                      description={route.description}
                      tooltipClassName={tooltipClassName}
                      popupClassName={popupClassName}
                      popupContentClassName={popupContentClassName}
                      popupTitleClassName={popupTitleClassName}
                      popupDescriptionClassName={popupDescriptionClassName}
                    />
                  </Polyline>
                );
              })}

              {clusterConfig.enabled && clusterIndex && viewportState
                ? clusteredFeatures.map((feature, index) => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const properties = (feature.properties ??
                      {}) as MarkerClusterPointProperties;

                    if (
                      properties.cluster &&
                      typeof properties.cluster_id === "number"
                    ) {
                      const pointCount = properties.point_count ?? 0;
                      const clusterId = properties.cluster_id;
                      const clusterIcon = createClusterIcon(
                        pointCount,
                        leafletRuntime,
                      );
                      const clusterAriaLabel = `Cluster containing ${pointCount} locations`;

                      return (
                        <Marker
                          key={`cluster-${clusterId}`}
                          position={[lat, lng]}
                          icon={clusterIcon}
                          title={clusterAriaLabel}
                          alt={clusterAriaLabel}
                          eventHandlers={{
                            click: () => {
                              if (!mapInstance) {
                                return;
                              }

                              const expansionZoom = toSafeExpansionZoom(
                                clusterIndex.getClusterExpansionZoom(clusterId),
                                {
                                  maxZoom: 22,
                                  fallback:
                                    (viewportState.zoom ?? DEFAULT_VIEW_ZOOM) +
                                    2,
                                },
                              );
                              mapInstance.flyTo([lat, lng], expansionZoom);
                            },
                          }}
                        />
                      );
                    }

                    const marker =
                      properties.marker ??
                      markerById.get(properties.markerId ?? `marker-${index}`);
                    if (!marker) {
                      return null;
                    }

                    const markerKey =
                      marker.id ??
                      properties.markerId ??
                      `${id}-cluster-leaf-${index}`;
                    return renderMarker(marker, markerKey, [lat, lng]);
                  })
                : markers.map((marker, index) =>
                    renderMarker(marker, marker.id ?? `${id}-marker-${index}`),
                  )}
            </MapContainer>
            {(title || description) && (
              <div
                className={cn(
                  "pointer-events-none absolute top-3 left-3 z-[900]",
                  "max-w-[min(75%,22rem)] rounded-lg border border-border/70 bg-background/70 px-3 py-2",
                  "shadow-sm backdrop-blur-md",
                  overlayClassName,
                )}
              >
                {title && (
                  <p className="text-foreground text-sm leading-tight font-semibold">
                    {title}
                  </p>
                )}
                {description && (
                  <p className="text-muted-foreground mt-1 text-xs leading-snug">
                    {description}
                  </p>
                )}
              </div>
            )}
          </>
        )}
        {showLoadingOverlay && (
          <div
            data-slot="geo-map-loading"
            className={cn(
              "bg-muted/30 text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity",
              isLoadingOverlayVisible ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: `${LOADING_FADE_DURATION_MS}ms` }}
          >
            <span
              data-slot="geo-map-loading-label"
              aria-hidden={!showLoadingLabel}
              className={cn(
                "transition-opacity",
                showLoadingLabel ? "opacity-100" : "opacity-0",
              )}
              style={{ transitionDuration: `${LOADING_FADE_DURATION_MS}ms` }}
            >
              Loading map...
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
