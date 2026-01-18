import type { WeatherCondition } from "../schema";
import type {
  EffectLayerConfig,
  WeatherEffectParams,
  AtmosphereConfig,
} from "./types";

/**
 * Calculate sun altitude from timestamp using a generic day cycle.
 * Returns -1 (midnight) to 1 (noon).
 */
export function getSunAltitude(timestamp?: string): number {
  if (!timestamp) {
    return 0.5; // Default to mid-morning
  }

  const date = new Date(timestamp);
  const hours = date.getHours() + date.getMinutes() / 60;

  // Generic sun cycle: rises at 6am, peaks at noon, sets at 6pm
  if (hours < 6) {
    // Before 6am: deep night to dawn (-1 to 0)
    return -1 + hours / 6;
  } else if (hours < 12) {
    // 6am to noon: rising (0 to 1)
    return (hours - 6) / 6;
  } else if (hours < 18) {
    // Noon to 6pm: falling (1 to 0)
    return 1 - (hours - 12) / 6;
  } else {
    // After 6pm: dusk to night (0 to -1)
    return -(hours - 18) / 6;
  }
}

/**
 * Determine if it's night based on sun altitude.
 */
export function isNightTime(sunAltitude: number): boolean {
  return sunAltitude < 0;
}

/**
 * Map wind speed (mph) to effect intensity.
 * 0-10 mph: subtle, 10-25 mph: moderate, 25+ mph: dramatic
 */
function mapWindSpeed(mph: number = 0): number {
  if (mph <= 10) return mph / 10 * 0.3;
  if (mph <= 25) return 0.3 + ((mph - 10) / 15) * 0.4;
  return 0.7 + Math.min((mph - 25) / 25, 0.3);
}

/**
 * Map precipitation level to intensity (0-1).
 */
function mapPrecipitation(level?: "none" | "light" | "moderate" | "heavy"): number {
  switch (level) {
    case "light": return 0.3;
    case "moderate": return 0.6;
    case "heavy": return 1.0;
    default: return 0;
  }
}

/**
 * Map visibility (miles) to haze amount (0-1).
 * 10+ miles: clear (0), 5-10: light haze, <5: heavy haze
 */
function mapVisibility(miles: number = 10): number {
  if (miles >= 10) return 0;
  if (miles >= 5) return (10 - miles) / 5 * 0.3;
  return 0.3 + (5 - miles) / 5 * 0.7;
}

/**
 * Base condition presets. These define the default effect configuration
 * for each weather condition before parameter modifiers are applied.
 */
const CONDITION_PRESETS: Record<WeatherCondition, Omit<EffectLayerConfig, "atmosphere">> = {
  clear: {
    cloud: { coverage: 0.1, speed: 0.3, darkness: 0, turbulence: 0.2 },
  },

  "partly-cloudy": {
    cloud: { coverage: 0.4, speed: 0.4, darkness: 0.1, turbulence: 0.3 },
  },

  cloudy: {
    cloud: { coverage: 0.7, speed: 0.4, darkness: 0.2, turbulence: 0.3 },
  },

  overcast: {
    cloud: { coverage: 0.95, speed: 0.3, darkness: 0.35, turbulence: 0.25 },
  },

  fog: {
    cloud: { coverage: 0.6, speed: 0.15, darkness: 0.15, turbulence: 0.1 },
  },

  drizzle: {
    cloud: { coverage: 0.75, speed: 0.35, darkness: 0.3, turbulence: 0.3 },
    rain: { intensity: 0.25, glassDrops: true, fallingRain: true, angle: 3 },
  },

  rain: {
    cloud: { coverage: 0.85, speed: 0.5, darkness: 0.4, turbulence: 0.4 },
    rain: { intensity: 0.6, glassDrops: true, fallingRain: true, angle: 5 },
  },

  "heavy-rain": {
    cloud: { coverage: 0.95, speed: 0.6, darkness: 0.55, turbulence: 0.5 },
    rain: { intensity: 1.0, glassDrops: true, fallingRain: true, angle: 8 },
  },

  thunderstorm: {
    cloud: { coverage: 1.0, speed: 0.7, darkness: 0.7, turbulence: 0.6 },
    rain: { intensity: 1.0, glassDrops: true, fallingRain: true, angle: 15 },
    lightning: { enabled: true, autoTrigger: true, intervalMin: 4, intervalMax: 12 },
  },

  snow: {
    cloud: { coverage: 0.7, speed: 0.25, darkness: 0.2, turbulence: 0.2 },
    snow: { intensity: 0.7, windDrift: 0.3 },
  },

  sleet: {
    cloud: { coverage: 0.8, speed: 0.4, darkness: 0.35, turbulence: 0.35 },
    rain: { intensity: 0.5, glassDrops: true, fallingRain: true, angle: 10 },
    snow: { intensity: 0.3, windDrift: 0.4 },
  },

  hail: {
    cloud: { coverage: 0.9, speed: 0.6, darkness: 0.5, turbulence: 0.5 },
    rain: { intensity: 0.7, glassDrops: true, fallingRain: true, angle: 5 },
  },

  windy: {
    cloud: { coverage: 0.5, speed: 1.0, darkness: 0.1, turbulence: 0.6 },
  },
};

