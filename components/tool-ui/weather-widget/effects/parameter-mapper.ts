import type { WeatherCondition } from "../schema";
import type {
  EffectLayerConfig,
  WeatherEffectParams,
  AtmosphereConfig,
} from "./types";

/**
 * Calculate time of day from timestamp (0-1 scale).
 * 0 = midnight, 0.25 = 6am, 0.5 = noon, 0.75 = 6pm
 */
export function getTimeOfDay(timestamp?: string): number {
  if (!timestamp) {
    return 0.5; // Default to noon
  }

  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return (hours + minutes / 60) / 24;
}

/**
 * Calculate approximate moon phase from date (0-1 scale).
 * 0 = new moon, 0.5 = full moon
 * Uses a simplified 29.5 day synodic month calculation.
 */
export function getMoonPhase(timestamp?: string): number {
  if (!timestamp) {
    return 0.5; // Default to full moon
  }

  const date = new Date(timestamp);
  // Known new moon reference: January 6, 2000
  const knownNewMoon = new Date("2000-01-06T00:00:00Z");
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const synodicMonth = 29.530588853;

  return (daysSinceNewMoon % synodicMonth) / synodicMonth;
}

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
 * Celestial position, size, and atmospheric effect presets per condition.
 * Based on Arnheim compositional principles and atmospheric optics:
 *
 * Position (x, y):
 * - Upper-right quadrant (0.6-0.75 x) balances left-heavy UI chrome
 * - Higher y = open sky feeling; lower y = oppressive/dramatic
 * - Thunderstorm sits lowest (0.50), clear/windy highest (0.76-0.78)
 *
 * Size:
 * - Atmospheric scattering makes sun LARGER in fog/haze (0.28 in fog)
 * - Clear/windy = crisp, tight sun (0.09-0.10)
 *
 * Rays:
 * - Only visible in clear conditions (clear, partly-cloudy, windy, snow)
 * - Ray count 0 = disabled for rain/overcast/thunderstorm
 * - Wind clears air = maximum ray intensity (0.7)
 *
 * Glow:
 * - Fog = maximum spread (0.7), ethereal effect
 * - Clear/windy = tight, focused (0.22-0.25)
 * - Rain washes out glow (0.25-0.35 intensity)
 */
interface CelestialPreset {
  x: number;
  y: number;
  sunSize: number;
  moonSize: number;
  starDensity: number;
  sunGlowIntensity: number;
  sunGlowSize: number;
  sunRayCount: number;
  sunRayLength: number;
  sunRayIntensity: number;
  moonGlowIntensity: number;
  moonGlowSize: number;
}

