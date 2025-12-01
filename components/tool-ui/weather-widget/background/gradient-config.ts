import type { TimeOfDay, WeatherCondition } from "../schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GradientStop {
  color: string;
  position: number;
}

export interface SkyGradientConfig {
  horizon: string;
  mid: string;
  zenith: string;
  midPosition: number;
}

// ---------------------------------------------------------------------------
// Base Time-of-Day Gradients
// ---------------------------------------------------------------------------

export const TIME_OF_DAY_GRADIENTS: Record<TimeOfDay, SkyGradientConfig> = {
  dawn: {
    horizon: "hsl(35, 90%, 65%)",
    mid: "hsl(340, 70%, 65%)",
    zenith: "hsl(220, 60%, 55%)",
    midPosition: 35,
  },
  day: {
    horizon: "hsl(200, 75%, 82%)",
    mid: "hsl(210, 85%, 68%)",
    zenith: "hsl(220, 80%, 52%)",
    midPosition: 45,
  },
  dusk: {
    horizon: "hsl(25, 95%, 58%)",
    mid: "hsl(320, 65%, 45%)",
    zenith: "hsl(255, 50%, 28%)",
    midPosition: 30,
  },
  night: {
    horizon: "hsl(230, 45%, 18%)",
    mid: "hsl(240, 50%, 12%)",
    zenith: "hsl(250, 55%, 8%)",
    midPosition: 50,
  },
};

// ---------------------------------------------------------------------------
// Weather Condition Modifiers
// ---------------------------------------------------------------------------

type GradientModifier = (config: SkyGradientConfig) => SkyGradientConfig;

/**
 * Adjusts HSL lightness component
 */
function adjustLightness(hsl: string, amount: number): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  const [, h, s, l] = match;
  const newL = Math.max(0, Math.min(100, parseInt(l, 10) + amount));
  return `hsl(${h}, ${s}%, ${newL}%)`;
}

/**
 * Adjusts HSL saturation component
 */
function adjustSaturation(hsl: string, amount: number): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;
  const [, h, s, l] = match;
  const newS = Math.max(0, Math.min(100, parseInt(s, 10) + amount));
  return `hsl(${h}, ${newS}%, ${l}%)`;
}

/**
 * Applies both saturation and lightness adjustments
 */
function adjustColor(hsl: string, satDelta: number, lightDelta: number): string {
  return adjustLightness(adjustSaturation(hsl, satDelta), lightDelta);
}

const WEATHER_MODIFIERS: Partial<Record<WeatherCondition, GradientModifier>> = {
  // Cloudy conditions: desaturate and slightly darken
  cloudy: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -25, -8),
    mid: adjustColor(config.mid, -25, -8),
    zenith: adjustColor(config.zenith, -20, -5),
  }),

  overcast: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -35, -12),
    mid: adjustColor(config.mid, -35, -12),
    zenith: adjustColor(config.zenith, -30, -8),
  }),

  fog: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -40, 10),
    mid: adjustColor(config.mid, -40, 5),
    zenith: adjustColor(config.zenith, -35, 0),
  }),

  // Rain conditions: desaturate more, darken more
  drizzle: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -30, -10),
    mid: adjustColor(config.mid, -35, -12),
    zenith: adjustColor(config.zenith, -25, -8),
  }),

  rain: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -40, -15),
    mid: adjustColor(config.mid, -45, -18),
    zenith: adjustColor(config.zenith, -35, -12),
  }),

  heavy_rain: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -50, -20),
    mid: adjustColor(config.mid, -55, -25),
    zenith: adjustColor(config.zenith, -45, -18),
  }),

  thunderstorm: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -55, -25),
    mid: adjustColor(config.mid, -60, -30),
    zenith: adjustColor(config.zenith, -50, -22),
  }),

  // Snow conditions: desaturate but brighten slightly
  snow: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -20, 8),
    mid: adjustColor(config.mid, -25, 5),
    zenith: adjustColor(config.zenith, -20, 3),
  }),

  heavy_snow: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -30, 12),
    mid: adjustColor(config.mid, -35, 8),
    zenith: adjustColor(config.zenith, -30, 5),
  }),

  sleet: (config) => ({
    ...config,
    horizon: adjustColor(config.horizon, -35, -5),
    mid: adjustColor(config.mid, -40, -8),
    zenith: adjustColor(config.zenith, -35, -5),
  }),
};

// ---------------------------------------------------------------------------
// Main Function
// ---------------------------------------------------------------------------

/**
 * Computes the sky gradient configuration for a given time and weather.
 */
export function getSkyGradient(
  timeOfDay: TimeOfDay,
  condition: WeatherCondition,
): SkyGradientConfig {
  const baseConfig = TIME_OF_DAY_GRADIENTS[timeOfDay];
  const modifier = WEATHER_MODIFIERS[condition];

  if (modifier) {
    return modifier(baseConfig);
  }

  return baseConfig;
}

/**
 * Converts a gradient config to CSS custom properties
 */
export function gradientToCSS(config: SkyGradientConfig): Record<string, string> {
  return {
    "--sky-horizon": config.horizon,
    "--sky-mid": config.mid,
    "--sky-zenith": config.zenith,
    "--sky-mid-position": `${config.midPosition}%`,
  };
}
