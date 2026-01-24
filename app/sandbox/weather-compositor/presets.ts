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
  sunGlowIntensity: number;
  sunGlowSize: number;
  sunRayCount: number;
  sunRayLength: number;
  sunRayIntensity: number;
  moonGlowIntensity: number;
  moonGlowSize: number;
  skyBrightness: number;
  skySaturation: number;
  skyContrast: number;
}

export interface CloudParams {
  cloudScale: number;
  coverage: number;
  density: number;
  softness: number;
  windSpeed: number;
  windAngle: number;
  turbulence: number;
  sunAzimuth: number;
  lightIntensity: number;
  ambientDarkness: number;
  backlightIntensity: number;
  numLayers: number;
  layerSpread: number;
  starSize: number;
  starTwinkleSpeed: number;
  starTwinkleAmount: number;
  horizonLine: number;
}

export interface RainParams {
  glassIntensity: number;
  zoom: number;
  fallingIntensity: number;
  fallingSpeed: number;
  fallingAngle: number;
  fallingStreakLength: number;
  fallingLayers: number;
  fallingRefraction: number;
  fallingWaviness: number;
  fallingThicknessVar: number;
}

export interface LightningParams {
  branchDensity: number;
  displacement: number;
  glowIntensity: number;
  flashDuration: number;
  sceneIllumination: number;
  afterglowPersistence: number;
  autoMode: boolean;
  autoInterval: number;
}

export interface SnowParams {
  intensity: number;
  layers: number;
  fallSpeed: number;
  windSpeed: number;
  windAngle: number;
  turbulence: number;
  drift: number;
  flutter: number;
  windShear: number;
  flakeSize: number;
  sizeVariation: number;
  opacity: number;
  glowAmount: number;
  sparkle: number;
  visibility: number;
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

export interface CheckpointOverrides {
  dawn: ConditionOverrides;
  noon: ConditionOverrides;
  dusk: ConditionOverrides;
  midnight: ConditionOverrides;
}

export interface CompositorStateV1 {
  activeCondition: WeatherCondition;
  globalSettings: GlobalSettings;
  overrides: Partial<Record<WeatherCondition, ConditionOverrides>>;
}

export interface CompositorState {
  version: 2;
  activeCondition: WeatherCondition;
  globalSettings: GlobalSettings;
  checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>;
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
      celestialX: effectConfig.celestial?.celestialX ?? 0.5,
      celestialY: effectConfig.celestial?.celestialY ?? 0.72,
      sunSize: effectConfig.celestial?.sunSize ?? 0.06,
      moonSize: effectConfig.celestial?.moonSize ?? 0.05,
      sunGlowIntensity: effectConfig.celestial?.sunGlowIntensity ?? 1.0,
      sunGlowSize: effectConfig.celestial?.sunGlowSize ?? 0.3,
      sunRayCount: effectConfig.celestial?.sunRayCount ?? 12,
      sunRayLength: effectConfig.celestial?.sunRayLength ?? 0.5,
      sunRayIntensity: effectConfig.celestial?.sunRayIntensity ?? 0.4,
      moonGlowIntensity: effectConfig.celestial?.moonGlowIntensity ?? 1.0,
      moonGlowSize: effectConfig.celestial?.moonGlowSize ?? 0.2,
      skyBrightness: 1.0,
      skySaturation: 1.0,
      skyContrast: 1.0,
    },
    cloud: {
      cloudScale: 1.5,
      coverage: effectConfig.cloud?.coverage ?? 0.5,
      density: 0.7,
      softness: 0.3,
      windSpeed: effectConfig.cloud?.speed ?? 0.5,
      windAngle: 0,
      turbulence: effectConfig.cloud?.turbulence ?? 0.5,
      sunAzimuth: 0,
      lightIntensity: 1.0,
      ambientDarkness: effectConfig.cloud?.darkness ?? 0.3,
      backlightIntensity: 0.5,
      numLayers: 3,
      layerSpread: 0.3,
      starSize: 1.0,
      starTwinkleSpeed: 1.0,
      starTwinkleAmount: 0.5,
      horizonLine: 0.5,
    },
    rain: {
      glassIntensity: hasRain ? (effectConfig.rain?.intensity ?? 0.5) * 0.7 : 0,
      zoom: 1.0,
      fallingIntensity: hasRain ? effectConfig.rain?.intensity ?? 0.6 : 0,
      fallingSpeed: 1.0,
      fallingAngle: hasRain ? (effectConfig.rain?.angle ?? 5) * 0.02 : 0.1,
      fallingStreakLength: 0.8,
      fallingLayers: 3,
      fallingRefraction: 0.3,
      fallingWaviness: 0.15,
      fallingThicknessVar: 0.5,
    },
    lightning: {
      branchDensity: 0.6,
      displacement: 0.08,
      glowIntensity: 0.8,
      flashDuration: 0.15,
      sceneIllumination: 0.6,
      afterglowPersistence: 0.3,
      autoMode: hasLightning ? effectConfig.lightning?.autoTrigger ?? true : false,
      autoInterval: hasLightning ? (lightningIntervalMin + lightningIntervalMax) / 2 : 8,
    },
    snow: {
      intensity: hasSnow ? effectConfig.snow?.intensity ?? 0.7 : 0,
      layers: 4,
      fallSpeed: 0.5,
      windSpeed: hasSnow ? effectConfig.snow?.windDrift ?? 0.3 : 0.3,
      windAngle: 0,
      turbulence: 0.3,
      drift: hasSnow ? effectConfig.snow?.windDrift ?? 0.3 : 0.3,
      flutter: 0.5,
      windShear: 0.2,
      flakeSize: 1.0,
      sizeVariation: 0.5,
      opacity: 0.8,
      glowAmount: 0.3,
      sparkle: 0.2,
      visibility: 1.0,
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

function createEmptyCheckpointOverrides(): CheckpointOverrides {
  return {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {},
  };
}

function migrateV1ToV2(v1: CompositorStateV1): CompositorState {
  const checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>> = {};

  for (const [condition, override] of Object.entries(v1.overrides)) {
    if (override && Object.keys(override).length > 0) {
      checkpointOverrides[condition as WeatherCondition] = {
        dawn: structuredClone(override),
        noon: structuredClone(override),
        dusk: structuredClone(override),
        midnight: structuredClone(override),
      };
    }
  }

  return {
    version: 2,
    activeCondition: v1.activeCondition,
    globalSettings: v1.globalSettings,
    checkpointOverrides,
  };
}

function isV1State(state: unknown): state is CompositorStateV1 {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return s.version === undefined && "overrides" in s;
}

function isV2State(state: unknown): state is CompositorState {
  if (!state || typeof state !== "object") return false;
  const s = state as Record<string, unknown>;
  return s.version === 2 && "checkpointOverrides" in s;
}

export function loadFromStorage(): CompositorState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (isV2State(parsed)) {
      return parsed;
    }

    if (isV1State(parsed)) {
      const migrated = migrateV1ToV2(parsed);
      saveToStorage(migrated);
      return migrated;
    }

    return null;
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

export function getCheckpointOverridesForCondition(
  state: CompositorState,
  condition: WeatherCondition
): CheckpointOverrides {
  return state.checkpointOverrides[condition] ?? createEmptyCheckpointOverrides();
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
        const parsed = JSON.parse(e.target?.result as string);

        if (isV2State(parsed)) {
          resolve(parsed);
          return;
        }

        if (isV1State(parsed)) {
          resolve(migrateV1ToV2(parsed));
          return;
        }

        reject(new Error("Invalid file format"));
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
