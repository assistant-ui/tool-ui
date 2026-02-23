import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";

type RecoverPayload = {
  checkpointOverrides?: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >;
};

export async function recoverRepoCheckpointOverrides(
  fetchImpl: typeof fetch = fetch,
): Promise<Partial<Record<WeatherConditionCode, CheckpointOverrides>> | null> {
  try {
    const response = await fetchImpl("/api/weather-tuning/recover", {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as RecoverPayload;
    if (!payload?.checkpointOverrides) return null;
    return payload.checkpointOverrides;
  } catch {
    return null;
  }
}
