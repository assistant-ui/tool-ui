"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useQueryState } from "nuqs";

interface UseTabSearchParamOptions<T extends string> {
  paramName?: string;
  defaultTab: T;
  validTabs: readonly T[];
  scrollTargetRef?: RefObject<HTMLElement | null>;
  hashTrigger?: string;
}

interface UseTabSearchParamReturn<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

export function useTabSearchParam<T extends string>({
  paramName = "tab",
  defaultTab,
  validTabs,
  scrollTargetRef,
  hashTrigger,
}: UseTabSearchParamOptions<T>): UseTabSearchParamReturn<T> {
  const isInitialMount = useRef(true);
  const validTabsSet = useRef(new Set(validTabs));

  const [rawTab, setRawTab] = useQueryState(paramName);

  const isValidTab = (value: string | null): value is T => {
    return value !== null && validTabsSet.current.has(value as T);
  };

  const activeTab = isValidTab(rawTab) ? rawTab : defaultTab;

  // Handle hash trigger (e.g., #examples in URL)
  useEffect(() => {
    if (!hashTrigger || typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash === hashTrigger) {
      const hashTab = hashTrigger.replace("#", "") as T;
      if (validTabsSet.current.has(hashTab) && rawTab !== hashTab) {
        setRawTab(hashTab);
      }
    }
  }, [hashTrigger, rawTab, setRawTab]);

  // Handle scroll to target when switching to hash-triggered tab
  useEffect(() => {
    if (
      scrollTargetRef?.current &&
      hashTrigger &&
      activeTab === hashTrigger.replace("#", "") &&
      !isInitialMount.current
    ) {
      scrollTargetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    isInitialMount.current = false;
  }, [activeTab, hashTrigger, scrollTargetRef]);

  const setActiveTab = useCallback(
    (newTab: T) => {
      if (newTab === activeTab) return;
      setRawTab(newTab);
    },
    [activeTab, setRawTab],
  );

  return { activeTab, setActiveTab };
}
