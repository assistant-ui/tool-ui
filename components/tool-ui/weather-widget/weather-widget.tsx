"use client";

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
  type LucideIcon,
} from "lucide-react";
import { cn, Card, CardHeader, CardTitle, CardContent } from "./_adapter";
import type {
  WeatherWidgetProps,
  WeatherCondition,
  ForecastDay,
} from "./schema";

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
  fog: "Fog",
  drizzle: "Drizzle",
  rain: "Rain",
  "heavy-rain": "Heavy Rain",
  thunderstorm: "Thunderstorm",
  snow: "Snow",
  sleet: "Sleet",
  hail: "Hail",
  windy: "Windy",
};

interface ConditionIconProps {
  condition: WeatherCondition;
  className?: string;
}

function ConditionIcon({ condition, className }: ConditionIconProps) {
  const Icon = conditionIcons[condition];
  return <Icon className={className} aria-hidden="true" />;
}

function formatTemperature(
  temp: number,
  unit: "celsius" | "fahrenheit",
): string {
  const rounded = Math.round(temp);
  return unit === "celsius" ? `${rounded}°` : `${rounded}°`;
}

function formatRelativeTime(isoString: string, locale?: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffMinutes,
      "minute",
    );
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffHours,
      "hour",
    );
  }

  const diffDays = Math.floor(diffHours / 24);
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    -diffDays,
    "day",
  );
}

interface ForecastDayCardProps {
  day: ForecastDay;
  unit: "celsius" | "fahrenheit";
  index: number;
}

function ForecastDayCard({ day, unit, index }: ForecastDayCardProps) {
  const baseDelay = 100 + index * 50;

  return (
    <div
      className="flex flex-col items-center gap-1 py-2 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-both"
      style={{ animationDelay: `${baseDelay}ms` }}
    >
      <span className="text-muted-foreground text-xs font-medium">
        {day.day}
      </span>
      <ConditionIcon
        condition={day.condition}
        className="text-muted-foreground size-5"
      />
      <div className="flex flex-col items-center text-xs tabular-nums">
        <span className="font-medium">{formatTemperature(day.tempMax, unit)}</span>
        <span className="text-muted-foreground">
          {formatTemperature(day.tempMin, unit)}
        </span>
      </div>
    </div>
  );
}

function ForecastDayCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="bg-muted h-3 w-6 animate-pulse rounded" />
      <div className="bg-muted size-5 animate-pulse rounded" />
      <div className="flex flex-col items-center gap-0.5">
        <div className="bg-muted h-3 w-6 animate-pulse rounded" />
        <div className="bg-muted h-3 w-6 animate-pulse rounded" />
      </div>
    </div>
  );
}

export function WeatherWidget({
  id,
  location,
  current,
  forecast,
  unit = "celsius",
  updatedAt,
  className,
  isLoading = false,
  locale: localeProp,
}: WeatherWidgetProps) {
  const locale =
    localeProp ??
    (typeof navigator !== "undefined" ? navigator.language : undefined);

  const unitLabel = unit === "celsius" ? "C" : "F";
  const conditionLabel = conditionLabels[current.condition];

  return (
    <article
      data-slot="weather-widget"
      data-tool-ui-id={id}
      aria-busy={isLoading}
      className={cn("w-full max-w-sm", className)}
    >
      <Card className="overflow-clip">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{location}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="bg-muted size-12 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="bg-muted h-10 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-both"
              style={{ animationDelay: "0ms" }}
            >
              <ConditionIcon
                condition={current.condition}
                className="text-muted-foreground size-12"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-light tabular-nums"
                    aria-label={`${Math.round(current.temp)} degrees ${unit === "celsius" ? "Celsius" : "Fahrenheit"}`}
                  >
                    {Math.round(current.temp)}
                  </span>
                  <span className="text-muted-foreground text-lg">
                    °{unitLabel}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>{conditionLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    H:{formatTemperature(current.tempMax, unit)} L:
                    {formatTemperature(current.tempMin, unit)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-border border-t pt-3">
            {isLoading ? (
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, index) => (
                  <ForecastDayCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div
                className="flex justify-between"
                role="list"
                aria-label="Weather forecast"
              >
                {forecast.map((day, index) => (
                  <div key={day.day} role="listitem">
                    <ForecastDayCard day={day} unit={unit} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {updatedAt && !isLoading && (
            <p
              className="text-muted-foreground text-xs animate-in fade-in duration-500 fill-mode-both"
              style={{ animationDelay: "300ms" }}
            >
              Updated {formatRelativeTime(updatedAt, locale)}
            </p>
          )}
        </CardContent>
      </Card>
    </article>
  );
}

export function WeatherWidgetProgress({ className }: { className?: string }) {
  return (
    <div
      data-slot="weather-widget-progress"
      aria-busy="true"
      className={cn("w-full max-w-sm", className)}
    >
      <Card>
        <CardHeader className="pb-2">
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted size-12 animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="bg-muted h-10 w-20 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
          </div>
          <div className="border-border border-t pt-3">
            <div className="flex justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <ForecastDayCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
