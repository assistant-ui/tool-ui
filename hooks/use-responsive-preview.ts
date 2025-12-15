"use client";

import { useCallback, useRef } from "react";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";

interface UseResponsivePreviewOptions {
  minWidth: number;
  maxWidth: number;
  tolerance?: number;
}

interface UseResponsivePreviewReturn {
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
}

type PreviewLayoutSizes = [
  leftGutter: number,
  previewWidth: number,
  rightGutter: number,
];

const layoutMatchesTarget = (
  actual: number[],
  target: number[],
  tolerance: number,
): boolean => {
  if (actual.length !== target.length) return false;
  return actual.every((val, i) => Math.abs(val - target[i]) < tolerance);
};

export function useResponsivePreview({
  minWidth,
  maxWidth,
  tolerance = 0.5,
}: UseResponsivePreviewOptions): UseResponsivePreviewReturn {
  const panelGroupRef = useRef<ImperativePanelGroupHandle | null>(null);
  const isSyncing = useRef(false);

  const handleLayout = useCallback(
    (sizes: number[]) => {
      if (!panelGroupRef.current) return;

      if (isSyncing.current) {
        isSyncing.current = false;
        return;
      }

      if (sizes.length !== 3) return;
      const [, previewWidth] = sizes as PreviewLayoutSizes;

      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, previewWidth));
      const gutter = Math.max(0, (100 - clampedWidth) / 2);
      const targetLayout: PreviewLayoutSizes = [gutter, clampedWidth, gutter];

      if (!layoutMatchesTarget(sizes, targetLayout, tolerance)) {
        isSyncing.current = true;
        panelGroupRef.current.setLayout(targetLayout);
      }
    },
    [minWidth, maxWidth, tolerance],
  );

  return { panelGroupRef, handleLayout };
}
