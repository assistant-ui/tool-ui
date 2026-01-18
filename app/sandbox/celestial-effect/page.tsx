"use client";

import { useControls, Leva } from "leva";
import { CelestialCanvas } from "./celestial-canvas";

export default function CelestialEffectSandbox() {
  const time = useControls("Time of Day", {
    timeOfDay: { value: 0.5, min: 0, max: 1, step: 0.01, label: "Time (0=midnight, 0.5=noon)" },
    animateTime: { value: false, label: "Animate Time" },
    dayDuration: { value: 60, min: 10, max: 300, step: 10, label: "Day Duration (s)" },
  });

  const sun = useControls("Sun", {
    sunSize: { value: 0.08, min: 0.02, max: 0.2, step: 0.005, label: "Size" },
    sunGlowIntensity: { value: 1.0, min: 0, max: 2, step: 0.05, label: "Glow Intensity" },
    sunGlowSize: { value: 3.0, min: 1, max: 6, step: 0.1, label: "Glow Size" },
    sunRaysEnabled: { value: true, label: "Show Rays" },
    sunRayCount: { value: 12, min: 4, max: 24, step: 2, label: "Ray Count" },
    sunRayLength: { value: 0.3, min: 0.1, max: 0.8, step: 0.05, label: "Ray Length" },
  });

  const moon = useControls("Moon", {
    moonSize: { value: 0.06, min: 0.02, max: 0.15, step: 0.005, label: "Size" },
    moonPhase: { value: 0.5, min: 0, max: 1, step: 0.01, label: "Phase (0=new, 0.5=full)" },
    moonGlowIntensity: { value: 0.6, min: 0, max: 1.5, step: 0.05, label: "Glow Intensity" },
    moonGlowSize: { value: 2.5, min: 1, max: 5, step: 0.1, label: "Glow Size" },
    showCraters: { value: true, label: "Show Craters" },
    craterDetail: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Crater Detail" },
  });

  const sky = useControls("Sky", {
    horizonOffset: { value: 0.1, min: -0.2, max: 0.4, step: 0.01, label: "Horizon Offset" },
    atmosphereThickness: { value: 1.0, min: 0.5, max: 2, step: 0.1, label: "Atmosphere" },
    starDensity: { value: 0.5, min: 0, max: 1, step: 0.05, label: "Star Density" },
  });

  const debug = useControls("Debug", {
    showPath: { value: false, label: "Show Orbital Path" },
    showDebug: { value: false, label: "Debug Mode" },
  });

  return (
    <div className="relative min-h-screen bg-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Sun & Moon Effect" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />
      <CelestialCanvas
        className="absolute inset-0"
        timeOfDay={time.timeOfDay}
        animateTime={time.animateTime}
        dayDuration={time.dayDuration}
        sunSize={sun.sunSize}
        sunGlowIntensity={sun.sunGlowIntensity}
        sunGlowSize={sun.sunGlowSize}
        sunRaysEnabled={sun.sunRaysEnabled}
        sunRayCount={sun.sunRayCount}
        sunRayLength={sun.sunRayLength}
        moonSize={moon.moonSize}
        moonPhase={moon.moonPhase}
        moonGlowIntensity={moon.moonGlowIntensity}
        moonGlowSize={moon.moonGlowSize}
        showCraters={moon.showCraters}
        craterDetail={moon.craterDetail}
        horizonOffset={sky.horizonOffset}
        atmosphereThickness={sky.atmosphereThickness}
        starDensity={sky.starDensity}
        showPath={debug.showPath}
        debug={debug.showDebug}
      />
    </div>
  );
}
