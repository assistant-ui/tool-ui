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
  Info,
} from "lucide-react";
import type { POI, POICategory } from "./schema";
import { CATEGORY_LABELS } from "./schema";
import {
  cn,
  Button,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./_adapter";

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
  onViewDetails?: (id: string) => void;
}

export const POICard = memo(function POICard({
  poi,
  isSelected,
  isFavorite,
  variant,
  onSelect,
  onToggleFavorite,
  onViewDetails,
}: POICardProps) {
  const CategoryIcon = CATEGORY_ICONS[poi.category];

  if (variant === "compact") {
    return (
      <button
        onClick={() => onSelect(poi.id)}
        className={cn(
          "group relative flex h-20 w-40 shrink-0 snap-start flex-col rounded-lg border p-2.5 text-left shadow-lg transition-all",
          "bg-card/95 hover:bg-card backdrop-blur-sm",
          isSelected
            ? "border-primary ring-primary/20 ring-2"
            : "border-border hover:border-primary/50",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <Badge variant="secondary" className="h-5 gap-1 px-1.5 text-[10px]">
            <CategoryIcon className="size-3" />
            {CATEGORY_LABELS[poi.category]}
          </Badge>
          {isFavorite && (
            <Heart className="size-3 shrink-0 fill-rose-500 text-rose-500" />
          )}
        </div>
        <span className="mt-1 line-clamp-2 text-sm leading-tight font-medium">
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
        "group relative flex gap-3 rounded-lg p-2 transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-accent",
      )}
    >
      <Avatar className="size-14 shrink-0 rounded-md">
        <AvatarImage
          src={poi.imageUrl}
          alt={poi.name}
          className="object-cover"
        />
        <AvatarFallback className="rounded-md">
          <CategoryIcon className="text-muted-foreground size-6" />
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onSelect(poi.id)}
            className="min-w-0 flex-1 text-left"
          >
            <h3 className="truncate text-sm font-medium">{poi.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                <CategoryIcon className="size-3" />
                {CATEGORY_LABELS[poi.category]}
              </Badge>
              {poi.rating !== undefined && (
                <Badge
                  variant="secondary"
                  className="h-5 gap-0.5 px-1.5 text-[10px]"
                >
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {poi.rating.toFixed(1)}
                </Badge>
              )}
            </div>
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="left" className="z-[1001]">
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </TooltipContent>
          </Tooltip>
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

        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground mt-1 h-7 gap-1.5 self-start px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(poi.id);
            }}
          >
            <Info className="size-3" />
            View details
          </Button>
        )}
      </div>
    </div>
  );
});
