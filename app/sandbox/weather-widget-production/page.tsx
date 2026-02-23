"use client";

import { useMemo } from "react";
import { Leva, useControls } from "leva";

import {
  WeatherWidget,
  type PrecipitationLevel,
  type TemperatureUnit,
  type WeatherConditionCode,
  type WeatherWidgetPayload,
} from "@/components/tool-ui/weather-widget/runtime";
import type { EffectQuality } from "@/components/tool-ui/weather-widget/schema-runtime";
import {
  getSceneBrightnessFromTimeOfDay,
  getWeatherTheme,
} from "@/components/tool-ui/weather-widget/generated/weather-runtime-core.generated";
import { WeatherDataOverlay } from "@/components/tool-ui/weather-widget/weather-data-overlay";
import { cn } from "@/lib/utils";
import { resolveWeatherEffectsCanvasRuntimeProps as resolveBaseCanvasProps } from "@/lib/weather-authoring/weather-widget/effects/canvas-resolver-runtime";
import {
  resolveEffectCanvasDpr,
  resolveEffectQuality,
} from "@/lib/weather-authoring/weather-widget/effects/effect-compositor-quality";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "@/lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated";
import { getNearestCheckpoint } from "@/lib/weather-authoring/weather-widget/effects/tuning";
import { WeatherEffectsCanvas } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-canvas";
import type { WeatherEffectsCanvasProps } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-types";
import { resolveWeatherEffectsCanvasRuntimeProps as resolveRuntimeDefaults } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-props";
import { createProductionHarnessRuntimeInput } from "./runtime-input";

