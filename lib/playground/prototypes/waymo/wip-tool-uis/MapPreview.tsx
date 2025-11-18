"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import maplibregl, {
  LngLatBounds,
  Map as MapLibreMap,
  type GeoJSONSource,
} from "maplibre-gl";
import { MapPin, ArrowRight } from "lucide-react";

export type MapLocation = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export type MapPreviewCardProps = {
  pickup: MapLocation;
  dropoff: MapLocation;
  etaMinutes?: number;
  status: "preview" | "confirmed";
  onConfirm?: () => void;
};

const MAP_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const ROUTE_SOURCE_ID = "waymo-route";

export function MapPreviewCard({
  pickup,
  dropoff,
  etaMinutes,
  status,
  onConfirm,
}: MapPreviewCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pickupMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dropoffMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [pickup.lng, pickup.lat],
      zoom: 12,
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const handleLoad = () => setMapReady(true);
    map.on("load", handleLoad);

    return () => {
      map.off("load", handleLoad);
      pickupMarkerRef.current?.remove();
      dropoffMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
    };
  }, [pickup.lat, pickup.lng]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    const routeData = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [pickup.lng, pickup.lat],
              [dropoff.lng, dropoff.lat],
            ],
          },
          properties: {},
        },
      ],
    };

    const existingSource = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(routeData);
    } else {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: routeData,
      });

      map.addLayer({
        id: ROUTE_SOURCE_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        paint: {
          "line-color": "#2563eb",
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });
    }

    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = new maplibregl.Marker({ color: "#2563eb" })
        .setLngLat([pickup.lng, pickup.lat])
        .addTo(map);
    } else {
      pickupMarkerRef.current.setLngLat([pickup.lng, pickup.lat]);
    }

    if (!dropoffMarkerRef.current) {
      dropoffMarkerRef.current = new maplibregl.Marker({ color: "#10b981" })
        .setLngLat([dropoff.lng, dropoff.lat])
        .addTo(map);
    } else {
      dropoffMarkerRef.current.setLngLat([dropoff.lng, dropoff.lat]);
    }

    if (pickup.lat === dropoff.lat && pickup.lng === dropoff.lng) {
      map.setCenter([pickup.lng, pickup.lat]);
      map.setZoom(14);
    } else {
      const bounds = new LngLatBounds([pickup.lng, pickup.lat], [dropoff.lng, dropoff.lat]);
      map.fitBounds(bounds, { padding: 60, duration: 0 });
    }
  }, [dropoff.lat, dropoff.lng, mapReady, pickup.lat, pickup.lng]);

  const formatAddress = (name: string, address: string) =>
    address ? `${name} · ${address}` : name;

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-full bg-primary/10 p-2">
          <MapPin className="text-primary h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Confirm your trip</p>
          <p className="font-medium">
            {pickup.name} <ArrowRight className="mx-1 inline h-4 w-4" /> {dropoff.name}
          </p>
        </div>
      </div>

      <div className="mb-3 overflow-hidden rounded-md border">
        <div ref={containerRef} className="h-64 w-full" />
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Pickup
          </span>
          <span className="font-medium">{formatAddress(pickup.name, pickup.address)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Destination
          </span>
          <span className="font-medium">{formatAddress(dropoff.name, dropoff.address)}</span>
        </div>
        {typeof etaMinutes === "number" && (
          <div className="text-muted-foreground text-xs">
            Estimated pickup in {etaMinutes} minute{etaMinutes === 1 ? "" : "s"}
          </div>
        )}
      </div>

      <button
        onClick={status === "preview" ? onConfirm : undefined}
        disabled={status !== "preview" || !onConfirm}
        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        {status === "preview" ? "Looks good" : "Confirmed"}
      </button>
    </div>
  );
}
