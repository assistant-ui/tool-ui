"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import type { WeatherCondition } from "../schema";
import { RainEffect } from "./rain-effect";
import { SnowEffect } from "./snow-effect";
import { SunEffect } from "./sun-effect";
import { CloudsEffect } from "./clouds-effect";
import "./weather-effects.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface EffectsConfig {
  rain?: "light" | "normal" | "heavy";
  snow?: "normal" | "heavy";
  sun?: boolean;
  clouds?: boolean;
  darkClouds?: boolean;
  lightning?: boolean;
}

function getEffectsForCondition(condition: WeatherCondition): EffectsConfig {
  switch (condition) {
    case "clear":
      return { sun: true };

    case "partly_cloudy":
      return { sun: true, clouds: true };

    case "cloudy":
      return { clouds: true };

    case "overcast":
      return { clouds: true, darkClouds: true };

    case "fog":
      return { clouds: true };

    case "drizzle":
      return { rain: "light", clouds: true };

    case "rain":
      return { rain: "normal", clouds: true, darkClouds: true };

    case "heavy_rain":
      return { rain: "heavy", clouds: true, darkClouds: true };

    case "thunderstorm":
      return { rain: "heavy", clouds: true, darkClouds: true, lightning: true };

    case "snow":
      return { snow: "normal", clouds: true };

    case "heavy_snow":
      return { snow: "heavy", clouds: true };

    case "sleet":
      return { rain: "light", snow: "normal", clouds: true, darkClouds: true };

    case "hail":
      return { rain: "normal", clouds: true, darkClouds: true };

    default:
      return {};
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface EffectsLayerProps {
  className?: string;
  children?: React.ReactNode;
}

export function EffectsLayer({ className, children }: EffectsLayerProps) {
  const { widget, effectIntensity } = useWeatherWidget();
  const config = getEffectsForCondition(widget.current.condition);

  // Lightning flash timing - random interval
  const [showLightning, setShowLightning] = React.useState(false);

  React.useEffect(() => {
    if (!config.lightning || effectIntensity === "none") {
      setShowLightning(false);
      return;
    }

    // Random lightning flashes
    const scheduleFlash = () => {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      return setTimeout(() => {
        setShowLightning(true);
        setTimeout(() => setShowLightning(false), 200);
        scheduleFlash();
      }, delay);
    };

    const timeout = scheduleFlash();
    return () => clearTimeout(timeout);
  }, [config.lightning, effectIntensity]);

  return (
    <div className={cn("relative", className)}>
      {/* Weather effects layer (behind content) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
        {/* Clouds - rendered first (background) */}
        {config.clouds && (
          <CloudsEffect isDark={config.darkClouds} />
        )}

        {/* Sun effect */}
        {config.sun && <SunEffect />}

        {/* Rain effect */}
        {config.rain && <RainEffect variant={config.rain} />}

        {/* Snow effect */}
        {config.snow && <SnowEffect variant={config.snow} />}

        {/* Lightning flash overlay */}
        {config.lightning && showLightning && (
          <div className="lightning-overlay" />
        )}
      </div>

      {/* Content layer (above effects) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
