"use client";

import * as React from "react";

/**
 * Synchronously detects browser support for CSS Container Queries.
 *
 * This is a pure function that can be called safely during render
 * without causing hydration mismatches.
 *
 * @returns `true` if container queries are supported, `false` otherwise
 */
function detectContainerQuerySupport(): boolean {
  if (typeof window === "undefined" || typeof CSS === "undefined") {
    return false; // SSR or no CSS object
  }

  if (typeof CSS.supports !== "function") {
    return false; // Very old browsers without CSS.supports
  }

  return CSS.supports("container-type", "inline-size");
}

/**
 * Hook to detect browser support for CSS Container Queries.
 *
 * Container queries are supported in:
 * - Chrome/Edge 105+ (Sept 2022)
 * - Safari 16+ (Sept 2022)
 * - Firefox 110+ (Feb 2023)
 *
 * For older browsers, the hook returns `false` and components should
 * fall back to regular media queries.
 *
 * **Implementation notes:**
 * - Detection happens synchronously during first render to prevent layout flash
 * - Initialized conservatively to `false` to avoid false positives
 * - SSR-safe: returns `false` on server, hydrates correctly on client
 *
 * @returns `true` if container queries are supported, `false` otherwise
 *
 * @example
 * ```tsx
 * const supportsContainerQueries = useSupportsContainerQueries()
 *
 * <div className={supportsContainerQueries ? "@container" : ""}>
 *   <div className={supportsContainerQueries ? "@md:block" : "md:block"}>
 *     Content
 *   </div>
 * </div>
 * ```
 */
export function useSupportsContainerQueries(): boolean {
  const [supported, setSupported] = React.useState(() => detectContainerQuerySupport());

  React.useEffect(() => {
    // Double-check after mount in case of SSR hydration
    const actualSupport = detectContainerQuerySupport();
    if (actualSupport !== supported) {
      setSupported(actualSupport);
    }
  }, [supported]);

  return supported;
}
