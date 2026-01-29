import type { WeatherCondition } from "../schema";
import type { WeatherEffectsCheckpointOverrides } from "./tuning";

/**
 * Tuned effect overrides per condition + time checkpoint.
 *
 * This file is designed to be generated/copied from the tuning studio export.
 */
export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES: Partial<
  Record<WeatherCondition, WeatherEffectsCheckpointOverrides>
> = {
  clear: {
    dawn: {
      celestial: {
        celestialY: 0.74,
        sunGlowIntensity: 3.7,
        sunGlowSize: 0.36,
        moonGlowIntensity: 2.45,
        moonGlowSize: 0.96,
        skyBrightness: 1.04,
        skySaturation: 1.31,
        skyContrast: 0.61,
      },
    },
    noon: {
      celestial: {
        celestialY: 0.74,
        sunGlowIntensity: 2.68,
        sunGlowSize: 0.37,
        sunRayIntensity: 0.11,
        moonGlowIntensity: 2.45,
        moonGlowSize: 0.96,
        skyBrightness: 0.91,
        skySaturation: 1.53,
      },
    },
    dusk: {
      celestial: {
        celestialY: 0.74,
        sunGlowSize: 0.47,
        sunRayIntensity: 0.04,
        moonGlowIntensity: 2.45,
        moonGlowSize: 0.96,
        skyBrightness: 1.04,
        skySaturation: 1.31,
        skyContrast: 0.61,
      },
    },
    midnight: {
      celestial: {
        celestialY: 0.74,
        moonGlowIntensity: 2.45,
        moonGlowSize: 0.96,
        skyBrightness: 1.04,
        skySaturation: 1.31,
        skyContrast: 0.61,
      },
    },
  },
  "partly-cloudy": {
    dawn: {
      cloud: {
        coverage: 0.43,
        density: 0.32,
        softness: 0.34,
        lightIntensity: 1.2,
        backlightIntensity: 0.45,
      },
    },
    noon: {
      cloud: {
        coverage: 0.43,
        density: 0.32,
        softness: 0.34,
        lightIntensity: 1.2,
        backlightIntensity: 0.45,
      },
    },
    dusk: {
      cloud: {
        coverage: 0.43,
        density: 0.32,
        softness: 0.34,
        lightIntensity: 1.2,
        backlightIntensity: 0.45,
      },
    },
    midnight: {
      cloud: {
        coverage: 0.38,
        density: 1.36,
        softness: 0.34,
        lightIntensity: 0.47,
        backlightIntensity: 0.61,
      },
    },
  },
  cloudy: {
    dawn: {
      celestial: {
        skyBrightness: 0.91,
        skySaturation: 1.16,
      },
      cloud: {
        softness: 0.45,
        windSpeed: 0.09,
        lightIntensity: 0.81,
        backlightIntensity: 0.39,
      },
    },
    noon: {
      celestial: {
        skyBrightness: 0.91,
        skySaturation: 1.16,
      },
      cloud: {
        softness: 0.45,
        windSpeed: 0.09,
        lightIntensity: 0.81,
        backlightIntensity: 0.39,
      },
    },
    dusk: {
      celestial: {
        skyBrightness: 0.91,
        skySaturation: 1.16,
      },
      cloud: {
        coverage: 0.58,
        softness: 0.29,
        windSpeed: 0.09,
        lightIntensity: 1.26,
        backlightIntensity: 0.55,
      },
    },
    midnight: {
      cloud: {
        coverage: 0.76,
        density: 1.25,
        softness: 0.4,
        lightIntensity: 0.92,
        ambientDarkness: 1,
        backlightIntensity: 0.43,
        numLayers: 1,
      },
    },
  },
  overcast: {
    dawn: {
      celestial: {
        sunGlowIntensity: 2.08,
        sunGlowSize: 0.22,
        sunRayCount: 0,
        sunRayLength: 0,
        sunRayIntensity: 0,
        skyBrightness: 1.05,
      },
      cloud: {
        cloudScale: 0.98,
        coverage: 1,
        density: 0.87,
        softness: 1,
        windSpeed: 0.04,
        lightIntensity: 1.1,
        backlightIntensity: 0.53,
        numLayers: 1,
      },
    },
    noon: {
      celestial: {
        sunGlowIntensity: 1.73,
        sunGlowSize: 0.48,
        sunRayCount: 0,
        sunRayLength: 0,
        sunRayIntensity: 0,
        skyBrightness: 0.68,
        skySaturation: 0.84,
      },
      cloud: {
        cloudScale: 0.98,
        coverage: 1,
        density: 0.87,
        softness: 1,
        windSpeed: 0.04,
        lightIntensity: 1.1,
        backlightIntensity: 0,
        numLayers: 1,
      },
    },
    dusk: {
      celestial: {
        sunGlowIntensity: 1.73,
        sunGlowSize: 0.22,
        sunRayCount: 0,
        sunRayLength: 0,
        sunRayIntensity: 0,
        skyBrightness: 0.81,
        skySaturation: 0.79,
      },
      cloud: {
        cloudScale: 0.98,
        coverage: 1,
        density: 0.87,
        softness: 1,
        windSpeed: 0.04,
        lightIntensity: 1.1,
        backlightIntensity: 0,
        numLayers: 1,
      },
    },
    midnight: {
      celestial: {
        sunGlowIntensity: 1.73,
        sunGlowSize: 0.22,
        sunRayCount: 0,
        sunRayLength: 0,
        sunRayIntensity: 0,
        skyBrightness: 0.64,
        skySaturation: 1.46,
      },
      cloud: {
        cloudScale: 0.98,
        coverage: 1,
        density: 0.97,
        softness: 0.95,
        windSpeed: 0.04,
        lightIntensity: 1.1,
        backlightIntensity: 0.22,
        numLayers: 1,
      },
    },
  },
  fog: {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {
      celestial: {
        celestialY: 0.74,
      },
    },
  },
  rain: {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {
      cloud: {
        windSpeed: 0.19,
      },
    },
  },
  "heavy-rain": {
    dawn: {
      cloud: {
        coverage: 0.64,
        density: 1.2,
        windSpeed: 0.1,
        numLayers: 1,
      },
    },
    noon: {
      celestial: {
        sunGlowIntensity: 3.38,
        skyBrightness: 0.88,
        skySaturation: 0.97,
      },
      cloud: {
        coverage: 0.64,
        density: 1.27,
        windSpeed: 0.1,
        lightIntensity: 0.19,
        ambientDarkness: 1,
        backlightIntensity: 0.47,
        numLayers: 2,
      },
      rain: {
        glassIntensity: 0.88,
        glassZoom: 1.18,
        fallingSpeed: 3,
        fallingStreakLength: 2,
        fallingLayers: 6,
      },
    },
    dusk: {
      cloud: {
        coverage: 0.64,
        density: 1.2,
        windSpeed: 0.1,
        numLayers: 1,
      },
    },
    midnight: {
      cloud: {
        coverage: 0.64,
        density: 1.2,
        windSpeed: 0.1,
        numLayers: 1,
      },
    },
  },
  thunderstorm: {
    dawn: {
      lightning: {
        branchDensity: 0.83,
        flashIntensity: 0.85,
      },
      interactions: {
        lightningSceneIllumination: 0.77,
      },
    },
    noon: {
      lightning: {
        branchDensity: 0.83,
        flashIntensity: 0.85,
      },
      interactions: {
        lightningSceneIllumination: 0.77,
      },
    },
    dusk: {
      lightning: {
        branchDensity: 0.83,
        flashIntensity: 0.85,
      },
      interactions: {
        lightningSceneIllumination: 0.77,
      },
    },
    midnight: {
      cloud: {
        windSpeed: 0.12,
        turbulence: 0.63,
        lightIntensity: 0.73,
        ambientDarkness: 1,
        backlightIntensity: 0.62,
      },
      lightning: {
        branchDensity: 0.72,
        flashIntensity: 1.72,
        autoInterval: 7.5,
      },
      interactions: {
        lightningSceneIllumination: 0.19,
      },
    },
  },
  snow: {
    dawn: {
      cloud: {
        lightIntensity: 0.64,
      },
      snow: {
        intensity: 0.12,
      },
    },
    noon: {
      cloud: {
        lightIntensity: 0.64,
      },
      snow: {
        intensity: 0.23,
      },
    },
    dusk: {
      cloud: {
        lightIntensity: 0.64,
      },
      snow: {
        intensity: 0.15,
      },
    },
    midnight: {
      cloud: {
        lightIntensity: 0.64,
      },
    },
  },
  sleet: {
    dawn: {
      rain: {
        glassIntensity: 0.3,
        glassZoom: 0.83,
        fallingSpeed: 3,
        fallingStreakLength: 0.42,
      },
      snow: {
        intensity: 0.08,
        layers: 6,
        fallSpeed: 0.76,
        drift: 0.28,
        flakeSize: 1.87,
      },
    },
    noon: {
      rain: {
        glassIntensity: 0.3,
        glassZoom: 0.83,
        fallingSpeed: 3,
        fallingStreakLength: 0.42,
      },
      snow: {
        intensity: 0.08,
        layers: 6,
        fallSpeed: 0.76,
        drift: 0.28,
        flakeSize: 1.87,
      },
    },
    dusk: {
      rain: {
        glassIntensity: 0.3,
        glassZoom: 0.83,
        fallingSpeed: 3,
        fallingStreakLength: 0.42,
      },
      snow: {
        intensity: 0.08,
        layers: 6,
        fallSpeed: 0.76,
        drift: 0.28,
        flakeSize: 1.87,
      },
    },
    midnight: {
      celestial: {
        celestialY: 0.74,
      },
      rain: {
        glassIntensity: 0.3,
        glassZoom: 0.83,
        fallingSpeed: 3,
        fallingStreakLength: 0.42,
      },
      snow: {
        intensity: 0.08,
        layers: 6,
        fallSpeed: 0.76,
        drift: 0.28,
        flakeSize: 1.87,
      },
    },
  },
  hail: {
    dawn: {
      cloud: {
        windSpeed: 0.16,
      },
    },
    noon: {
      cloud: {
        windSpeed: 0.16,
      },
    },
    dusk: {
      cloud: {
        windSpeed: 0.16,
      },
    },
    midnight: {
      celestial: {
        celestialY: 0.74,
      },
      cloud: {
        windSpeed: 0.16,
      },
    },
  },
  windy: {
    dawn: {
      celestial: {
        celestialY: 0.74,
      },
      cloud: {
        cloudScale: 1.84,
        coverage: 0.49,
        density: 0.67,
        windSpeed: 0.26,
        turbulence: 0.77,
        lightIntensity: 0.63,
        ambientDarkness: 0.37,
        backlightIntensity: 0.39,
      },
    },
    noon: {
      celestial: {
        celestialY: 0.74,
      },
      cloud: {
        cloudScale: 1.84,
        coverage: 0.49,
        density: 0.67,
        windSpeed: 0.26,
        turbulence: 0.77,
        lightIntensity: 0.63,
        ambientDarkness: 0.37,
        backlightIntensity: 0.39,
      },
    },
    dusk: {
      celestial: {
        celestialY: 0.74,
      },
      cloud: {
        cloudScale: 1.84,
        coverage: 0.49,
        density: 0.67,
        windSpeed: 0.26,
        turbulence: 0.77,
        lightIntensity: 0.63,
        ambientDarkness: 0.37,
        backlightIntensity: 0.39,
      },
    },
    midnight: {
      celestial: {
        celestialY: 0.74,
      },
      cloud: {
        cloudScale: 1.84,
        coverage: 0.49,
        density: 0.67,
        windSpeed: 0.26,
        turbulence: 0.77,
        lightIntensity: 0.63,
        ambientDarkness: 0.37,
        backlightIntensity: 0.39,
      },
    },
  },
};
