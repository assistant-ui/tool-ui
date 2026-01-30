import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { ConditionOverrides } from "../weather-compositor/presets";

export type CheckpointStatus = "pending" | "reviewed";

export interface ConditionCheckpoints {
  dawn: CheckpointStatus;
  noon: CheckpointStatus;
  dusk: CheckpointStatus;
  midnight: CheckpointStatus;
}

export type CompareMode = "off" | "ab" | "side-by-side";

export interface TuningState {
  overrides: Partial<Record<WeatherCondition, ConditionOverrides>>;
  globalTimeOfDay: number;

  selectedCondition: WeatherCondition | null;
  expandedGroups: Set<string>;
  compareMode: CompareMode;
  compareTarget: WeatherCondition | null;
  showWidgetOverlay: boolean;

  checkpoints: Partial<Record<WeatherCondition, ConditionCheckpoints>>;
  signedOff: Set<WeatherCondition>;
}

export type { TimeCheckpoint } from "@/components/tool-ui/weather-widget/effects/tuning";
