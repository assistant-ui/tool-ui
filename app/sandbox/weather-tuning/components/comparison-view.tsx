"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects";
import { CONDITION_LABELS, WEATHER_CONDITIONS } from "../../weather-compositor/presets";
import type { FullCompositorParams } from "../../weather-compositor/presets";
import type { CompareMode } from "../types";

interface ComparisonViewProps {
  condition: WeatherCondition;
  params: FullCompositorParams;
  baseParams: FullCompositorParams;
  compareMode: CompareMode;
  compareTarget: WeatherCondition | null;
  compareTargetParams: FullCompositorParams | null;
  onClose: () => void;
  onToggleMode: () => void;
  onSelectCompareTarget: (target: WeatherCondition) => void;
}

function mapParamsToCanvasProps(params: FullCompositorParams) {
  return {
    layers: params.layers,
    celestial: {
      timeOfDay: params.celestial.timeOfDay,
      moonPhase: params.celestial.moonPhase,
      starDensity: params.celestial.starDensity,
      celestialX: params.celestial.celestialX,
      celestialY: params.celestial.celestialY,
      sunSize: params.celestial.sunSize,
      moonSize: params.celestial.moonSize,
      sunGlowIntensity: params.celestial.sunGlowIntensity,
      sunGlowSize: params.celestial.sunGlowSize,
      sunRayCount: params.celestial.sunRayCount,
      sunRayLength: params.celestial.sunRayLength,
      sunRayIntensity: params.celestial.sunRayIntensity,
      moonGlowIntensity: params.celestial.moonGlowIntensity,
      moonGlowSize: params.celestial.moonGlowSize,
    },
    cloud: {
      coverage: params.cloud.coverage,
      density: params.cloud.density,
      softness: params.cloud.softness,
      cloudScale: params.cloud.cloudScale,
      windSpeed: params.cloud.windSpeed,
      windAngle: params.cloud.windAngle,
      turbulence: params.cloud.turbulence,
      lightIntensity: params.cloud.lightIntensity,
      ambientDarkness: params.cloud.ambientDarkness,
      backlightIntensity: params.cloud.backlightIntensity,
      numLayers: params.cloud.numLayers,
    },
    rain: {
      glassIntensity: params.rain.glassIntensity,
      glassZoom: params.rain.zoom,
      fallingIntensity: params.rain.fallingIntensity,
      fallingSpeed: params.rain.fallingSpeed,
      fallingAngle: params.rain.fallingAngle,
      fallingStreakLength: params.rain.fallingStreakLength,
      fallingLayers: params.rain.fallingLayers,
    },
    lightning: {
      enabled: params.layers.lightning,
      autoMode: params.lightning.autoMode,
      autoInterval: params.lightning.autoInterval,
      flashIntensity: params.lightning.glowIntensity,
      branchDensity: params.lightning.branchDensity,
    },
    snow: {
      intensity: params.snow.intensity,
      layers: params.snow.layers,
      fallSpeed: params.snow.fallSpeed,
      windSpeed: params.snow.windSpeed,
      drift: params.snow.drift,
      flakeSize: params.snow.flakeSize,
    },
  };
}

export function ComparisonView({
  condition,
  params,
  baseParams,
  compareMode,
  compareTarget,
  compareTargetParams,
  onClose,
  onToggleMode,
  onSelectCompareTarget,
}: ComparisonViewProps) {
  const tunedCanvasProps = useMemo(() => mapParamsToCanvasProps(params), [params]);
  const baseCanvasProps = useMemo(() => mapParamsToCanvasProps(baseParams), [baseParams]);
  const targetCanvasProps = useMemo(
    () => (compareTargetParams ? mapParamsToCanvasProps(compareTargetParams) : null),
    [compareTargetParams]
  );

  const label = CONDITION_LABELS[condition];
  const targetLabel = compareTarget ? CONDITION_LABELS[compareTarget] : null;

  if (compareMode === "ab") {
    return (
      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-white">
              Compare: Base vs Tuned
            </h2>
            <span className="text-sm text-zinc-400">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleMode}>
              Switch to Side-by-Side
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 border-r border-zinc-700">
            <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
              Base
            </div>
            <div className="relative h-[300px] bg-black">
              <WeatherEffectsCanvas className="size-full" {...baseCanvasProps} />
            </div>
          </div>
          <div className="flex-1">
            <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
              Tuned
            </div>
            <div className="relative h-[300px] bg-black">
              <WeatherEffectsCanvas className="size-full" {...tunedCanvasProps} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (compareMode === "side-by-side") {
    const otherConditions = WEATHER_CONDITIONS.filter((c) => c !== condition);

    if (!compareTarget || !targetCanvasProps) {
      return (
        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
          <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-white">
                Compare Conditions
              </h2>
              <span className="text-sm text-zinc-400">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onToggleMode}>
                Switch to Base/Tuned
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1 border-r border-zinc-700">
              <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
                {label}
              </div>
              <div className="relative h-[300px] bg-black">
                <WeatherEffectsCanvas className="size-full" {...tunedCanvasProps} />
              </div>
            </div>
            <div className="flex-1">
              <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
                Select condition to compare
              </div>
              <div className="flex h-[300px] flex-col items-center justify-center bg-zinc-950 p-4">
                <p className="mb-4 text-sm text-zinc-500">
                  Choose a condition to compare with {label}
                </p>
                <div className="grid max-h-[200px] grid-cols-2 gap-2 overflow-y-auto">
                  {otherConditions.map((c) => (
                    <Button
                      key={c}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left"
                      onClick={() => onSelectCompareTarget(c)}
                    >
                      {CONDITION_LABELS[c]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-white">
              Compare: {label} vs {targetLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onToggleMode}>
              Switch to Base/Tuned
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 border-r border-zinc-700">
            <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
              {label}
            </div>
            <div className="relative h-[300px] bg-black">
              <WeatherEffectsCanvas className="size-full" {...tunedCanvasProps} />
            </div>
          </div>
          <div className="flex-1">
            <div className="border-b border-zinc-700 bg-zinc-800/50 px-4 py-2 text-center text-sm text-zinc-400">
              {targetLabel}
            </div>
            <div className="relative h-[300px] bg-black">
              <WeatherEffectsCanvas className="size-full" {...targetCanvasProps} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
