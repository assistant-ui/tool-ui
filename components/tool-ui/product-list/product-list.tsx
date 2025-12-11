"use client";

import * as React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn, Button, ChevronLeft, ChevronRight } from "./_ui";
import { ProductCard } from "./product-card";
import type { ProductListProps } from "./schema";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function smoothScrollTo(
  element: HTMLElement,
  targetScrollLeft: number,
  duration = 300,
) {
  const startScrollLeft = element.scrollLeft;
  const distance = targetScrollLeft - startScrollLeft;
  const startTime = performance.now();

  // Temporarily disable scroll snap during animation
  element.style.scrollSnapType = "none";

  function step() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    element.scrollLeft = startScrollLeft + distance * eased;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Ensure we land exactly on target
      element.scrollLeft = targetScrollLeft;
      console.log("Animation complete:", {
        targetScrollLeft,
        actualScrollLeft: element.scrollLeft,
      });
      // Re-enable scroll snap after a brief delay to prevent snap jump
      requestAnimationFrame(() => {
        console.log("Before re-enable snap:", element.scrollLeft);
        element.style.scrollSnapType = "";
        requestAnimationFrame(() => {
          console.log("After re-enable snap:", element.scrollLeft);
        });
      });
    }
  }

  requestAnimationFrame(step);
}

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
    setCanScrollLeft(scrollLeft > 1);
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

    const cards = Array.from(
      container.querySelectorAll("[data-product-id]"),
    ) as HTMLElement[];
    if (cards.length === 0) return;

    const scrollLeft = container.scrollLeft;

    // Snap to each card's offsetLeft - this positions the card flush with the
    // container's left edge, fully hiding the previous card.
    // For the first card, snap to 0 to maintain the initial padding.
    const snapPositions = cards.map((card, index) =>
      index === 0 ? 0 : card.offsetLeft,
    );

    // Log for debugging - remove once working
    console.log({
      snapPositions,
      scrollLeft,
      offsets: cards.map((c) => c.offsetLeft),
    });

    // Find the current snap index
    let currentIndex = 0;
    for (let i = 0; i < snapPositions.length; i++) {
      if (Math.abs(snapPositions[i] - scrollLeft) < 5) {
        currentIndex = i;
        break;
      } else if (snapPositions[i] > scrollLeft) {
        currentIndex = Math.max(0, i - 1);
        break;
      } else if (i === snapPositions.length - 1) {
        currentIndex = i;
      }
    }

    let targetIndex: number;
    if (direction === "right") {
      targetIndex = Math.min(currentIndex + 1, cards.length - 1);
    } else {
      targetIndex = Math.max(currentIndex - 1, 0);
    }

    const targetScrollLeft = snapPositions[targetIndex];

    console.log({ currentIndex, targetIndex, targetScrollLeft });

    if (Math.abs(targetScrollLeft - scrollLeft) > 1) {
      smoothScrollTo(container, targetScrollLeft);
    }
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
        className={cn(
          "flex gap-3 overflow-x-auto overscroll-x-contain py-2 px-4",
          "snap-x snap-proximity",
          "scrollbar-subtle",
        )}
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
