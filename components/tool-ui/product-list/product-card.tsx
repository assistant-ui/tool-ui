"use client";

import * as React from "react";
import { cn, Button, Card } from "./_adapter";
import type { Product } from "./schema";

interface ProductCardProps {
  product: Product;
  onProductClick?: (productId: string) => void;
  onProductAction?: (productId: string, actionId: string) => void;
}

export function ProductCard({
  product,
  onProductClick,
  onProductAction,
}: ProductCardProps) {
  const { id, name, price, image, color, actions } = product;
  const isCardInteractive = typeof onProductClick === "function";

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isCardInteractive) return;
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onProductClick?.(id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (!isCardInteractive) return;
    if ((e.target as HTMLElement).closest("button")) return;

    if (e.key === " ") {
      // Prevent the page from scrolling when the card is focused.
      e.preventDefault();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      onProductClick?.(id);
    }
  };

  const handleCardKeyUp = (e: React.KeyboardEvent) => {
    if (!isCardInteractive) return;
    if ((e.target as HTMLElement).closest("button")) return;

    if (e.key === " ") {
      e.preventDefault();
      onProductClick?.(id);
    }
  };

  const handleActionClick = (actionId: string) => {
    onProductAction?.(id, actionId);
  };

  return (
    <Card
      className={cn(
        "group relative flex w-[168px] shrink-0 flex-col gap-0 overflow-hidden p-0 @md:w-[180px] @lg:w-[200px]",
        "transition-shadow",
        isCardInteractive && "cursor-pointer hover:shadow",
        isCardInteractive &&
          "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "touch-manipulation",
      )}
      role={isCardInteractive ? "button" : undefined}
      tabIndex={isCardInteractive ? 0 : undefined}
      aria-label={isCardInteractive ? `View product: ${name}` : undefined}
      onClick={isCardInteractive ? handleCardClick : undefined}
      onKeyDown={isCardInteractive ? handleCardKeyDown : undefined}
      onKeyUp={isCardInteractive ? handleCardKeyUp : undefined}
    >
      <div className="bg-muted relative aspect-square w-full overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- copy-standalone portability (Next/Image requires app-level config)
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              isCardInteractive && "group-hover:scale-105",
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full transition-transform duration-300",
              isCardInteractive && "group-hover:scale-105",
            )}
            style={color ? { backgroundColor: color } : undefined}
            role="img"
            aria-label={name}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm leading-tight font-medium">
          {name}
        </h3>

        <p className="text-foreground text-sm font-semibold">{price}</p>

        {actions && actions.length > 0 && (
          <div
            className={cn(
              "mt-auto flex flex-wrap justify-end gap-2 pt-1",
              actions.length === 1 && "[&>button]:flex-1",
            )}
          >
            {actions.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant={action.variant ?? "default"}
                size="sm"
                disabled={action.disabled}
                className="h-7 min-w-0 flex-1 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action.id);
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
