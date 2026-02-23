import type { WeatherEffectParams } from "./types";
import { buildCanvasBaseFromWeather } from "./canvas-resolver-base";
import {
  applyWeatherEffectsOverrides,
  getNearestCheckpoint,
  type WeatherEffectsTunedPresets,
} from "./tuning";
import type { WeatherEffectsCanvasProps } from "./weather-effects-types";

export interface ResolveRuntimeWeatherEffectsCanvasPropsInput extends WeatherEffectParams {
  tunedPresets?: WeatherEffectsTunedPresets;
  /**
   * Optional explicit time-of-day (0-1) used for nearest checkpoint selection.
   * When omitted, it is derived from `timestamp`.
   */
  timeOfDay?: number;
}

export function resolveWeatherEffectsCanvasRuntimeProps(
  input: ResolveRuntimeWeatherEffectsCanvasPropsInput,
): WeatherEffectsCanvasProps {
  const base = buildCanvasBaseFromWeather(input);
  const explicitTimeOfDay = input.timeOfDay;

  if (typeof explicitTimeOfDay === "number" && base.celestial) {
    base.celestial.timeOfDay = explicitTimeOfDay;
  }

  const conditionCheckpoints = input.tunedPresets?.[input.conditionCode];
  const timeOfDay = explicitTimeOfDay ?? base.celestial?.timeOfDay;
  if (!conditionCheckpoints || timeOfDay === undefined) {
    return base;
  }

  const checkpoint = getNearestCheckpoint(timeOfDay);
  return applyWeatherEffectsOverrides(base, conditionCheckpoints[checkpoint]);
}
