"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { POI, MapCenter, POICategory } from "./schema";
import { cn } from "./_ui";

export const CATEGORY_COLORS: Record<POICategory, string> = {
  restaurant: "#ef4444",
  cafe: "#f97316",
  museum: "#8b5cf6",
  park: "#22c55e",
  shopping: "#ec4899",
  entertainment: "#f59e0b",
  landmark: "#3b82f6",
  transit: "#6366f1",
  other: "#6b7280",
};

export interface MapViewProps {
  pois: POI[];
  center: MapCenter;
  zoom: number;
  selectedPoiId: string | null;
  favoriteIds: Set<string>;
  onSelectPoi: (id: string) => void;
  onMoveEnd?: (center: MapCenter, zoom: number) => void;
  theme?: "light" | "dark";
  className?: string;
}

export function MapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="text-muted-foreground text-sm">Loading map...</div>
    </div>
  );
}

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function MapView(props: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <MapSkeleton className={props.className} />;
  }

  return <LeafletMap {...props} />;
}
