import type { TimeCheckpoint } from "../types";

export const TIME_CHECKPOINTS: Record<TimeCheckpoint, { value: number; label: string }> = {
  dawn: { value: 0.25, label: "Dawn" },
  noon: { value: 0.5, label: "Noon" },
  dusk: { value: 0.75, label: "Dusk" },
  midnight: { value: 0.0, label: "Night" },
};

export const TIME_CHECKPOINT_ORDER: TimeCheckpoint[] = ["dawn", "noon", "dusk", "midnight"];

export const STORAGE_KEY = "weather-tuning-state";
export const SESSION_KEY = "weather-tuning-workflow";

export const DEFAULT_TIME_OF_DAY = 0.5;
