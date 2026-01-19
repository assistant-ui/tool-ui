export { EffectCompositor } from "./effect-compositor";
export type { CustomEffectProps } from "./effect-compositor";
export { mapWeatherToEffects, getSunAltitude, isNightTime, getTimeOfDay, getMoonPhase } from "./parameter-mapper";
export type {
  EffectSettings,
  EffectQuality,
  EffectLayerConfig,
  WeatherEffectParams,
  CelestialConfig,
} from "./types";

export { WeatherEffectsCanvas } from "./weather-effects-canvas";
export type {
  WeatherEffectsCanvasProps,
  CelestialParams,
  CloudParams,
  RainParams,
  LightningParams,
  SnowParams,
  InteractionParams,
  LayerToggles,
} from "./weather-effects-canvas";