const CELESTIAL_PRESETS: Record<WeatherCondition, CelestialPreset> = {
  // Clear: Crisp sun, prominent rays, tight glow. High position for open sky feeling.
  clear: {
    x: 0.72, y: 0.78,
    sunSize: 0.10, moonSize: 0.08,
    starDensity: 0.9,
    sunGlowIntensity: 1.2, sunGlowSize: 0.25,
    sunRayCount: 16, sunRayLength: 0.6, sunRayIntensity: 0.6,
    moonGlowIntensity: 1.1, moonGlowSize: 0.18,
  },
  // Partly Cloudy: Soft rays peek through, slight atmospheric scatter.
  "partly-cloudy": {
    x: 0.68, y: 0.72,
    sunSize: 0.12, moonSize: 0.10,
    starDensity: 0.5,
    sunGlowIntensity: 0.9, sunGlowSize: 0.35,
    sunRayCount: 12, sunRayLength: 0.4, sunRayIntensity: 0.3,
    moonGlowIntensity: 0.8, moonGlowSize: 0.22,
  },
  // Cloudy: Diffuse light, subtle rays through thin spots.
  cloudy: {
    x: 0.62, y: 0.66,
    sunSize: 0.15, moonSize: 0.12,
    starDensity: 0.15,
    sunGlowIntensity: 0.6, sunGlowSize: 0.45,
    sunRayCount: 6, sunRayLength: 0.2, sunRayIntensity: 0.15,
    moonGlowIntensity: 0.5, moonGlowSize: 0.28,
  },
  // Overcast: Low, oppressive. Sun is diffuse blob, no rays.
  overcast: {
    x: 0.55, y: 0.60,
    sunSize: 0.18, moonSize: 0.14,
    starDensity: 0.0,
    sunGlowIntensity: 0.4, sunGlowSize: 0.55,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.35, moonGlowSize: 0.32,
  },
  // Fog: Maximum atmospheric diffusion. Huge ethereal halo, high position.
  fog: {
    x: 0.60, y: 0.82,
    sunSize: 0.28, moonSize: 0.22,
    starDensity: 0.0,
    sunGlowIntensity: 0.8, sunGlowSize: 0.7,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.7, moonGlowSize: 0.4,
  },
  // Drizzle: Light rain, dim sun, faint rays possible.
  drizzle: {
    x: 0.60, y: 0.68,
    sunSize: 0.14, moonSize: 0.11,
    starDensity: 0.08,
    sunGlowIntensity: 0.5, sunGlowSize: 0.4,
    sunRayCount: 4, sunRayLength: 0.15, sunRayIntensity: 0.1,
    moonGlowIntensity: 0.45, moonGlowSize: 0.24,
  },
  // Rain: Sun obscured, no rays, muted glow.
  rain: {
    x: 0.58, y: 0.62,
    sunSize: 0.13, moonSize: 0.10,
    starDensity: 0.0,
    sunGlowIntensity: 0.35, sunGlowSize: 0.35,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.35, moonGlowSize: 0.2,
  },
  // Heavy Rain: Very low, dramatic. Minimal celestial presence.
  "heavy-rain": {
    x: 0.52, y: 0.55,
    sunSize: 0.11, moonSize: 0.09,
    starDensity: 0.0,
    sunGlowIntensity: 0.25, sunGlowSize: 0.3,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.25, moonGlowSize: 0.16,
  },
  // Thunderstorm: Lowest, most ominous. Sun barely visible.
  thunderstorm: {
    x: 0.48, y: 0.50,
    sunSize: 0.10, moonSize: 0.08,
    starDensity: 0.0,
    sunGlowIntensity: 0.15, sunGlowSize: 0.25,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.15, moonGlowSize: 0.14,
  },
  // Snow: Crisp winter light, gentle rays, bright reflective glow.
  snow: {
    x: 0.70, y: 0.75,
    sunSize: 0.12, moonSize: 0.10,
    starDensity: 0.4,
    sunGlowIntensity: 0.9, sunGlowSize: 0.35,
    sunRayCount: 10, sunRayLength: 0.4, sunRayIntensity: 0.35,
    moonGlowIntensity: 0.85, moonGlowSize: 0.25,
  },
  // Sleet: Mixed precipitation, no rays, moderate glow.
  sleet: {
    x: 0.58, y: 0.62,
    sunSize: 0.13, moonSize: 0.10,
    starDensity: 0.0,
    sunGlowIntensity: 0.4, sunGlowSize: 0.38,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.38, moonGlowSize: 0.22,
  },
  // Hail: Similar to heavy rain. Severe, minimal sun.
  hail: {
    x: 0.52, y: 0.58,
    sunSize: 0.11, moonSize: 0.09,
    starDensity: 0.0,
    sunGlowIntensity: 0.3, sunGlowSize: 0.3,
    sunRayCount: 0, sunRayLength: 0, sunRayIntensity: 0,
    moonGlowIntensity: 0.3, moonGlowSize: 0.18,
  },
  // Windy: Crystal clear air, maximum visibility. Intense rays, tight crisp sun.
  windy: {
    x: 0.75, y: 0.76,
    sunSize: 0.09, moonSize: 0.075,
    starDensity: 0.55,
    sunGlowIntensity: 1.3, sunGlowSize: 0.22,
    sunRayCount: 16, sunRayLength: 0.65, sunRayIntensity: 0.7,
    moonGlowIntensity: 1.2, moonGlowSize: 0.16,
  },
};

/**
 * Base condition presets. These define the default effect configuration
 * for each weather condition before parameter modifiers are applied.
 */
const CONDITION_PRESETS: Record<WeatherCondition, Omit<EffectLayerConfig, "atmosphere" | "celestial">> = {
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

  // Celestial layer - always present, calculated from timestamp + condition presets
  const timeOfDay = getTimeOfDay(timestamp);
  const moonPhase = getMoonPhase(timestamp);
  const celestialPreset = CELESTIAL_PRESETS[condition];
  config.celestial = {
    timeOfDay,
    moonPhase,
    starDensity: isNight ? celestialPreset.starDensity : 0,
    celestialX: celestialPreset.x,
    celestialY: celestialPreset.y,
    sunSize: celestialPreset.sunSize,
    moonSize: celestialPreset.moonSize,
    sunGlowIntensity: celestialPreset.sunGlowIntensity,
    sunGlowSize: celestialPreset.sunGlowSize,
    sunRayCount: celestialPreset.sunRayCount,
    sunRayLength: celestialPreset.sunRayLength,
    sunRayIntensity: celestialPreset.sunRayIntensity,
    moonGlowIntensity: celestialPreset.moonGlowIntensity,
    moonGlowSize: celestialPreset.moonGlowSize,
  };

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

export function configToCelestialProps(config: EffectLayerConfig) {
  if (!config.celestial) return null;

  return {
    timeOfDay: config.celestial.timeOfDay,
    moonPhase: config.celestial.moonPhase,
    starDensity: config.celestial.starDensity,
    celestialX: config.celestial.celestialX,
    celestialY: config.celestial.celestialY,
    sunSize: config.celestial.sunSize,
    moonSize: config.celestial.moonSize,
    sunGlowIntensity: config.celestial.sunGlowIntensity,
    sunGlowSize: config.celestial.sunGlowSize,
    sunRayCount: config.celestial.sunRayCount,
    sunRayLength: config.celestial.sunRayLength,
    sunRayIntensity: config.celestial.sunRayIntensity,
    moonGlowIntensity: config.celestial.moonGlowIntensity,
    moonGlowSize: config.celestial.moonGlowSize,
  };
}
