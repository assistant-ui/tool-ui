"use client";

import * as React from "react";

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
  const [supported, setSupported] = React.useState(true); // Optimistic default

  React.useEffect(() => {
    if (typeof window !== "undefined" && typeof CSS !== "undefined") {
      // Check if CSS.supports is available
      if (typeof CSS.supports === "function") {
        const hasSupport = CSS.supports("container-type", "inline-size");
        setSupported(hasSupport);
      } else {
        // Very old browsers without CSS.supports
        setSupported(false);
      }
    }
  }, []);

  return supported;
}
