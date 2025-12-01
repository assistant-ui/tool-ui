"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { EFFECT_INTENSITY_CONFIG } from "../types";
import "./weather-effects.css";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface SunEffectProps {
  className?: string;
}

export function SunEffect({ className }: SunEffectProps) {
  const { effectIntensity, timeOfDay } = useWeatherWidget();

  const config = EFFECT_INTENSITY_CONFIG[effectIntensity];
  const rayCount = config.rayCount;
  const opacity = config.opacity;

  // Adjust sun position based on time of day
  const sunPosition = React.useMemo(() => {
    switch (timeOfDay) {
      case "dawn":
        return { top: "25%", right: "10%" };
      case "day":
        return { top: "8%", right: "15%" };
      case "dusk":
        return { top: "30%", right: "5%" };
      default:
        return { top: "15%", right: "15%" };
    }
  }, [timeOfDay]);

  // Generate rays with varying delays
  const rays = React.useMemo(() => {
    return Array.from({ length: rayCount }, (_, i) => ({
      id: i,
      rotation: (360 / rayCount) * i,
      delay: (i * 0.2) % 3,
    }));
  }, [rayCount]);

  if (effectIntensity === "none") {
    return null;
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <div
        className="sun-container"
        style={{
          "--sun-top": sunPosition.top,
          "--sun-right": sunPosition.right,
          "--sun-size": "70px",
        } as React.CSSProperties}
      >
        {/* Core glow */}
        <div className="sun-core" />

        {/* Rotating rays */}
        <div className="sun-rays">
          {rays.map((ray) => (
            <div
              key={ray.id}
              className="sun-ray"
              style={{
                transform: `translateX(-50%) rotate(${ray.rotation}deg)`,
                animationDelay: `${ray.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Lens flare accents */}
        <div
          className="sun-flare"
          style={{
            top: "120%",
            left: "30%",
            opacity: 0.4,
          }}
        />
        <div
          className="sun-flare"
          style={{
            top: "150%",
            left: "60%",
            width: "12px",
            height: "12px",
            opacity: 0.25,
          }}
        />
      </div>
    </div>
  );
}
