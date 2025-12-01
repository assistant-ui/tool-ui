"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { EFFECT_INTENSITY_CONFIG } from "../types";
import "./weather-effects.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RainDrop {
  id: number;
  x: number;
  duration: number;
  delay: number;
  drift: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateRainDrops(count: number, isHeavy: boolean): RainDrop[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    duration: isHeavy ? 0.6 + Math.random() * 0.3 : 0.8 + Math.random() * 0.4,
    delay: Math.random() * 2,
    drift: 10 + Math.random() * 15,
    height: isHeavy ? 20 + Math.random() * 10 : 15 + Math.random() * 8,
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface RainEffectProps {
  className?: string;
  variant?: "light" | "normal" | "heavy";
}

export function RainEffect({ className, variant = "normal" }: RainEffectProps) {
  const { effectIntensity } = useWeatherWidget();

  const drops = React.useMemo(() => {
    const config = EFFECT_INTENSITY_CONFIG[effectIntensity];
    const baseCount = config.dropCount;
    const count =
      variant === "heavy"
        ? Math.floor(baseCount * 1.5)
        : variant === "light"
          ? Math.floor(baseCount * 0.6)
          : baseCount;

    return generateRainDrops(count, variant === "heavy");
  }, [effectIntensity, variant]);

  const opacity = EFFECT_INTENSITY_CONFIG[effectIntensity].opacity;

  if (effectIntensity === "none") {
    return null;
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className={cn(
            "rain-drop",
            variant === "heavy" && "rain-drop--heavy",
            variant === "light" && "rain-drop--light",
          )}
          style={{
            "--rain-x": `${drop.x}%`,
            "--rain-duration": `${drop.duration}s`,
            "--rain-delay": `${drop.delay}s`,
            "--rain-drift": `${drop.drift}px`,
            "--drop-height": `${drop.height}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