/**
 * Maps weather parameters to effect layer configuration.
 * This is the core translation layer between schema and shaders.
 */
export function mapWeatherToEffects(params: WeatherEffectParams): EffectLayerConfig {
  const { condition, windSpeed, precipitation, visibility, timestamp } = params;

  // Get base preset for this condition
  const preset = CONDITION_PRESETS[condition];

  // Calculate derived values
  const sunAltitude = getSunAltitude(timestamp);
  const windIntensity = mapWindSpeed(windSpeed);
  const precipIntensity = mapPrecipitation(precipitation);
  const hazeAmount = mapVisibility(visibility);
  const isNight = isNightTime(sunAltitude);

  // Build atmosphere config
  const atmosphere: AtmosphereConfig = {
    sunAltitude,
    haze: Math.max(hazeAmount, preset.cloud?.darkness ?? 0 * 0.3),
    starVisibility: isNight && !preset.cloud ? 1.0 : isNight ? 1.0 - (preset.cloud?.coverage ?? 0) : 0,
  };

  // Build effect config, applying modifiers to preset values
  const config: EffectLayerConfig = { atmosphere };

  // Cloud layer with wind modifiers
  if (preset.cloud) {
    config.cloud = {
      ...preset.cloud,
      speed: preset.cloud.speed * (1 + windIntensity * 0.5),
      turbulence: preset.cloud.turbulence * (1 + windIntensity * 0.3),
    };
  }

  // Rain layer with precipitation and wind modifiers
  if (preset.rain) {
    const rainIntensity = precipIntensity > 0 ? precipIntensity : preset.rain.intensity;
    config.rain = {
      ...preset.rain,
      intensity: rainIntensity,
      angle: preset.rain.angle + windIntensity * 10,
    };
  }

  // Lightning layer (no modifiers, uses preset directly)
  if (preset.lightning) {
    config.lightning = { ...preset.lightning };
  }

  // Snow layer with wind modifiers
  if (preset.snow) {
    config.snow = {
      ...preset.snow,
      windDrift: preset.snow.windDrift + windIntensity * 0.3,
    };
  }

  return config;
}

/**
 * Convert EffectLayerConfig to individual canvas prop objects.
 * This provides the final uniform values for each effect shader.
 */
export function configToCloudProps(config: EffectLayerConfig) {
  if (!config.cloud) return null;

  return {
    coverage: config.cloud.coverage,
    windSpeed: config.cloud.speed,
    turbulence: config.cloud.turbulence,
    sunAltitude: config.atmosphere.sunAltitude,
    ambientDarkness: config.cloud.darkness,
    starDensity: config.atmosphere.starVisibility * 0.5,
  };
}

export function configToRainProps(config: EffectLayerConfig) {
  if (!config.rain) return null;

  return {
    glassIntensity: config.rain.glassDrops ? config.rain.intensity * 0.7 : 0,
    fallingIntensity: config.rain.fallingRain ? config.rain.intensity : 0,
    fallingAngle: config.rain.angle * 0.02, // Convert degrees to radians-ish
  };
}

export function configToLightningProps(config: EffectLayerConfig) {
  if (!config.lightning) return null;

  return {
    autoMode: config.lightning.autoTrigger,
    autoInterval: (config.lightning.intervalMin + config.lightning.intervalMax) / 2,
  };
}

export function configToSnowProps(config: EffectLayerConfig) {
  if (!config.snow) return null;

  return {
    intensity: config.snow.intensity,
    windSpeed: config.snow.windDrift,
    drift: config.snow.windDrift,
  };
}
