"use client";

import * as React from "react";
import type { WeatherCondition } from "../schema";
import { SunIcon } from "./sun-icon";
import { RainIcon } from "./rain-icon";
import { SnowIcon } from "./snow-icon";
import { CloudIcon } from "./cloud-icon";
import { PartlyCloudyIcon } from "./partly-cloudy-icon";
import { ThunderstormIcon } from "./thunderstorm-icon";
import { FogIcon } from "./fog-icon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConditionIconProps {
  condition: WeatherCondition;
  className?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConditionIcon({
  condition,
  className,
  size = 32,
}: ConditionIconProps) {
  switch (condition) {
    case "clear":
      return <SunIcon className={className} size={size} />;

    case "partly_cloudy":
      return <PartlyCloudyIcon className={className} size={size} />;

    case "cloudy":
      return <CloudIcon className={className} size={size} variant="light" />;

    case "overcast":
      return <CloudIcon className={className} size={size} variant="dark" />;

    case "fog":
      return <FogIcon className={className} size={size} />;

    case "drizzle":
    case "rain":
    case "heavy_rain":
      return <RainIcon className={className} size={size} />;

    case "thunderstorm":
      return <ThunderstormIcon className={className} size={size} />;

    case "snow":
    case "heavy_snow":
    case "sleet":
    case "hail":
      return <SnowIcon className={className} size={size} />;

    default:
      return <CloudIcon className={className} size={size} variant="light" />;
  }
}

// ---------------------------------------------------------------------------
// Helper: Get condition display name
// ---------------------------------------------------------------------------

export function getConditionLabel(condition: WeatherCondition): string {
  const labels: Record<WeatherCondition, string> = {
    clear: "Clear",
    partly_cloudy: "Partly Cloudy",
    cloudy: "Cloudy",
    overcast: "Overcast",
    fog: "Foggy",
    drizzle: "Drizzle",
    rain: "Rain",
    heavy_rain: "Heavy Rain",
    thunderstorm: "Thunderstorm",
    snow: "Snow",
    heavy_snow: "Heavy Snow",
    sleet: "Sleet",
    hail: "Hail",
  };
  return labels[condition] ?? condition;
}
