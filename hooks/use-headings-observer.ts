"use client";

import { useEffect, useState } from "react";
import type { Heading } from "./use-extract-headings";

export function useHeadingsObserver(
  headings: Heading[],
  container: HTMLElement | null,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!container || headings.length === 0) return;

    let observer: IntersectionObserver | null = null;

    const timeoutId = setTimeout(() => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => el !== null);

      if (headingElements.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          const intersecting = entries.filter((e) => e.isIntersecting);

          if (intersecting.length > 0) {
            const sorted = intersecting.sort(
              (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
            );
            setActiveId(sorted[0].target.id);
          }
        },
        {
          root: container,
          rootMargin: "-20% 0px -35% 0px",
          threshold: [0, 0.5, 1],
        },
      );

      headingElements.forEach((el) => observer!.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [headings, container]);

  return activeId;
}
