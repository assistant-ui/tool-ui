"use client";

import * as React from "react";
import { cn, Button, Card } from "./_ui";
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
  const { id, name, price, image, available = true, actions } = product;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    onProductClick?.(id);
  };

  const handleActionClick = (actionId: string) => {
    onProductAction?.(id, actionId);
  };

  return (
    <Card
      className={cn(
        "group relative flex w-[180px] shrink-0 cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md",
        !available && "opacity-75",
      )}
      onClick={handleCardClick}
      data-product-id={id}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">
          {name}
        </h3>

        <p className="text-sm font-semibold text-foreground">{price}</p>

        {actions && actions.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant ?? "default"}
                size="sm"
                disabled={action.disabled}
                className="h-7 flex-1 px-2 text-xs"
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
