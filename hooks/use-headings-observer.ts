"use client";

import { useEffect, useState, useCallback } from "react";
import type { Heading } from "./use-extract-headings";

export function useHeadingsObserver(
  headings: Heading[],
  container: HTMLElement | null,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  const calculateActiveHeading = useCallback(() => {
    if (!container || headings.length === 0) return;

    const stickyHeader = container.querySelector('[role="tablist"]');
    const offset = stickyHeader
      ? stickyHeader.getBoundingClientRect().height + 40
      : 100;

    const scrollTop = container.scrollTop + offset;

    let active = headings[0];
    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el && el.offsetTop <= scrollTop) {
        active = heading;
      } else {
        break;
      }
    }

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const maxScroll = scrollHeight - clientHeight;
    const isAtMaxScroll = maxScroll > 0 && container.scrollTop >= maxScroll - 10;

    if (isAtMaxScroll) {
      const lastHeading = headings[headings.length - 1];
      const lastHeadingEl = document.getElementById(lastHeading.id);
      if (lastHeadingEl) {
        const lastHeadingTop = lastHeadingEl.getBoundingClientRect().top;
        const containerTop = container.getBoundingClientRect().top;
        const relativeTop = lastHeadingTop - containerTop;

        if (relativeTop < clientHeight * 0.6) {
          setActiveId(lastHeading.id);
          return;
        }
      }
    }

    setActiveId(active.id);
  }, [container, headings]);

  useEffect(() => {
    if (!container || headings.length === 0) return;

    const timeoutId = setTimeout(calculateActiveHeading, 50);

    return () => clearTimeout(timeoutId);
  }, [container, headings, calculateActiveHeading]);

  useEffect(() => {
    if (!container) return;

    const handleScroll = () => {
      calculateActiveHeading();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [container, calculateActiveHeading]);

  return activeId;
}
