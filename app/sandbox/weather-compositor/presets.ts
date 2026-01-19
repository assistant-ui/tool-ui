import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import {
  mapWeatherToEffects,
  getTimeOfDay,
} from "@/components/tool-ui/weather-widget/effects";

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  "clear",
  "partly-cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "sleet",
  "hail",
  "windy",
];

export const CONDITION_LABELS: Record<WeatherCondition, string> = {
  clear: "Clear",
  "partly-cloudy": "Partly Cloudy",
  cloudy: "Cloudy",
  overcast: "Overcast",
  fog: "Fog",
  drizzle: "Drizzle",
  rain: "Rain",
  "heavy-rain": "Heavy Rain",
  thunderstorm: "Thunderstorm",
  snow: "Snow",
  sleet: "Sleet",
  hail: "Hail",
  windy: "Windy",
};

export interface LayerToggles {
  celestial: boolean;
  clouds: boolean;
  rain: boolean;
  lightning: boolean;
  snow: boolean;
}

export interface CelestialParams {
  timeOfDay: number;
  moonPhase: number;
  starDensity: number;
  celestialX: number;
  celestialY: number;
  sunSize: number;
  moonSize: number;
}

export interface CloudParams {
  coverage: number;
  density: number;
  softness: number;
  windSpeed: number;
  turbulence: number;
  numLayers: number;
  ambientDarkness: number;
  horizonLine: number;
}

export interface RainParams {
  glassIntensity: number;
  fallingIntensity: number;
  fallingAngle: number;
  fallingLayers: number;
}

export interface LightningParams {
  autoMode: boolean;
  autoInterval: number;
  sceneIllumination: number;
}

export interface SnowParams {
  intensity: number;
  snowWindSpeed: number;
  drift: number;
  snowLayers: number;
}

export interface ConditionOverrides {
  layers?: Partial<LayerToggles>;
  celestial?: Partial<CelestialParams>;
  cloud?: Partial<CloudParams>;
  rain?: Partial<RainParams>;
  lightning?: Partial<LightningParams>;
  snow?: Partial<SnowParams>;
}

export interface GlobalSettings {
  timeOfDay: number;
}

export interface CompositorState {
  activeCondition: WeatherCondition;
  globalSettings: GlobalSettings;
  overrides: Partial<Record<WeatherCondition, ConditionOverrides>>;
}

export interface FullCompositorParams {
  layers: LayerToggles;
  celestial: CelestialParams;
  cloud: CloudParams;
  rain: RainParams;
  lightning: LightningParams;
  snow: SnowParams;
}

