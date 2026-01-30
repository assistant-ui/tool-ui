import type { WeatherEffectsCanvasProps } from "@/components/tool-ui/weather-widget/effects";
import type { FullCompositorParams } from "../../weather-compositor/presets";

/**
 * Convert tuning-studio compositor params (the superset used by the studio)
 * into the exact prop shape the shipping `WeatherEffectsCanvas` understands.
 *
 * Keeping this mapping centralized prevents "looks wrong / looks like bleed"
 * issues caused by inconsistent field names (e.g. `zoom` vs `glassZoom`) or
 * missing enable flags (e.g. lightning `enabled`).
 */
export function mapCompositorParamsToCanvasProps(
  params: FullCompositorParams,
): WeatherEffectsCanvasProps {
  return {
    layers: params.layers,
    celestial: {
      timeOfDay: params.celestial.timeOfDay,
      moonPhase: params.celestial.moonPhase,
      starDensity: params.celestial.starDensity,
      celestialX: params.celestial.celestialX,
      celestialY: params.celestial.celestialY,
      sunSize: params.celestial.sunSize,
      moonSize: params.celestial.moonSize,
      sunGlowIntensity: params.celestial.sunGlowIntensity,
      sunGlowSize: params.celestial.sunGlowSize,
      sunRayCount: params.celestial.sunRayCount,
      sunRayLength: params.celestial.sunRayLength,
      sunRayIntensity: params.celestial.sunRayIntensity,
      moonGlowIntensity: params.celestial.moonGlowIntensity,
      moonGlowSize: params.celestial.moonGlowSize,
      skyBrightness: params.celestial.skyBrightness,
      skySaturation: params.celestial.skySaturation,
      skyContrast: params.celestial.skyContrast,
    },
    cloud: {
      coverage: params.cloud.coverage,
      density: params.cloud.density,
      softness: params.cloud.softness,
      cloudScale: params.cloud.cloudScale,
      windSpeed: params.cloud.windSpeed,
      windAngle: params.cloud.windAngle,
      turbulence: params.cloud.turbulence,
      lightIntensity: params.cloud.lightIntensity,
      ambientDarkness: params.cloud.ambientDarkness,
      backlightIntensity: params.cloud.backlightIntensity,
      numLayers: params.cloud.numLayers,
    },
    rain: {
      glassIntensity: params.rain.glassIntensity,
      glassZoom: params.rain.zoom,
      fallingIntensity: params.rain.fallingIntensity,
      fallingSpeed: params.rain.fallingSpeed,
      fallingAngle: params.rain.fallingAngle,
      fallingStreakLength: params.rain.fallingStreakLength,
      fallingLayers: params.rain.fallingLayers,
    },
    lightning: {
      enabled: params.layers.lightning,
      autoMode: params.lightning.autoMode,
      autoInterval: params.lightning.autoInterval,
      flashIntensity: params.lightning.glowIntensity,
      branchDensity: params.lightning.branchDensity,
    },
    snow: {
      intensity: params.snow.intensity,
      layers: params.snow.layers,
      fallSpeed: params.snow.fallSpeed,
      windSpeed: params.snow.windSpeed,
      windAngle: params.snow.windAngle,
      turbulence: params.snow.turbulence,
      drift: params.snow.drift,
      flutter: params.snow.flutter,
      windShear: params.snow.windShear,
      flakeSize: params.snow.flakeSize,
      sizeVariation: params.snow.sizeVariation,
      opacity: params.snow.opacity,
      glowAmount: params.snow.glowAmount,
      sparkle: params.snow.sparkle,
    },
    interactions: {
      // The tuning studio stores these on the legacy layer configs, but the
      // unified shader reads them as cross-cutting interaction uniforms.
      rainRefractionStrength: params.rain.fallingRefraction,
      lightningSceneIllumination: params.lightning.sceneIllumination,
    },
  };
}
