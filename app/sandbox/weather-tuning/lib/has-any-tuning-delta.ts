import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";

export function hasAnyTuningDelta(
  checkpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >,
): boolean {
  return Object.values(checkpointOverrides).some((byCheckpoint) => {
    if (!byCheckpoint) return false;
    return Object.values(byCheckpoint).some((checkpointData) => {
      return Boolean(checkpointData && Object.keys(checkpointData).length > 0);
    });
  });
}
