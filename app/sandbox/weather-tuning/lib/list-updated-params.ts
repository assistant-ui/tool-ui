import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";

type CheckpointKey = keyof CheckpointOverrides;

const CHECKPOINTS: CheckpointKey[] = ["dawn", "noon", "dusk", "midnight"];

export function listUpdatedParams(
  checkpointOverrides: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >,
): string[] {
  const out: string[] = [];

  for (const condition of Object.keys(
    checkpointOverrides,
  ) as WeatherConditionCode[]) {
    const byCheckpoint = checkpointOverrides[condition];
    if (!byCheckpoint) continue;

    for (const checkpoint of CHECKPOINTS) {
      const overrideGroups = byCheckpoint[checkpoint];
      if (!overrideGroups) continue;

      for (const [groupKey, groupValue] of Object.entries(overrideGroups)) {
        if (!groupValue || typeof groupValue !== "object") continue;
        for (const paramKey of Object.keys(groupValue)) {
          out.push(`${condition}.${checkpoint}.${groupKey}.${paramKey}`);
        }
      }
    }
  }

  return out;
}
