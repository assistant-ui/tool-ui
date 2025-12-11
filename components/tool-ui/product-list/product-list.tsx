"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn, Button, ChevronLeft, ChevronRight } from "./_ui";
import { ProductCard } from "./product-card";
import type { ProductListProps } from "./schema";

const CARD_WIDTH = 180;
const GAP = 12;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export function ProductList({
  id,
  products,
  className,
  onProductClick,
  onProductAction,
}: ProductListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();

    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (products.length === 0) {
    return (
      <div className={cn("flex h-48 items-center justify-center", className)}>
        <p className="text-sm text-muted-foreground">No products to display</p>
      </div>
    );
  }

  return (
    <div
      className={cn("@container relative w-full", className)}
      data-product-list-id={id}
    >
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm @md:flex"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 shadow-md backdrop-blur-sm @md:flex"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className="scrollbar-subtle flex gap-3 overflow-x-auto px-1 py-2"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onProductAction={onProductAction}
          />
        ))}
      </div>
    </div>
  );
}
