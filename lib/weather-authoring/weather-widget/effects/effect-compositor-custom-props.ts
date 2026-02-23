import type {
  LayerToggles,
  WeatherEffectsCanvasProps,
} from "./weather-effects-types";
import type {
  CustomEffectProps,
  WeatherEffectLayer,
} from "./custom-effect-props";

function sunAltitudeToLightIntensity(sunAltitude: number): number {
  const light =
    sunAltitude < 0
      ? 0.05 + (1 + sunAltitude) * 0.1
      : 0.15 + sunAltitude * 0.85;
  return Math.max(0, Math.min(1, light));
}

function isLayerEnabled(
  enabledLayers: CustomEffectProps["enabledLayers"],
  layer: WeatherEffectLayer,
  hasConfig: boolean,
): boolean {
  if (!hasConfig) return false;
  if (!enabledLayers) return true;
  return enabledLayers.includes(layer);
}

export function mapCustomEffectPropsToCanvasProps(
  custom: CustomEffectProps,
): WeatherEffectsCanvasProps | null {
  const hasCelestial = isLayerEnabled(
    custom.enabledLayers,
    "celestial",
    custom.celestial !== undefined,
  );
  const hasCloud = isLayerEnabled(
    custom.enabledLayers,
    "clouds",
    custom.cloud !== undefined,
  );
  const hasRain = isLayerEnabled(
    custom.enabledLayers,
    "rain",
    custom.rain !== undefined,
  );
  const hasLightning = isLayerEnabled(
    custom.enabledLayers,
    "lightning",
    custom.lightning !== undefined,
  );
  const hasSnow = isLayerEnabled(
    custom.enabledLayers,
    "snow",
    custom.snow !== undefined,
  );
  const hasPost = custom.post !== undefined;

  if (
    !hasCelestial &&
    !hasCloud &&
    !hasRain &&
    !hasLightning &&
    !hasSnow &&
    !hasPost
  ) {
    return null;
  }

  const layers: Partial<LayerToggles> = {
    celestial: hasCelestial,
    clouds: hasCloud,
    rain: hasRain,
    lightning: hasLightning,
    snow: hasSnow,
  };

  const interactions: Partial<
    NonNullable<WeatherEffectsCanvasProps["interactions"]>
  > = {};
  if (custom.rain?.fallingRefraction !== undefined) {
    interactions.rainRefractionStrength = custom.rain.fallingRefraction;
  }
  if (custom.lightning?.sceneIllumination !== undefined) {
    interactions.lightningSceneIllumination =
      custom.lightning.sceneIllumination;
  }

  return {
    layers,
    celestial: hasCelestial ? custom.celestial : undefined,
    cloud:
      hasCloud && custom.cloud
        ? {
            coverage: custom.cloud.coverage,
            density: custom.cloud.density,
            softness: custom.cloud.softness,
            cloudScale: custom.cloud.cloudScale,
            windSpeed: custom.cloud.windSpeed,
            windAngle: custom.cloud.windAngle,
            turbulence: custom.cloud.turbulence,
            lightIntensity:
              custom.cloud.lightIntensity ??
              sunAltitudeToLightIntensity(custom.cloud.sunAltitude),
            ambientDarkness: custom.cloud.ambientDarkness,
            numLayers: custom.cloud.numLayers,
          }
        : undefined,
    rain:
      hasRain && custom.rain
        ? {
            glassIntensity: custom.rain.glassIntensity,
            glassZoom: custom.rain.zoom,
            fallingIntensity: custom.rain.fallingIntensity,
            fallingSpeed: custom.rain.fallingSpeed,
            fallingAngle: custom.rain.fallingAngle,
            fallingStreakLength: custom.rain.fallingStreakLength,
            fallingLayers: custom.rain.fallingLayers,
          }
        : undefined,
    lightning:
      hasLightning && custom.lightning
        ? {
            enabled: true,
            autoMode: custom.lightning.autoMode,
            autoInterval: custom.lightning.autoInterval,
            flashIntensity: custom.lightning.glowIntensity,
            branchDensity: custom.lightning.branchDensity,
          }
        : undefined,
    snow:
      hasSnow && custom.snow
        ? {
            intensity: custom.snow.intensity,
            layers: custom.snow.layers,
            fallSpeed: custom.snow.fallSpeed,
            windSpeed: custom.snow.windSpeed,
            drift: custom.snow.drift,
            flakeSize: custom.snow.flakeSize,
          }
        : undefined,
    interactions:
      Object.keys(interactions).length > 0 ? interactions : undefined,
    post: custom.post,
  };
}
