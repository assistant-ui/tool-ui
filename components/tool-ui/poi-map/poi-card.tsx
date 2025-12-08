"use client";

import { memo } from "react";
import {
  UtensilsCrossed,
  Coffee,
  Landmark,
  Trees,
  ShoppingBag,
  Ticket,
  Mountain,
  Train,
  MapPin,
  Star,
  Heart,
} from "lucide-react";
import type { POI, POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";
import { cn, Button } from "./_ui";

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

interface POICardProps {
  poi: POI;
  isSelected: boolean;
  isFavorite: boolean;
  variant: "compact" | "expanded";
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const POICard = memo(function POICard({
  poi,
  isSelected,
  isFavorite,
  variant,
  onSelect,
  onToggleFavorite,
}: POICardProps) {
  const CategoryIcon = CATEGORY_ICONS[poi.category];

  if (variant === "compact") {
    return (
      <button
        onClick={() => onSelect(poi.id)}
        className={cn(
          "group relative flex h-20 w-40 shrink-0 snap-start flex-col rounded-lg border p-2.5 text-left transition-all",
          "bg-card hover:bg-accent/50",
          isSelected
            ? "border-primary ring-primary/20 ring-2"
            : "border-border hover:border-primary/50",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <CategoryIcon className="text-muted-foreground size-3.5 shrink-0" />
            <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
              {CATEGORY_LABELS[poi.category]}
            </span>
          </div>
          {isFavorite && (
            <Heart className="size-3 shrink-0 fill-rose-500 text-rose-500" />
          )}
        </div>
        <span className="mt-1 line-clamp-2 text-sm font-medium leading-tight">
          {poi.name}
        </span>
        {poi.rating !== undefined && (
          <div className="mt-auto flex items-center gap-0.5">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-muted-foreground text-xs">
              {poi.rating.toFixed(1)}
            </span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg border p-3 transition-all",
        "bg-card hover:bg-accent/50",
        isSelected
          ? "border-primary ring-primary/20 ring-2"
          : "border-border hover:border-primary/50",
      )}
    >
      {poi.imageUrl ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
          <img
            src={poi.imageUrl}
            alt={poi.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-md">
          <CategoryIcon className="text-muted-foreground size-6" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onSelect(poi.id)}
            className="min-w-0 flex-1 text-left"
          >
            <h3 className="truncate text-sm font-medium">{poi.name}</h3>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
              <CategoryIcon className="size-3 shrink-0" />
              <span>{CATEGORY_LABELS[poi.category]}</span>
              {poi.rating !== undefined && (
                <>
                  <span>•</span>
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span>{poi.rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(poi.id);
            }}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isFavorite
                  ? "fill-rose-500 text-rose-500"
                  : "text-muted-foreground hover:text-rose-500",
              )}
            />
          </Button>
        </div>

        {poi.description && (
          <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs">
            {poi.description}
          </p>
        )}

        {poi.address && (
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {poi.address}
          </p>
        )}
      </div>
    </div>
  );
});
