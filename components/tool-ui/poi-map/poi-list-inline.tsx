"use client";

import { useRef, useEffect } from "react";
import type { POI } from "./schema";
import { POICard } from "./poi-card";
import { cn } from "./_adapter";

interface POIListInlineProps {
  pois: POI[];
  selectedPoiId: string | null;
  favoriteIds: Set<string>;
  onSelectPoi: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

export function POIListInline({
  pois,
  selectedPoiId,
  favoriteIds,
  onSelectPoi,
  onToggleFavorite,
  className,
}: POIListInlineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrolledPoiIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedPoiId) {
      lastScrolledPoiIdRef.current = null;
      return;
    }

    if (!scrollRef.current) return;
    if (lastScrolledPoiIdRef.current === selectedPoiId) return;

    const selectedCard = scrollRef.current.querySelector(
      `[data-poi-id="${selectedPoiId}"]`,
    );
    if (selectedCard) {
      selectedCard.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      lastScrolledPoiIdRef.current = selectedPoiId;
    }
  }, [selectedPoiId, pois]);

  if (pois.length === 0) {
    return (
      <div className={cn("flex h-24 items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">No locations found</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div
        ref={scrollRef}
        className="scrollbar-subtle flex gap-2 overflow-x-auto px-3 py-2"
      >
        {pois.map((poi) => (
          <div key={poi.id} data-poi-id={poi.id}>
            <POICard
              poi={poi}
              isSelected={poi.id === selectedPoiId}
              isFavorite={favoriteIds.has(poi.id)}
              variant="compact"
              onSelect={onSelectPoi}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