const CONDITION_OPTIONS: WeatherConditionCode[] = [
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

const PRECIPITATION_OPTIONS: PrecipitationLevel[] = [
  "none",
  "light",
  "moderate",
  "heavy",
];

const TEMPERATURE_UNIT_OPTIONS: TemperatureUnit[] = ["celsius", "fahrenheit"];
const QUALITY_OPTIONS: EffectQuality[] = ["low", "medium", "high", "auto"];

function timeToISOString(timeOfDay: number): string {
  const now = new Date();
  const totalMinutes = timeOfDay * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  now.setUTCHours(hours, minutes, 0, 0);
  return now.toISOString();
}

function formatValue(value: number): string {
  return value.toFixed(3);
}

function formatDelta(next: number, prev: number): string {
  const delta = next - prev;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(3)}`;
}

interface UntunedPreviewProps {
  payload: WeatherWidgetPayload;
  effectsEnabled: boolean;
  quality: EffectQuality;
  canvasProps: WeatherEffectsCanvasProps;
  timeOfDay: number;
}

function UntunedPreview({
  payload,
  effectsEnabled,
  quality,
  canvasProps,
  timeOfDay,
}: UntunedPreviewProps) {
  const weatherTheme = getWeatherTheme(
    getSceneBrightnessFromTimeOfDay(timeOfDay, payload.current.conditionCode),
    undefined,
  );
  const isDarkTheme = weatherTheme === "dark";
  const qualityTier = resolveEffectQuality(quality);
  const dpr = resolveEffectCanvasDpr(qualityTier);

  return (
    <article data-slot="weather-widget" className="isolate w-full max-w-md">
      <div
        data-slot="card"
        className={cn(
          "@container/weather [container-type:size] relative aspect-[4/3] overflow-clip rounded-2xl border-0 p-0 shadow-none",
          isDarkTheme
            ? "bg-gradient-to-b from-zinc-950 via-zinc-900/70 to-zinc-950"
            : "bg-gradient-to-b from-sky-50 via-sky-100/70 to-white",
        )}
      >
        {effectsEnabled ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ pointerEvents: "none", borderRadius: "inherit" }}
            aria-hidden="true"
          >
            <WeatherEffectsCanvas
              className="absolute inset-0"
              dpr={dpr}
              {...canvasProps}
            />
          </div>
        ) : null}

        <WeatherDataOverlay
          location={payload.location.name}
          conditionCode={payload.current.conditionCode}
          temperature={payload.current.temperature}
          tempHigh={payload.current.tempMax}
          tempLow={payload.current.tempMin}
          forecast={payload.forecast}
          unit={payload.units.temperature}
          theme={weatherTheme}
          timeOfDay={timeOfDay}
          timestamp={payload.updatedAt}
          reducedMotion={false}
        />
      </div>
    </article>
  );
}

export default function WeatherWidgetProductionHarnessPage() {
  const {
    locationName,
    conditionCode,
    temperatureUnit,
    temperature,
    tempMin,
    tempMax,
    windSpeed,
    precipitationLevel,
    visibility,
    timeOfDay,
    effectsEnabled,
    quality,
  } = useControls("Production Payload", {
    locationName: { value: "San Francisco, CA" },
    conditionCode: { value: "overcast", options: CONDITION_OPTIONS },
    temperatureUnit: { value: "celsius", options: TEMPERATURE_UNIT_OPTIONS },
    temperature: { value: 22, min: -30, max: 55, step: 0.1 },
    tempMin: { value: 20, min: -40, max: 45, step: 0.1 },
    tempMax: { value: 24, min: -30, max: 60, step: 0.1 },
    windSpeed: { value: 3.3, min: 0, max: 25, step: 0.1 },
    precipitationLevel: { value: "none", options: PRECIPITATION_OPTIONS },
    visibility: { value: 10000, min: 100, max: 20000, step: 100 },
    timeOfDay: { value: 0.5, min: 0, max: 1, step: 0.01 },
    effectsEnabled: { value: true },
    quality: { value: "high", options: QUALITY_OPTIONS },
  });

  const updatedAt = useMemo(() => timeToISOString(timeOfDay), [timeOfDay]);

  const payload = useMemo<WeatherWidgetPayload>(
    () => ({
      version: "3.1",
      id: "weather-widget-production-harness",
      location: { name: locationName },
      units: { temperature: temperatureUnit as TemperatureUnit },
      current: {
        conditionCode: conditionCode as WeatherConditionCode,
        temperature,
        tempMin,
        tempMax,
        windSpeed,
        precipitationLevel: precipitationLevel as PrecipitationLevel,
        visibility,
      },
      forecast: [
        {
          label: "Tue",
          tempMin: tempMin - 1,
          tempMax: tempMax,
          conditionCode: conditionCode as WeatherConditionCode,
        },
        {
          label: "Wed",
          tempMin,
          tempMax: tempMax + 1,
          conditionCode: conditionCode as WeatherConditionCode,
        },
        {
          label: "Thu",
          tempMin: tempMin - 2,
          tempMax: tempMax + 2,
          conditionCode: conditionCode as WeatherConditionCode,
        },
        {
          label: "Fri",
          tempMin: tempMin - 1,
          tempMax: tempMax + 1,
          conditionCode: conditionCode as WeatherConditionCode,
        },
        {
          label: "Sat",
          tempMin,
          tempMax,
          conditionCode: conditionCode as WeatherConditionCode,
        },
      ],
      time: { localTimeOfDay: timeOfDay },
      updatedAt,
    }),
    [
      conditionCode,
      locationName,
      precipitationLevel,
      temperature,
      temperatureUnit,
      tempMax,
      tempMin,
      timeOfDay,
      updatedAt,
      visibility,
      windSpeed,
    ],
  );

  const { current, updatedAt: payloadUpdatedAt } = payload;
  const runtimeInput = useMemo(
    () =>
      createProductionHarnessRuntimeInput({
        conditionCode: current.conditionCode,
        windSpeed: current.windSpeed ?? 0,
        precipitationLevel: current.precipitationLevel ?? "none",
        visibility: current.visibility ?? 10000,
        timestamp: payloadUpdatedAt ?? updatedAt,
        timeOfDay,
      }),
    [current, payloadUpdatedAt, timeOfDay, updatedAt],
  );

  const untunedCanvasProps = useMemo(
    () => resolveBaseCanvasProps(runtimeInput),
    [runtimeInput],
  );
  const tunedCanvasProps = useMemo(
    () =>
      resolveBaseCanvasProps({
        ...runtimeInput,
        tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
      }),
    [runtimeInput],
  );

  const untunedRuntime = useMemo(
    () => resolveRuntimeDefaults(untunedCanvasProps),
    [untunedCanvasProps],
  );
  const tunedRuntime = useMemo(
    () => resolveRuntimeDefaults(tunedCanvasProps),
    [tunedCanvasProps],
  );

  const checkpoint = getNearestCheckpoint(runtimeInput.timeOfDay);
  const metrics = [
    {
      label: "post.bloomIntensity",
      untuned: untunedRuntime.post.bloomIntensity,
      tuned: tunedRuntime.post.bloomIntensity,
    },
    {
      label: "post.bloomThreshold",
      untuned: untunedRuntime.post.bloomThreshold,
      tuned: tunedRuntime.post.bloomThreshold,
    },
    {
      label: "post.exposureIntensity",
      untuned: untunedRuntime.post.exposureIntensity,
      tuned: tunedRuntime.post.exposureIntensity,
    },
    {
      label: "post.godRayIntensity",
      untuned: untunedRuntime.post.godRayIntensity,
      tuned: tunedRuntime.post.godRayIntensity,
    },
    {
      label: "post.haze",
      untuned: untunedRuntime.post.haze,
      tuned: tunedRuntime.post.haze,
    },
    {
      label: "cloud.ambientDarkness",
      untuned: untunedRuntime.cloud.ambientDarkness,
      tuned: tunedRuntime.cloud.ambientDarkness,
    },
  ];

  return (
    <div className="relative min-h-screen bg-linear-to-b from-slate-900 to-slate-950 px-6 py-8 text-white">
      <Leva
        collapsed={false}
        titleBar={{ title: "Production Harness Controls" }}
        theme={{
          sizes: {
            rootWidth: "320px",
            controlWidth: "140px",
          },
        }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            Weather Widget Production Harness
          </h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Left card is the production component with tuned checkpoint
            overrides. Right card uses the same payload but skips tuned
            overrides to expose baseline behavior.
          </p>
          <p className="text-xs text-slate-400">
            Active checkpoint:{" "}
            <span className="font-semibold text-slate-200">{checkpoint}</span> ·
            condition:{" "}
            <span className="font-semibold text-slate-200">
              {conditionCode}
            </span>
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-200">
              Production (tuned overrides on)
            </h2>
            <WeatherWidget
              {...payload}
              effects={{
                enabled: effectsEnabled,
                quality: quality as EffectQuality,
              }}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-200">
              Untuned baseline (same payload)
            </h2>
            <UntunedPreview
              payload={payload}
              effectsEnabled={effectsEnabled}
              quality={quality as EffectQuality}
              canvasProps={untunedCanvasProps}
              timeOfDay={runtimeInput.timeOfDay}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-medium text-slate-100">
            Runtime post-process diagnostics (untuned vs tuned)
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-2 font-medium">Metric</th>
                <th className="px-4 py-2 font-medium">Untuned</th>
                <th className="px-4 py-2 font-medium">Tuned</th>
                <th className="px-4 py-2 font-medium">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {metrics.map((metric) => (
                <tr key={metric.label}>
                  <td className="px-4 py-2 font-mono text-slate-200">
                    {metric.label}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-300">
                    {formatValue(metric.untuned)}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-100">
                    {formatValue(metric.tuned)}
                  </td>
                  <td className="px-4 py-2 font-mono text-amber-200">
                    {formatDelta(metric.tuned, metric.untuned)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
