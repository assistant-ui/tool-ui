"use client";

import { useControls, Leva } from "leva";
import { CloudCanvas } from "./cloud-canvas";

export default function CloudEffectSandbox() {
  const cloudShape = useControls("Cloud Shape", {
    cloudScale: { value: 1.0, min: 0.3, max: 3, step: 0.05, label: "Scale" },
    coverage: { value: 0.5, min: 0, max: 1, step: 0.01, label: "Coverage" },
    density: { value: 0.85, min: 0, max: 1, step: 0.01, label: "Density" },
    softness: { value: 0.3, min: 0, max: 1, step: 0.01, label: "Softness" },
  });

  const animation = useControls("Animation", {
    windSpeed: { value: 0.8, min: 0, max: 3, step: 0.05, label: "Wind Speed" },
    windAngle: { value: 0.1, min: -Math.PI, max: Math.PI, step: 0.05, label: "Wind Angle" },
    turbulence: { value: 0.5, min: 0, max: 2, step: 0.05, label: "Turbulence" },
    numLayers: { value: 3, min: 1, max: 10, step: 1, label: "Layers" },
    layerSpread: { value: 0.3, min: 0, max: 2, step: 0.05, label: "Layer Spread" },
  });

  const lighting = useControls("Lighting", {
    sunAltitude: { value: 0.1, min: -0.2, max: 1, step: 0.01, label: "Sun Position" },
    lightIntensity: { value: 1.0, min: 0, max: 2, step: 0.05, label: "Intensity" },
    ambientDarkness: { value: 0.3, min: 0, max: 1, step: 0.05, label: "Shadow Darkness" },
  });

  const stars = useControls("Stars", {
    starDensity: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Density" },
    starSize: { value: 1.5, min: 0.5, max: 4, step: 0.1, label: "Size" },
    starTwinkleSpeed: { value: 1.0, min: 0, max: 3, step: 0.1, label: "Twinkle Speed" },
    starTwinkleAmount: { value: 0.6, min: 0, max: 1, step: 0.05, label: "Twinkle Amount" },
  });

  const debug = useControls("Debug", {
    showDebug: { value: false, label: "Show Debug" },
  });

  return (
    <div className="relative min-h-screen bg-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Cloud Effect" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />
      <CloudCanvas
        className="absolute inset-0"
        cloudScale={cloudShape.cloudScale}
        coverage={cloudShape.coverage}
        density={cloudShape.density}
        softness={cloudShape.softness}
        windSpeed={animation.windSpeed}
        windAngle={animation.windAngle}
        turbulence={animation.turbulence}
        sunAltitude={lighting.sunAltitude}
        lightIntensity={lighting.lightIntensity}
        ambientDarkness={lighting.ambientDarkness}
        numLayers={animation.numLayers}
        layerSpread={animation.layerSpread}
        starDensity={stars.starDensity}
        starSize={stars.starSize}
        starTwinkleSpeed={stars.starTwinkleSpeed}
        starTwinkleAmount={stars.starTwinkleAmount}
        debug={debug.showDebug}
      />
    </div>
  );
}
