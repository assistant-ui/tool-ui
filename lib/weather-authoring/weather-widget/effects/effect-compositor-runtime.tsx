"use client";

import { useMemo, useState, useEffect } from "react";
import type { WeatherConditionCode } from "../schema";
import type { EffectSettings } from "./types";
import { WeatherEffectsCanvas } from "./weather-effects-canvas";
import type { WeatherEffectsCanvasProps } from "./weather-effects-types";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "./generated/tuned-presets.generated";
import { type WeatherEffectsTunedPresets } from "./tuning";
import { resolveWeatherEffectsCanvasRuntimeProps } from "./canvas-resolver-runtime";
import {
  resolveEffectCanvasDpr,
  resolveEffectQuality,
} from "./effect-compositor-quality";

const DEFAULT_TUNED_PRESETS: WeatherEffectsTunedPresets =
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES;

interface EffectCompositorRuntimeProps {
  conditionCode: WeatherConditionCode;
  windSpeed?: number;
  precipitationLevel?: "none" | "light" | "moderate" | "heavy";
  visibility?: number;
  timestamp?: string;
  timeOfDay?: number;
  settings?: EffectSettings;
  className?: string;
}

export function EffectCompositorRuntime({
  conditionCode,
  windSpeed,
  precipitationLevel,
  visibility,
  timestamp,
  timeOfDay,
  settings,
  className,
}: EffectCompositorRuntimeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const enabled = settings?.enabled !== false;
  const reducedMotion = settings?.reducedMotion ?? false;
  const resolvedQuality = useMemo(
    () => resolveEffectQuality(settings?.quality ?? "auto"),
    [settings?.quality],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dpr = useMemo(() => {
    return resolveEffectCanvasDpr(resolvedQuality);
  }, [resolvedQuality]);

  const canvasProps = useMemo<WeatherEffectsCanvasProps | null>(() => {
    if (!enabled || reducedMotion) return null;

    return resolveWeatherEffectsCanvasRuntimeProps({
      conditionCode,
      windSpeed,
      precipitationLevel,
      visibility,
      timestamp,
      timeOfDay,
      tunedPresets: DEFAULT_TUNED_PRESETS,
    });
  }, [
    enabled,
    reducedMotion,
    conditionCode,
    windSpeed,
    precipitationLevel,
    visibility,
    timestamp,
    timeOfDay,
  ]);

  if (!isMounted || !enabled || reducedMotion || !canvasProps) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
      aria-hidden="true"
    >
      <WeatherEffectsCanvas
        className="absolute inset-0"
        dpr={dpr}
        {...canvasProps}
      />
    </div>
  );
}
