import type { WeatherEffectParams } from "./types";
import { getTimeOfDay } from "./parameter-mapper";
import { getNearestCheckpoint } from "./tuning";
import type { WeatherEffectsCanvasProps } from "./weather-effects-types";
import { DISCRETE_WEATHER_EFFECTS_CANVAS_PRESETS } from "./generated/discrete-canvas-presets.generated";
import type { WeatherConditionCode } from "../schema";

function resolveRuntimeTimeOfDay(input: { timeOfDay?: number; timestamp?: string }) {
  if (typeof input.timeOfDay === "number") {
    return ((input.timeOfDay % 1) + 1) % 1;
  }

  return getTimeOfDay(input.timestamp);
}

export interface ResolveRuntimeWeatherEffectsCanvasPropsInput
  extends WeatherEffectParams {
  /**
   * Optional explicit time-of-day (0-1) used for nearest checkpoint selection.
   * When omitted, it is derived from `timestamp`.
   */
  timeOfDay?: number;
}

export function resolveWeatherEffectsCanvasRuntimeProps(
  input: ResolveRuntimeWeatherEffectsCanvasPropsInput,
): WeatherEffectsCanvasProps {
  const timeOfDay = resolveRuntimeTimeOfDay(input);
  const checkpoint = getNearestCheckpoint(timeOfDay);
  const fallbackCondition: WeatherConditionCode = "clear";

  const conditionPresets =
    DISCRETE_WEATHER_EFFECTS_CANVAS_PRESETS[input.conditionCode] ??
    DISCRETE_WEATHER_EFFECTS_CANVAS_PRESETS[fallbackCondition];
  const preset = conditionPresets[checkpoint] ?? conditionPresets.noon;

  return {
    ...preset,
    layers: preset.layers ? { ...preset.layers } : undefined,
    celestial: preset.celestial ? { ...preset.celestial } : undefined,
    cloud: preset.cloud ? { ...preset.cloud } : undefined,
    rain: preset.rain ? { ...preset.rain } : undefined,
    lightning: preset.lightning ? { ...preset.lightning } : undefined,
    snow: preset.snow ? { ...preset.snow } : undefined,
    glass: preset.glass ? { ...preset.glass } : undefined,
    interactions: preset.interactions ? { ...preset.interactions } : undefined,
    post: preset.post ? { ...preset.post } : undefined,
  };
}
