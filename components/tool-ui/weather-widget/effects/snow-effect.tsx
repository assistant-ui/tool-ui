"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { EFFECT_INTENSITY_CONFIG } from "../types";
import "./weather-effects.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SnowFlake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  swayDuration: number;
  swayAmount: number;
  blur: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSnowFlakes(count: number, isHeavy: boolean): SnowFlake[] {
  return Array.from({ length: count }, (_, i) => {
    const size = isHeavy ? 6 + Math.random() * 8 : 4 + Math.random() * 6;
    const isSmall = size < 6;

    return {
      id: i,
      x: Math.random() * 100,
      size,
      duration: isHeavy ? 4 + Math.random() * 3 : 5 + Math.random() * 4,
      delay: Math.random() * 5,
      drift: 15 + Math.random() * 25,
      swayDuration: 2 + Math.random() * 2,
      swayAmount: 5 + Math.random() * 10,
      blur: isSmall ? 1 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface SnowEffectProps {
  className?: string;
  variant?: "normal" | "heavy";
}

export function SnowEffect({ className, variant = "normal" }: SnowEffectProps) {
  const { effectIntensity } = useWeatherWidget();

  const flakes = React.useMemo(() => {
    const config = EFFECT_INTENSITY_CONFIG[effectIntensity];
    const baseCount = config.flakeCount;
    const count = variant === "heavy" ? Math.floor(baseCount * 1.4) : baseCount;

    return generateSnowFlakes(count, variant === "heavy");
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
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className={cn("snow-flake", variant === "heavy" && "snow-flake--heavy")}
          style={{
            "--snow-x": `${flake.x}%`,
            "--flake-size": `${flake.size}px`,
            "--snow-duration": `${flake.duration}s`,
            "--snow-delay": `${flake.delay}s`,
            "--snow-drift": `${flake.drift}px`,
            "--sway-duration": `${flake.swayDuration}s`,
            "--sway-amount": `${flake.swayAmount}px`,
            "--flake-blur": `${flake.blur}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
