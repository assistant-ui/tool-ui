"use client";

import { cn } from "@/lib/ui/cn";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudHail,
  Wind,
  Droplets,
  Eye,
  type LucideIcon,
} from "lucide-react";

const conditionIcons: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  "heavy-rain": CloudRain,
  thunderstorm: CloudLightning,
  snow: Snowflake,
  sleet: CloudHail,
  hail: CloudHail,
  windy: Wind,
};

const conditionLabels: Record<WeatherCondition, string> = {
  clear: "Clear",
  "partly-cloudy": "Partly Cloudy",
  cloudy: "Cloudy",
  overcast: "Overcast",
  fog: "Foggy",
  drizzle: "Drizzle",
  rain: "Rain",
  "heavy-rain": "Heavy Rain",
  thunderstorm: "Thunderstorm",
  snow: "Snow",
  sleet: "Sleet",
  hail: "Hail",
  windy: "Windy",
};

interface ForecastDay {
  day: string;
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition;
}

interface WeatherDataOverlayProps {
  location: string;
  condition: WeatherCondition;
  temperature: number;
  tempHigh: number;
  tempLow: number;
  humidity?: number;
  windSpeed?: number;
  visibility?: number;
  forecast?: ForecastDay[];
  unit?: "celsius" | "fahrenheit";
  className?: string;
}

export function WeatherDataOverlay({
  location,
  condition,
  temperature,
  tempHigh,
  tempLow,
  humidity = 45,
  windSpeed = 8,
  visibility = 10,
  forecast = [],
  unit = "fahrenheit",
  className,
}: WeatherDataOverlayProps) {
  const ConditionIcon = conditionIcons[condition];
  const conditionLabel = conditionLabels[condition];
  const unitSymbol = unit === "celsius" ? "C" : "F";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4",
        className
      )}
    >
      {/* Top row - Location & Condition */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/40"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            Location
          </span>
          <h2
            className="text-[15px] font-medium tracking-tight text-white drop-shadow-md"
            style={{
              fontFamily: '"SF Pro Display", system-ui, sans-serif',
              textShadow: "0 1px 8px rgba(0,0,0,0.3)",
            }}
          >
            {location}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.12] px-2.5 py-1 backdrop-blur-xl border border-white/[0.08]">
          <ConditionIcon className="size-3.5 text-white/90" strokeWidth={1.5} />
          <span
            className="text-[11px] font-medium text-white/90"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {conditionLabel}
          </span>
        </div>
      </div>

      {/* Center - Hero Temperature */}
      <div className="flex flex-col items-center justify-center -mt-4">
        <div className="relative flex items-start">
          <span
            className="text-[80px] font-[200] leading-none tracking-[-0.04em] text-white"
            style={{
              fontFamily: '"SF Pro Display", "Helvetica Neue", system-ui, sans-serif',
              fontFeatureSettings: '"tnum"',
              textShadow: "0 2px 20px rgba(0,0,0,0.25)",
            }}
          >
            {Math.round(temperature)}
          </span>
          <span
            className="mt-3 text-[28px] font-[200] text-white/50"
            style={{
              fontFamily: '"SF Pro Display", system-ui, sans-serif',
            }}
          >
            °{unitSymbol}
          </span>
        </div>

        {/* High / Low */}
        <div
          className="mt-0.5 flex items-center gap-3"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <span className="text-[13px] font-medium text-white/80">
            H:{Math.round(tempHigh)}°
          </span>
          <div className="h-3 w-px bg-white/20" />
          <span className="text-[13px] font-medium text-white/50">
            L:{Math.round(tempLow)}°
          </span>
        </div>

        {/* Quick stats */}
        <div
          className="mt-3 flex items-center gap-5"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3 text-white/40" strokeWidth={1.5} />
            <span className="text-[11px] font-medium tabular-nums text-white/60">
              {humidity}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="size-3 text-white/40" strokeWidth={1.5} />
            <span className="text-[11px] font-medium tabular-nums text-white/60">
              {windSpeed} mph
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="size-3 text-white/40" strokeWidth={1.5} />
            <span className="text-[11px] font-medium tabular-nums text-white/60">
              {visibility} mi
            </span>
          </div>
        </div>
      </div>

      {/* Bottom - Forecast strip */}
      {forecast.length > 0 && (
        <div className="rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.06] p-2.5">
          <div className="flex items-center justify-between">
            {forecast.slice(0, 5).map((day, index) => {
              const DayIcon = conditionIcons[day.condition];
              return (
                <div
                  key={day.day}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 py-0.5",
                    index === 0 ? "opacity-100" : "opacity-60"
                  )}
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-white/50">
                    {index === 0 ? "Now" : day.day}
                  </span>
                  <DayIcon className="my-0.5 size-4 text-white/80" strokeWidth={1.5} />
                  <div className="flex flex-col items-center leading-tight">
                    <span className="text-[12px] font-medium tabular-nums text-white/95">
                      {Math.round(day.tempMax)}°
                    </span>
                    <span className="text-[10px] tabular-nums text-white/40">
                      {Math.round(day.tempMin)}°
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
