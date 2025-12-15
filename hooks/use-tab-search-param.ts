"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabState] = useState<T>(defaultTab);
  const isInitialMount = useRef(true);

  const validTabsSet = useMemo(() => new Set(validTabs), [validTabs]);

  const isValidTab = useCallback(
    (value: string | null): value is T => {
      return value !== null && validTabsSet.has(value as T);
    },
    [validTabsSet],
  );

  const currentParamValue = useMemo(
    () => searchParams.get(paramName),
    [searchParams, paramName],
  );

  useEffect(() => {
    const getWindowHash = () =>
      typeof window === "undefined" ? "" : window.location.hash;

    if (isValidTab(currentParamValue)) {
      setActiveTabState((prev) =>
        prev === currentParamValue ? prev : currentParamValue,
      );

      if (
        scrollTargetRef?.current &&
        hashTrigger &&
        currentParamValue === hashTrigger.replace("#", "") &&
        getWindowHash() === hashTrigger &&
        !isInitialMount.current
      ) {
        scrollTargetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      isInitialMount.current = false;
      return;
    }

    if (hashTrigger) {
      const hash = getWindowHash();
      if (hash === hashTrigger) {
        const hashTab = hashTrigger.replace("#", "") as T;
        if (isValidTab(hashTab)) {
          setActiveTabState((prev) => (prev === hashTab ? prev : hashTab));
          isInitialMount.current = false;
          return;
        }
      }
    }

    setActiveTabState((prev) => (prev === defaultTab ? prev : defaultTab));
    isInitialMount.current = false;
  }, [
    currentParamValue,
    defaultTab,
    isValidTab,
    hashTrigger,
    scrollTargetRef,
  ]);

  const setActiveTab = useCallback(
    (newTab: T) => {
      setActiveTabState(newTab);

      if (currentParamValue === newTab) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, newTab);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName, currentParamValue],
  );

  return { activeTab, setActiveTab };
}
