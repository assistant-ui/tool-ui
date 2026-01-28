"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Leva, useControls, button } from "leva";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import type {
  ForecastDay,
  PrecipitationLevel,
  TemperatureUnit,
  WeatherCondition,
} from "@/components/tool-ui/weather-widget/schema";
import { cn } from "@/lib/ui/cn";

const CONDITIONS: WeatherCondition[] = [
  "clear",
  "partly-cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "sleet",
  "hail",
  "windy",
];

const WEBGL_SAFE_WIDGET_COUNT = 8;

// A representative subset that exercises the major effect pathways:
// - clouds, fog, rain, heavy rain, lightning, snow
const CONDITION_SPECTRUM: WeatherCondition[] = [
  "clear",
  "partly-cloudy",
  "overcast",
  "fog",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
];

const CITIES = [
  { location: "San Diego, CA", condition: "clear" as const },
  { location: "Seattle, WA", condition: "rain" as const },
  { location: "London, UK", condition: "fog" as const },
  { location: "Minneapolis, MN", condition: "snow" as const },
  { location: "Kansas City, MO", condition: "thunderstorm" as const },
  { location: "Chicago, IL", condition: "windy" as const },
  { location: "Bangkok, Thailand", condition: "heavy-rain" as const },
  { location: "Reykjavik, Iceland", condition: "sleet" as const },
  { location: "Denver, CO", condition: "partly-cloudy" as const },
  { location: "San Francisco, CA", condition: "cloudy" as const },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

function timeToISOString(timeOfDay: number): string {
  const totalMinutes = timeOfDay * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}

function baseTempForCondition(condition: WeatherCondition, unit: TemperatureUnit): number {
  const f: Record<WeatherCondition, number> = {
    clear: 78,
    "partly-cloudy": 70,
    cloudy: 62,
    overcast: 58,
    fog: 54,
    drizzle: 52,
    rain: 50,
    "heavy-rain": 47,
    thunderstorm: 72,
    snow: 18,
    sleet: 34,
    hail: 38,
    windy: 45,
  };
  const tempF = f[condition] ?? 65;
  if (unit === "fahrenheit") return tempF;
  return Math.round(((tempF - 32) * 5) / 9);
}

function precipitationForCondition(condition: WeatherCondition): PrecipitationLevel | undefined {
  switch (condition) {
    case "drizzle":
      return "light";
    case "rain":
      return "moderate";
    case "heavy-rain":
    case "thunderstorm":
      return "heavy";
    case "snow":
    case "sleet":
    case "hail":
      return "moderate";
    default:
      return "none";
  }
}

function buildForecast(
  rand: () => number,
  condition: WeatherCondition,
  unit: TemperatureUnit,
): ForecastDay[] {
  const base = baseTempForCondition(condition, unit);
  const start = Math.floor(rand() * WEEKDAYS.length);

  return Array.from({ length: 7 }).slice(0, 7).map((_, i) => {
    const day = WEEKDAYS[(start + i) % WEEKDAYS.length]!;
    const hi = base + Math.round((rand() - 0.4) * 10);
    const lo = hi - (3 + Math.round(rand() * 8));
    const maybeCondition =
      i === 0 ? condition : pick(rand, CONDITIONS);
    return {
      day,
      tempMin: lo,
      tempMax: hi,
      condition: maybeCondition,
    };
  });
}

export default function WeatherWidgetStressPage() {
  const [remountSeed, setRemountSeed] = useState(0);

  const [stress] = useControls("Stress", () => ({
    count: {
      value: WEBGL_SAFE_WIDGET_COUNT,
      min: 1,
      max: WEBGL_SAFE_WIDGET_COUNT,
      step: 1,
      label: "WebGL widgets",
    },
    columns: { value: 4, min: 1, max: 6, step: 1 },
    fillCells: { value: true, label: "Fill grid cells" },
    remountAll: button(() => setRemountSeed((s) => s + 1)),
    autoRemount: { value: false, label: "Auto-remount" },
    autoRemountSeconds: { value: 5, min: 1, max: 30, step: 1, label: "Auto-remount (s)" },
  }));

  const [timeControls, setTimeControls] = useControls("Time", () => ({
    timeOfDay: { value: 0.5, min: 0, max: 1, step: 0.001 },
    animate: { value: false, label: "Animate time" },
    speed: { value: 0.03, min: 0.001, max: 0.2, step: 0.001, label: "Speed (Δ/second)" },
  }));

  const [effectsControls] = useControls("Effects", () => ({
    enabled: { value: true },
    reducedMotion: { value: false, label: "Reduced motion" },
    quality: {
      value: "auto" as const,
      options: ["low", "medium", "high", "auto"] as const,
    },
  }));

  const [dataControls] = useControls("Data", () => ({
    includeUpdatedAt: { value: true },
    includeExtras: { value: true },
    unit: { value: "fahrenheit" as const, options: ["fahrenheit", "celsius"] as const },
  }));

  const timeOfDayRef = useRef(timeControls.timeOfDay);
  useEffect(() => {
    timeOfDayRef.current = timeControls.timeOfDay;
  }, [timeControls.timeOfDay]);

  useEffect(() => {
    if (!timeControls.animate) return;

    const intervalMs = 120;
    const id = window.setInterval(() => {
      const next = (timeOfDayRef.current + timeControls.speed * (intervalMs / 1000)) % 1;
      timeOfDayRef.current = next;
      setTimeControls({ timeOfDay: next });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [setTimeControls, timeControls.animate, timeControls.speed]);

  useEffect(() => {
    if (!stress.autoRemount) return;
    const id = window.setInterval(() => setRemountSeed((s) => s + 1), stress.autoRemountSeconds * 1000);
    return () => window.clearInterval(id);
  }, [stress.autoRemount, stress.autoRemountSeconds]);

  const timestamp = useMemo(() => timeToISOString(timeControls.timeOfDay), [timeControls.timeOfDay]);

  const globalEffects = useMemo(() => {
    return {
      enabled: effectsControls.enabled,
      reducedMotion: effectsControls.reducedMotion,
      quality: effectsControls.quality,
    } as const;
  }, [effectsControls.enabled, effectsControls.quality, effectsControls.reducedMotion]);

  const gridItems = useMemo(() => {
    const items: Array<{
      key: string;
      widget: ReactNode;
      label: string;
    }> = [];

    for (let i = 0; i < stress.count; i++) {
      const rand = mulberry32(remountSeed * 100_000 + i * 9973 + 42);

      const city = CITIES[i % CITIES.length]!;
      const unit = dataControls.unit;

      const condition = CONDITION_SPECTRUM[i % CONDITION_SPECTRUM.length]!;
      const baseTemp = baseTempForCondition(condition, unit);
      const includeUpdatedAt = dataControls.includeUpdatedAt;
      const includeExtras = dataControls.includeExtras;
      const location = city.location;

      const currentTemp = baseTemp + Math.round((rand() - 0.5) * 8);
      const tempMax = currentTemp + (2 + Math.round(rand() * 6));
      const tempMin = currentTemp - (2 + Math.round(rand() * 8));

      const precipitation = precipitationForCondition(condition);

      const current = {
        temp: currentTemp,
        tempMin,
        tempMax,
        condition,
        ...(includeExtras
          ? {
            humidity:
              condition === "fog" ? 95 : Math.round(clamp(30 + rand() * 70, 0, 100)),
            windSpeed:
              condition === "windy" ? Math.round(15 + rand() * 25) : Math.round(rand() * 20),
            windDirection: Math.round(rand() * 360),
            precipitation,
            visibility:
              condition === "fog" ? clamp(0.5 + rand() * 2.5, 0.1, 10) : clamp(3 + rand() * 10, 0.1, 15),
          }
          : {}),
      };

      const forecast = buildForecast(rand, condition, unit).slice(0, 7);

      const widget = (
        <WeatherWidget
          id={`weather-widget-stress-${remountSeed}-${i}`}
          location={location}
          current={current}
          forecast={forecast}
          unit={unit}
          updatedAt={includeUpdatedAt ? timestamp : undefined}
          isLoading={false}
          effects={globalEffects}
          className={stress.fillCells ? "max-w-none w-full" : undefined}
        />
      );

      items.push({
        key: `${remountSeed}-${i}`,
        widget,
        label: condition,
      });
    }

    return items;
  }, [
    dataControls.includeExtras,
    dataControls.includeUpdatedAt,
    dataControls.unit,
    globalEffects,
    remountSeed,
    stress.count,
    stress.fillCells,
    timestamp,
  ]);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Weather Widget Stress Lab" }}
        theme={{
          sizes: {
            rootWidth: "300px",
            controlWidth: "140px",
          },
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-8 pb-24">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Weather Widget Stress Lab
          </h1>
          <p className="max-w-3xl text-sm text-zinc-400">
            WebGL-safe sampler for the shipping weather effects. It renders a small
            set of representative conditions so you can scrub time of day globally
            and spot visual/correctness issues quickly.
          </p>
          <div className="max-w-3xl rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
            <span className="font-medium text-zinc-200">Note:</span> Effects use{" "}
            <span className="font-medium text-zinc-200">WebGL2</span>, and browsers
            cap how many WebGL contexts can be active. This page intentionally caps
            the sampler grid to{" "}
            <span className="font-mono text-zinc-200">
              {WEBGL_SAFE_WIDGET_COUNT}
            </span>{" "}
            widgets so every card can render effects without falling back.
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Widgets: <span className="font-mono text-zinc-200">{stress.count}</span>
            </span>
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Columns: <span className="font-mono text-zinc-200">{stress.columns}</span>
            </span>
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Time:{" "}
              <span className="font-mono text-zinc-200">
                {timeControls.timeOfDay.toFixed(3)}
              </span>
            </span>
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Effects:{" "}
              <span className="font-mono text-zinc-200">
                {effectsControls.enabled ? "on" : "off"}
              </span>
            </span>
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Reduced motion:{" "}
              <span className="font-mono text-zinc-200">
                {effectsControls.reducedMotion ? "on" : "off"}
              </span>
            </span>
            <span className="rounded border border-zinc-800 bg-zinc-900/40 px-2 py-1">
              Quality:{" "}
              <span className="font-mono text-zinc-200">{effectsControls.quality}</span>
            </span>
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              WebGL-safe condition sampler
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="hidden sm:inline">Tip:</span>
              <span className="hidden sm:inline">
                Adjust time of day to preview all conditions at the same moment.
              </span>
            </div>
          </div>

          <div
            className={cn("grid gap-4", stress.fillCells && "items-stretch")}
            style={{
              gridTemplateColumns: `repeat(${stress.columns}, minmax(0, 1fr))`,
            }}
          >
            {gridItems.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                  {item.label}
                </div>
                {item.widget}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

