"use client";

import { useControls, Leva } from "leva";
import { RainCanvas } from "./rain-canvas";

export default function RainEffectSandbox() {
  const fallingRain = useControls("Falling Rain", {
    fallingIntensity: { value: 0.6, min: 0, max: 1, step: 0.01, label: "Intensity" },
    fallingSpeed: { value: 1.0, min: 0.1, max: 5, step: 0.1, label: "Speed" },
    fallingAngle: { value: 0.1, min: -1, max: 1, step: 0.01, label: "Wind Angle" },
    fallingStreakLength: { value: 1.0, min: 0.1, max: 5, step: 0.1, label: "Streak Length" },
    fallingLayers: { value: 4, min: 1, max: 6, step: 1, label: "Depth Layers" },
  });

  const rainAppearance = useControls("Rain Appearance", {
    fallingRefraction: { value: 0.4, min: 0, max: 2, step: 0.05, label: "Refraction" },
    fallingWaviness: { value: 1.0, min: 0, max: 3, step: 0.1, label: "Waviness" },
    fallingThicknessVar: { value: 1.0, min: 0, max: 3, step: 0.1, label: "Thickness Var" },
  });

  const glassDrops = useControls("Glass Drops", {
    glassIntensity: { value: 0.5, min: 0, max: 1, step: 0.01, label: "Intensity" },
    zoom: { value: 1.0, min: 0.5, max: 3, step: 0.1, label: "Zoom" },
  });

  const debug = useControls("Debug", {
    showDebug: { value: false, label: "Show Debug" },
  });

  return (
    <div className="relative min-h-screen bg-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Rain Effect" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />
      <RainCanvas
        className="absolute inset-0"
        glassIntensity={glassDrops.glassIntensity}
        fallingIntensity={fallingRain.fallingIntensity}
        fallingSpeed={fallingRain.fallingSpeed}
        fallingAngle={fallingRain.fallingAngle}
        fallingStreakLength={fallingRain.fallingStreakLength}
        fallingLayers={fallingRain.fallingLayers}
        fallingRefraction={rainAppearance.fallingRefraction}
        fallingWaviness={rainAppearance.fallingWaviness}
        fallingThicknessVar={rainAppearance.fallingThicknessVar}
        zoom={glassDrops.zoom}
        debug={debug.showDebug}
      />
    </div>
  );
}
