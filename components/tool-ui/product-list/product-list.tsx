"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn, Button, Card, ChevronLeft, ChevronRight } from "./_ui";
import { ProductCard } from "./product-card";
import type { ProductListProps } from "./schema";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface ScrollAnimation {
  targetScrollLeft: number;
  startScrollLeft: number;
  startTime: number;
  duration: number;
  onComplete?: () => void;
}

export function ProductList({
  id,
  title,
  description,
  products,
  className,
  onProductClick,
  onProductAction,
}: ProductListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetIndexRef = useRef<number | null>(null);
  const activeAnimationRef = useRef<ScrollAnimation | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const smoothScrollTo = useCallback(
    (
      element: HTMLElement,
      targetScrollLeft: number,
      duration = 300,
      onComplete?: () => void,
    ) => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion || duration <= 0) {
        element.scrollLeft = targetScrollLeft;
        onComplete?.();
        return;
      }

      // If animation is in progress, restart from current position.
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const startScrollLeft = element.scrollLeft;
      const startTime = performance.now();

      activeAnimationRef.current = {
        targetScrollLeft,
        startScrollLeft,
        startTime,
        duration,
        onComplete,
      };

      // Temporarily disable scroll snap during animation.
      element.style.scrollSnapType = "none";

      const step = () => {
        const anim = activeAnimationRef.current;
        if (!anim) return;

        const elapsed = performance.now() - anim.startTime;
        const progress = Math.min(elapsed / anim.duration, 1);
        const eased = easeOutCubic(progress);

        const distance = anim.targetScrollLeft - anim.startScrollLeft;
        element.scrollLeft = anim.startScrollLeft + distance * eased;

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
          return;
        }

        element.scrollLeft = anim.targetScrollLeft;
        const callback = anim.onComplete;
        activeAnimationRef.current = null;
        animationFrameRef.current = null;
        requestAnimationFrame(() => {
          element.style.scrollSnapType = "";
          callback?.();
        });
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [],
  );

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Use rounding + a slightly larger threshold to avoid flicker when scroll snapping
    // settles on fractional scroll positions.
    const EDGE_THRESHOLD_PX = 8;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const left = Math.round(scrollLeft);
    const right = Math.round(scrollLeft + clientWidth);
    const max = Math.round(scrollWidth);

    setCanScrollLeft(left > EDGE_THRESHOLD_PX);
    setCanScrollRight(right < max - EDGE_THRESHOLD_PX);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateScrollState();
      });
    };

    scheduleUpdate();

    container.addEventListener("scroll", scheduleUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [updateScrollState, products.length]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      activeAnimationRef.current = null;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const styles = window.getComputedStyle(container);
    const scrollPaddingLeft = Number.parseFloat(styles.scrollPaddingLeft) || 0;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[data-product-item]"),
    );
    if (items.length === 0) return;

    const snapPositions = items.map((item) =>
      Math.max(0, item.offsetLeft - scrollPaddingLeft),
    );

    // If we have a pending target from rapid clicks, use that as base
    // Otherwise, find current position from scroll
    let currentIndex: number;
    if (targetIndexRef.current !== null && activeAnimationRef.current) {
      currentIndex = targetIndexRef.current;
    } else {
      const scrollLeft = container.scrollLeft;
      currentIndex = 0;
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
    }

    let targetIndex: number;
    const itemStepPx =
      items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : 0;
    const safeStepPx = itemStepPx > 0 ? itemStepPx : items[0].offsetWidth || 1;
    const step =
      container.clientWidth >= 640
        ? Math.max(1, Math.floor((container.clientWidth * 0.8) / safeStepPx))
        : 1;

    if (direction === "right") {
      targetIndex = Math.min(currentIndex + step, items.length - 1);
    } else {
      targetIndex = Math.max(currentIndex - step, 0);
    }

    targetIndexRef.current = targetIndex;
    const targetScrollLeft = snapPositions[targetIndex];

    if (Math.abs(targetScrollLeft - container.scrollLeft) > 1) {
      smoothScrollTo(container, targetScrollLeft, 300, () => {
        targetIndexRef.current = null;
      });
    }
  };

  if (products.length === 0) {
    return (
      <Card className={cn("flex h-48 items-center justify-center", className)}>
        <p className="text-muted-foreground text-sm">No products to display</p>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "@container relative w-full gap-0 overflow-hidden p-0",
        className,
      )}
      data-product-list-id={id}
    >
      {(title || description) && (
        <div className="border-border/60 border-b px-4 pt-4 pb-3">
          {title && (
            <h3 className="text-[15px] leading-tight font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground mt-1 text-sm leading-snug">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="group relative">
        <Button
          variant="secondary"
          size="icon-sm"
          className={cn(
            "bg-background/80 absolute top-1/2 left-2 z-20 hidden -translate-y-1/2 rounded-full shadow-sm backdrop-blur-sm",
            "transition-[opacity,transform] duration-200 ease-out will-change-transform motion-reduce:transition-none",
            "@md:flex",
            // Base (hidden)
            "pointer-events-none -translate-x-1 scale-95 opacity-0",
            // Show only when scrollable AND the user is interacting with the carousel area.
            canScrollLeft &&
              "@md:group-hover:pointer-events-auto @md:group-hover:translate-x-0 @md:group-hover:scale-100 @md:group-hover:opacity-100",
            canScrollLeft &&
              "@md:group-focus-within:pointer-events-auto @md:group-focus-within:translate-x-0 @md:group-focus-within:scale-100 @md:group-focus-within:opacity-100",
          )}
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          tabIndex={canScrollLeft ? 0 : -1}
          aria-hidden={!canScrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon-sm"
          className={cn(
            "bg-background/80 absolute top-1/2 right-2 z-20 hidden -translate-y-1/2 rounded-full shadow-sm backdrop-blur-sm",
            "transition-[opacity,transform] duration-200 ease-out will-change-transform motion-reduce:transition-none",
            "@md:flex",
            // Base (hidden)
            "pointer-events-none translate-x-1 scale-95 opacity-0",
            // Show only when scrollable AND the user is interacting with the carousel area.
            canScrollRight &&
              "@md:group-hover:pointer-events-auto @md:group-hover:translate-x-0 @md:group-hover:scale-100 @md:group-hover:opacity-100",
            canScrollRight &&
              "@md:group-focus-within:pointer-events-auto @md:group-focus-within:translate-x-0 @md:group-focus-within:scale-100 @md:group-focus-within:opacity-100",
          )}
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          tabIndex={canScrollRight ? 0 : -1}
          aria-hidden={!canScrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto overscroll-x-contain px-4 py-3",
            "snap-x snap-proximity",
            "scrollbar-subtle",
          )}
          role="list"
          style={{ scrollPadding: "0 1rem" }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-product-item
              data-product-id={product.id}
              role="listitem"
              className="shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                onProductAction={onProductAction}
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
