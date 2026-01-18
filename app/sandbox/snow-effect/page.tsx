"use client";

import { useControls, Leva } from "leva";
import { SnowCanvas } from "./snow-canvas";

export default function SnowEffectSandbox() {
  const density = useControls("Density", {
    intensity: { value: 0.5, min: 0.1, max: 1, step: 0.01, label: "Intensity" },
    layers: { value: 4, min: 1, max: 6, step: 1, label: "Depth Layers" },
  });

  const motion = useControls("Motion", {
    fallSpeed: { value: 0.6, min: 0.2, max: 2, step: 0.05, label: "Fall Speed" },
    windSpeed: { value: 0.3, min: 0, max: 3, step: 0.05, label: "Wind Speed" },
    windAngle: { value: 0.2, min: -1, max: 1, step: 0.05, label: "Wind Angle" },
    windShear: { value: 0.5, min: 0, max: 2, step: 0.05, label: "Wind Shear" },
    turbulence: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Turbulence" },
    drift: { value: 0.5, min: 0, max: 2, step: 0.05, label: "Drift" },
    flutter: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Flutter" },
  });

  const appearance = useControls("Appearance", {
    flakeSize: { value: 1.0, min: 0.3, max: 3, step: 0.1, label: "Flake Size" },
    sizeVariation: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Size Variation" },
    opacity: { value: 0.8, min: 0.2, max: 1, step: 0.05, label: "Opacity" },
    glowAmount: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Glow" },
    sparkle: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Sparkle" },
  });

  const blizzard = useControls("Blizzard", {
    visibility: { value: 1.0, min: 0.2, max: 1, step: 0.05, label: "Visibility" },
  });

  const debug = useControls("Debug", {
    showDebug: { value: false, label: "Show Debug" },
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Snow Effect" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />
      <SnowCanvas
        className="absolute inset-0"
        intensity={density.intensity}
        layers={density.layers}
        fallSpeed={motion.fallSpeed}
        windSpeed={motion.windSpeed}
        windAngle={motion.windAngle}
        windShear={motion.windShear}
        turbulence={motion.turbulence}
        drift={motion.drift}
        flutter={motion.flutter}
        flakeSize={appearance.flakeSize}
        sizeVariation={appearance.sizeVariation}
        opacity={appearance.opacity}
        glowAmount={appearance.glowAmount}
        sparkle={appearance.sparkle}
        visibility={blizzard.visibility}
        debug={debug.showDebug}
      />
    </div>
  );
}
