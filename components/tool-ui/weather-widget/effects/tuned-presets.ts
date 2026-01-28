import type { WeatherCondition } from "../schema";
import type { WeatherEffectsCheckpointOverrides } from "./tuning";

/**
 * Tuned effect overrides per condition + time checkpoint.
 *
 * This file is designed to be generated/copied from the tuning studio export.
 */
export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES: Partial<
  Record<WeatherCondition, WeatherEffectsCheckpointOverrides>
> = {};

