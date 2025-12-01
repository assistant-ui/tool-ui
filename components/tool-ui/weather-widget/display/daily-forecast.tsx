"use client";

import * as React from "react";
import { cn } from "../_cn";
import { Separator } from "../_ui";
import { useWeatherWidget } from "../context";
import { ConditionIcon } from "../icons";
import { TactileCard, EmbossedText } from "../skeuomorphic";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isToday(dateStr: string): boolean {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface DailyForecastProps {
  className?: string;
}

export function DailyForecast({ className }: DailyForecastProps) {
  const { widget, state, setState } = useWeatherWidget();
  const { dailyForecast } = widget;

  if (!dailyForecast || dailyForecast.length === 0) {
    return null;
  }

  return (
    <div className={cn("px-3 pb-3", className)}>
      <EmbossedText variant="inset" size="sm" className="mb-2 block px-2">
        5-Day Forecast
      </EmbossedText>

      <TactileCard variant="inset" padding="none" rounded="xl">
        <div className="divide-y divide-white/5">
          {dailyForecast.map((item, index) => {
            const today = isToday(item.date);
            const isSelected = state.selectedDay === item.date;

            return (
              <button
                key={item.date}
                type="button"
                onClick={() =>
                  setState({
                    selectedDay: isSelected ? undefined : item.date,
                  })
                }
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5",
                  "transition-colors duration-150",
                  "hover:bg-white/5",
                  isSelected && "bg-white/10",
                  index === 0 && "rounded-t-xl",
                  index === dailyForecast.length - 1 && "rounded-b-xl",
                )}
              >
                {/* Day name */}
                <span
                  className={cn(
                    "w-12 text-left text-sm",
                    today ? "font-semibold text-white/90" : "text-white/70",
                  )}
                >
                  {today ? "Today" : item.dayOfWeek}
                </span>

                {/* Precipitation chance */}
                <span className="w-8 text-center text-xs text-blue-300/80">
                  {item.precipChance !== undefined && item.precipChance > 0
                    ? `${item.precipChance}%`
                    : ""}
                </span>

                {/* Icon */}
                <div className="flex flex-1 justify-center">
                  <ConditionIcon condition={item.condition} size={24} />
                </div>

                {/* High / Low temps */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-right text-sm font-medium text-white/90">
                    {Math.round(item.high)}\u00B0
                  </span>
                  <span className="w-8 text-right text-sm text-white/50">
                    {Math.round(item.low)}\u00B0
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </TactileCard>
    </div>
  );
}
