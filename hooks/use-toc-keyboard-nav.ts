"use client";

import { useEffect, useState, useRef } from "react";
import type { Heading } from "./use-extract-headings";

export function useTocKeyboardNav(
  headings: Heading[],
  onNavigate: (id: string) => void,
) {
  const [focusIndex, setFocusIndex] = useState(-1);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    linkRefs.current = linkRefs.current.slice(0, headings.length);
  }, [headings]);

  useEffect(() => {
    if (focusIndex >= 0 && focusIndex < linkRefs.current.length) {
      linkRefs.current[focusIndex]?.focus();
    }
  }, [focusIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((prev) =>
        prev < headings.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && focusIndex >= 0) {
      e.preventDefault();
      onNavigate(headings[focusIndex].id);
    }
  };

  const setLinkRef = (index: number) => (el: HTMLAnchorElement | null) => {
    linkRefs.current[index] = el;
  };

  return {
    handleKeyDown,
    setLinkRef,
    focusIndex,
  };
}
