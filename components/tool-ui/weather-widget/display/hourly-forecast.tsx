"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { ConditionIcon } from "../icons";
import { TactileCard, EmbossedText } from "../skeuomorphic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHour(hour: number, locale: string): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);

  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface HourlyForecastProps {
  className?: string;
}

export function HourlyForecast({ className }: HourlyForecastProps) {
  const { widget, locale } = useWeatherWidget();
  const { hourlyForecast } = widget;

  if (!hourlyForecast || hourlyForecast.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-3 pb-2", className)}>
      <EmbossedText variant="inset" size="sm" className="mb-2 block px-2">
        Hourly
      </EmbossedText>

      {/* Native horizontal scroll container */}
      <div
        className={cn(
          "flex gap-2 overflow-x-auto pb-2",
          // Hide scrollbar on webkit but keep functionality
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-white/20",
        )}
      >
        {hourlyForecast.map((item, index) => (
          <TactileCard
            key={`${item.hour}-${index}`}
            variant="inset"
            padding="sm"
            rounded="lg"
            className="flex min-w-[60px] flex-shrink-0 flex-col items-center gap-1"
          >
            {/* Hour */}
            <span className="text-xs text-white/50">
              {index === 0 ? "Now" : formatHour(item.hour, locale)}
            </span>

            {/* Icon */}
            <ConditionIcon condition={item.condition} size={24} />

            {/* Temperature */}
            <span className="text-sm font-medium text-white/90">
              {Math.round(item.temperature)}{"\u00B0"}
            </span>

            {/* Precipitation chance (if any) */}
            {item.precipChance !== undefined && item.precipChance > 0 && (
              <span className="text-[10px] text-blue-300/80">
                {item.precipChance}%
              </span>
            )}
          </TactileCard>
        ))}
      </div>
    </div>
  );
}
