"use client";

import { useControls, button } from "leva";
import {
  WeatherEffectsCanvas,
  type CelestialParams,
  type CloudParams,
  type RainParams,
  type LightningParams,
  type SnowParams,
  type InteractionParams,
  type LayerToggles,
} from "@/components/tool-ui/weather-widget/effects/weather-effects-canvas";

export default function WeatherEffectsSandbox() {
  const layers = useControls("Layers", {
    celestial: true,
    clouds: true,
    rain: false,
    lightning: false,
    snow: false,
  }) as LayerToggles;

  const celestial = useControls("Celestial", {
    timeOfDay: { value: 0.5, min: 0, max: 1, step: 0.01 },
    moonPhase: { value: 0.54, min: 0, max: 1, step: 0.01 },
    starDensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
    celestialX: { value: 0.74, min: 0, max: 1, step: 0.01 },
    celestialY: { value: 0.78, min: 0, max: 1, step: 0.01 },
    sunSize: { value: 0.14, min: 0.01, max: 0.5, step: 0.01 },
    moonSize: { value: 0.17, min: 0.01, max: 0.5, step: 0.01 },
    sunGlowIntensity: { value: 3.05, min: 0, max: 10, step: 0.05 },
    sunGlowSize: { value: 0.3, min: 0, max: 2, step: 0.01 },
    sunRayCount: { value: 6, min: 0, max: 24, step: 1 },
    sunRayLength: { value: 3.0, min: 0, max: 10, step: 0.1 },
    sunRayIntensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
    sunRayShimmer: {
      value: 1.0,
      min: 0,
      max: 5,
      step: 0.05,
      label: "Ray Shimmer",
    },
    sunRayShimmerSpeed: {
      value: 1.0,
      min: 0,
      max: 5,
      step: 0.05,
      label: "Ray Shimmer Speed",
    },
    moonGlowIntensity: { value: 3.45, min: 0, max: 10, step: 0.05 },
    moonGlowSize: { value: 0.94, min: 0, max: 2, step: 0.01 },
  }) as CelestialParams;

  const cloud = useControls("Clouds", {
    coverage: { value: 0.5, min: 0, max: 1, step: 0.01 },
    density: { value: 0.7, min: 0, max: 1, step: 0.01 },
    softness: { value: 0.5, min: 0, max: 1, step: 0.01 },
    cloudScale: { value: 1.0, min: 0.1, max: 5, step: 0.1 },
    windSpeed: { value: 0.3, min: 0, max: 2, step: 0.01 },
    windAngle: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    turbulence: { value: 0.3, min: 0, max: 1, step: 0.01 },
    lightIntensity: { value: 1.0, min: 0, max: 2, step: 0.01 },
    ambientDarkness: { value: 0.2, min: 0, max: 1, step: 0.01 },
    backlightIntensity: { value: 0.5, min: 0, max: 2, step: 0.01 },
    numLayers: { value: 3, min: 1, max: 5, step: 1 },
  }) as CloudParams;

  const rain = useControls("Rain", {
    glassIntensity: { value: 0.5, min: 0, max: 1, step: 0.01 },
    glassZoom: { value: 1.0, min: 0.5, max: 3, step: 0.01 },
    fallingIntensity: { value: 0.6, min: 0, max: 1, step: 0.01 },
    fallingSpeed: { value: 1.0, min: 0.1, max: 3, step: 0.01 },
    fallingAngle: { value: 0.1, min: -0.5, max: 0.5, step: 0.01 },
    fallingStreakLength: { value: 1.0, min: 0.1, max: 3, step: 0.01 },
    fallingLayers: { value: 4, min: 1, max: 6, step: 1 },
  }) as RainParams;

  const lightning = useControls("Lightning", {
    enabled: true,
    autoMode: true,
    autoInterval: { value: 8, min: 2, max: 20, step: 0.5 },
    flashIntensity: { value: 1.0, min: 0, max: 2, step: 0.01 },
    branchDensity: { value: 0.5, min: 0, max: 1, step: 0.01 },
  }) as LightningParams;

  const snow = useControls("Snow", {
    intensity: { value: 0.5, min: 0, max: 1, step: 0.01 },
    layers: { value: 4, min: 1, max: 8, step: 1 },
    fallSpeed: { value: 1.0, min: 0.1, max: 3, step: 0.01 },
    windSpeed: { value: 0.3, min: 0, max: 1, step: 0.01 },
    drift: { value: 0.3, min: 0, max: 1, step: 0.01 },
    flakeSize: { value: 1.0, min: 0.1, max: 3, step: 0.01 },
  }) as SnowParams;

  const interactions = useControls("Interactions", {
    rainRefractionStrength: { value: 1.0, min: 0, max: 3, step: 0.01 },
    lightningSceneIllumination: { value: 0.6, min: 0, max: 2, step: 0.01 },
  }) as InteractionParams;

  useControls("Presets", {
    "Clear Day": button(() => {
      // Would need setters for this - just a placeholder
      console.log("Preset: Clear Day");
    }),
    "Rainy Night": button(() => {
      console.log("Preset: Rainy Night");
    }),
    Thunderstorm: button(() => {
      console.log("Preset: Thunderstorm");
    }),
    Snowy: button(() => {
      console.log("Preset: Snowy");
    }),
  });

  return (
    <div className="h-screen w-screen bg-black">
      <WeatherEffectsCanvas
        className="h-full w-full"
        layers={layers}
        celestial={celestial}
        cloud={cloud}
        rain={rain}
        lightning={lightning}
        snow={snow}
        interactions={interactions}
      />
    </div>
  );
}
