"use client";

import { useState } from "react";
import { useControls, Leva, button } from "leva";
import { LightningCanvas } from "./lightning-canvas";

export default function LightningEffectSandbox() {
  const [triggerCount, setTriggerCount] = useState(0);

  const boltShape = useControls("Bolt Shape", {
    branchDensity: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Branch Density" },
    displacement: { value: 0.15, min: 0.01, max: 0.4, step: 0.01, label: "Displacement" },
    glowIntensity: { value: 1.0, min: 0.1, max: 3, step: 0.1, label: "Glow Intensity" },
  });

  const timing = useControls("Timing", {
    flashDuration: { value: 150, min: 50, max: 500, step: 10, label: "Flash Duration (ms)" },
    afterglowPersistence: { value: 4.0, min: 1, max: 20, step: 0.5, label: "Afterglow" },
    sceneIllumination: { value: 0.8, min: 0, max: 1, step: 0.05, label: "Scene Illumination" },
  });

  const auto = useControls("Auto Mode", {
    autoMode: { value: true, label: "Enabled" },
    autoInterval: { value: 8, min: 2, max: 20, step: 1, label: "Interval (s)" },
  });

  useControls("Actions", {
    "Trigger Lightning": button(() => setTriggerCount((c) => c + 1)),
  });

  const debug = useControls("Debug", {
    showDebug: { value: false, label: "Show Debug" },
  });

  return (
    <div className="relative min-h-screen bg-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Lightning Effect" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />
      <LightningCanvas
        className="absolute inset-0"
        branchDensity={boltShape.branchDensity}
        displacement={boltShape.displacement}
        glowIntensity={boltShape.glowIntensity}
        flashDuration={timing.flashDuration}
        sceneIllumination={timing.sceneIllumination}
        afterglowPersistence={timing.afterglowPersistence}
        triggerCount={triggerCount}
        autoMode={auto.autoMode}
        autoInterval={auto.autoInterval}
        debug={debug.showDebug}
      />
    </div>
  );
}
