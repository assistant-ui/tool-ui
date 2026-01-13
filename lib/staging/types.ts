import type { RefObject, ReactNode } from "react";
import type { ComponentId } from "@/lib/docs/preview-config";

export type DebugLevel = "off" | "boundaries" | "margins" | "full";

export interface StagingConfig {
  supportedDebugLevels: DebugLevel[];
  renderDebugOverlay?: (props: {
    level: DebugLevel;
    componentRef: RefObject<HTMLElement | null>;
  }) => ReactNode;
  renderTuningPanel?: (props: {
    data: Record<string, unknown>;
  }) => ReactNode;
}

export type { ComponentId };
