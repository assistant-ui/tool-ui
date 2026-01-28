"use client";

import { cn, Card } from "./_adapter";
import {
  EffectCompositor,
  getSceneBrightnessFromTimeOfDay,
  getTimeOfDay,
  getWeatherTheme,
} from "./effects";
import type { WeatherWidgetProps } from "./schema";
import { WeatherDataOverlay } from "./weather-data-overlay";

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
  effects,
  customEffectProps,
}: WeatherWidgetProps) {
  const locale =
    localeProp ??
    (typeof navigator !== "undefined" ? navigator.language : undefined);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const reducedMotion = effects?.reducedMotion ?? Boolean(prefersReducedMotion);
  const effectsEnabled = effects?.enabled !== false && !isLoading && !reducedMotion;

  // Match the overlay’s expected background even when effects are disabled
  // (e.g. prefers-reduced-motion), so text contrast stays correct.
  const overlayTimeOfDay = customEffectProps?.celestial?.timeOfDay;
  const timeOfDay =
    typeof overlayTimeOfDay === "number" ? overlayTimeOfDay : getTimeOfDay(updatedAt);
  const brightness = getSceneBrightnessFromTimeOfDay(timeOfDay, current.condition);
  const weatherTheme = getWeatherTheme(brightness);
  const isWeatherDark = weatherTheme === "dark";
  const backgroundClass = isWeatherDark
    ? "bg-gradient-to-b from-zinc-950 via-zinc-900/70 to-zinc-950"
    : "bg-gradient-to-b from-sky-50 via-sky-100/70 to-white";

  const updatedAtLabel =
    updatedAt && !isLoading
      ? `Updated ${formatRelativeTime(updatedAt, locale)}`
      : undefined;

  return (
    <article
      data-slot="weather-widget"
      data-tool-ui-id={id}
      aria-busy={isLoading}
      className={cn("w-full max-w-sm", className)}
    >
      <Card className={cn("relative overflow-clip aspect-[4/3]", backgroundClass)}>
        {effectsEnabled && (
          <EffectCompositor
            condition={current.condition}
            windSpeed={current.windSpeed}
            windDirection={current.windDirection}
            precipitation={current.precipitation}
            humidity={current.humidity}
            visibility={current.visibility}
            timestamp={updatedAt}
            settings={effects}
            customProps={customEffectProps}
          />
        )}

        {isLoading ? (
          <div className="absolute inset-0 z-10 flex flex-col p-4">
            <div
              className={cn(
                "h-4 w-40 rounded animate-pulse",
                isWeatherDark ? "bg-white/10" : "bg-black/10",
              )}
            />
            <div
              className={cn(
                "mt-1 h-3 w-24 rounded animate-pulse",
                isWeatherDark ? "bg-white/5" : "bg-black/5",
              )}
            />
            <div className="flex-1" />
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div
                  className={cn(
                    "h-16 w-24 rounded animate-pulse",
                    isWeatherDark ? "bg-white/10" : "bg-black/10",
                  )}
                />
                <div
                  className={cn(
                    "h-6 w-10 rounded animate-pulse",
                    isWeatherDark ? "bg-white/5" : "bg-black/5",
                  )}
                />
              </div>
              <div
                className={cn(
                  "h-16 rounded-xl border animate-pulse",
                  isWeatherDark
                    ? "border-white/10 bg-white/5"
                    : "border-black/10 bg-black/5",
                )}
              />
            </div>
          </div>
        ) : (
          <WeatherDataOverlay
            location={location}
            condition={current.condition}
            temperature={current.temp}
            tempHigh={current.tempMax}
            tempLow={current.tempMin}
            humidity={current.humidity}
            windSpeed={current.windSpeed}
            visibility={current.visibility}
            forecast={forecast}
            unit={unit}
            updatedAtLabel={updatedAtLabel}
            timeOfDay={overlayTimeOfDay}
            timestamp={updatedAt}
          />
        )}
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
      <Card className="relative overflow-clip aspect-[4/3] bg-gradient-to-b from-zinc-950 via-zinc-900/70 to-zinc-950">
        <div className="absolute inset-0 flex flex-col p-4">
          <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
          <div className="mt-1 h-3 w-24 rounded bg-white/5 animate-pulse" />
          <div className="flex-1" />
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="h-16 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-6 w-10 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="h-16 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          </div>
        </div>
      </Card>
    </div>
  );
}