export function getBaseParamsForCondition(
  condition: WeatherCondition,
  timestamp?: string
): FullCompositorParams {
  const effectConfig = mapWeatherToEffects({
    condition,
    timestamp,
  });

  const timeOfDay = timestamp ? getTimeOfDay(timestamp) : 0.5;

  const hasCloud = effectConfig.cloud !== undefined;
  const hasRain = effectConfig.rain !== undefined;
  const hasLightning = effectConfig.lightning !== undefined;
  const hasSnow = effectConfig.snow !== undefined;

  const lightningIntervalMin = effectConfig.lightning?.intervalMin ?? 4;
  const lightningIntervalMax = effectConfig.lightning?.intervalMax ?? 12;

  return {
    layers: {
      celestial: true,
      clouds: hasCloud,
      rain: hasRain,
      lightning: hasLightning,
      snow: hasSnow,
    },
    celestial: {
      timeOfDay,
      moonPhase: effectConfig.celestial?.moonPhase ?? 0.5,
      starDensity: effectConfig.celestial?.starDensity ?? 0.5,
      celestialX: 0.5,
      celestialY: 0.72,
      sunSize: 0.06,
      moonSize: 0.05,
    },
    cloud: {
      coverage: effectConfig.cloud?.coverage ?? 0.5,
      density: 0.7,
      softness: 0.3,
      windSpeed: effectConfig.cloud?.speed ?? 0.5,
      turbulence: effectConfig.cloud?.turbulence ?? 0.5,
      numLayers: 3,
      ambientDarkness: effectConfig.cloud?.darkness ?? 0.3,
      horizonLine: 0.5,
    },
    rain: {
      glassIntensity: hasRain ? (effectConfig.rain?.intensity ?? 0.5) * 0.7 : 0,
      fallingIntensity: hasRain ? effectConfig.rain?.intensity ?? 0.6 : 0,
      fallingAngle: hasRain ? (effectConfig.rain?.angle ?? 5) * 0.02 : 0.1,
      fallingLayers: 3,
    },
    lightning: {
      autoMode: hasLightning ? effectConfig.lightning?.autoTrigger ?? true : false,
      autoInterval: hasLightning ? (lightningIntervalMin + lightningIntervalMax) / 2 : 8,
      sceneIllumination: 0.6,
    },
    snow: {
      intensity: hasSnow ? effectConfig.snow?.intensity ?? 0.7 : 0,
      snowWindSpeed: hasSnow ? effectConfig.snow?.windDrift ?? 0.3 : 0.3,
      drift: hasSnow ? effectConfig.snow?.windDrift ?? 0.3 : 0.3,
      snowLayers: 4,
    },
  };
}

export function mergeWithOverrides(
  base: FullCompositorParams,
  overrides?: ConditionOverrides
): FullCompositorParams {
  if (!overrides) return base;

  return {
    layers: { ...base.layers, ...overrides.layers },
    celestial: { ...base.celestial, ...overrides.celestial },
    cloud: { ...base.cloud, ...overrides.cloud },
    rain: { ...base.rain, ...overrides.rain },
    lightning: { ...base.lightning, ...overrides.lightning },
    snow: { ...base.snow, ...overrides.snow },
  };
}

export function extractOverrides(
  current: FullCompositorParams,
  base: FullCompositorParams
): ConditionOverrides {
  const overrides: ConditionOverrides = {};

  const layerDiff = diffObjects(current.layers, base.layers);
  if (Object.keys(layerDiff).length > 0) overrides.layers = layerDiff;

  // Exclude timeOfDay from celestial comparison (it's a global setting)
  const celestialDiff = diffObjects(current.celestial, base.celestial, ["timeOfDay"]);
  if (Object.keys(celestialDiff).length > 0) overrides.celestial = celestialDiff;

  const cloudDiff = diffObjects(current.cloud, base.cloud);
  if (Object.keys(cloudDiff).length > 0) overrides.cloud = cloudDiff;

  const rainDiff = diffObjects(current.rain, base.rain);
  if (Object.keys(rainDiff).length > 0) overrides.rain = rainDiff;

  const lightningDiff = diffObjects(current.lightning, base.lightning);
  if (Object.keys(lightningDiff).length > 0) overrides.lightning = lightningDiff;

  const snowDiff = diffObjects(current.snow, base.snow);
  if (Object.keys(snowDiff).length > 0) overrides.snow = snowDiff;

  return overrides;
}

function diffObjects<T extends object>(
  current: T,
  base: T,
  exclude: string[] = []
): Partial<T> {
  const diff: Partial<T> = {};
  for (const key of Object.keys(current) as (keyof T)[]) {
    if (exclude.includes(key as string)) continue;
    if (current[key] !== base[key]) {
      diff[key] = current[key];
    }
  }
  return diff;
}

const STORAGE_KEY = "weather-compositor-state";

export function loadFromStorage(): CompositorState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CompositorState;
  } catch {
    return null;
  }
}

export function saveToStorage(state: CompositorState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("Failed to save compositor state to localStorage");
  }
}

export function exportToFile(state: CompositorState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weather-compositor-presets.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(file: File): Promise<CompositorState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string) as CompositorState;
        resolve(state);
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
