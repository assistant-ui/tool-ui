"use client";

import type { CSSProperties } from "react";
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
      element.scrollLeft = targetScrollLeft;
      requestAnimationFrame(() => {
        element.style.scrollSnapType = "";
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

    if (Math.abs(targetScrollLeft - scrollLeft) > 1) {
      smoothScrollTo(container, targetScrollLeft);
    }
  };

  const getMaskStyle = (): CSSProperties => {
    const fadeWidth = 36;

    // Two mask layers, one for each edge
    // Left layer: fades from left edge, positioned from left
    // Right layer: fades from right edge, positioned from right
    const leftMask = `linear-gradient(to right, transparent, black ${fadeWidth}px, black 100%)`;
    const rightMask = `linear-gradient(to left, transparent, black ${fadeWidth}px, black 100%)`;

    // Animate mask-position per layer to show/hide each fade
    // Left layer: 0 = fade visible, -fadeWidth = fade hidden (slides left)
    // Right layer: positioned from right edge, 0 = fade visible, -fadeWidth = fade hidden (slides right)
    const leftPos = canScrollLeft ? 0 : -fadeWidth;
    const rightPos = canScrollRight ? 0 : -fadeWidth;

    return {
      maskImage: `${leftMask}, ${rightMask}`,
      WebkitMaskImage: `${leftMask}, ${rightMask}`,
      maskSize: `calc(100% + ${fadeWidth}px) 100%, calc(100% + ${fadeWidth}px) 100%`,
      WebkitMaskSize: `calc(100% + ${fadeWidth}px) 100%, calc(100% + ${fadeWidth}px) 100%`,
      maskPosition: `left ${leftPos}px top 0, right ${rightPos}px top 0`,
      WebkitMaskPosition: `left ${leftPos}px top 0, right ${rightPos}px top 0`,
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
      transition: "mask-position 200ms ease-out, -webkit-mask-position 200ms ease-out",
    };
  };

  if (products.length === 0) {
    return (
      <div className={cn("flex h-48 items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">No products to display</p>
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
          className="bg-background/80 absolute top-1/2 left-2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-md backdrop-blur-sm @md:flex"
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
          className="bg-background/80 absolute top-1/2 right-2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full shadow-md backdrop-blur-sm @md:flex"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollRef}
        style={getMaskStyle()}
        className={cn(
          "flex gap-3 overflow-x-auto overscroll-x-contain px-4 py-2",
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
