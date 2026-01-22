"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Columns2, Eye, EyeOff } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import { CONDITION_LABELS } from "../../weather-compositor/presets";
import type { FullCompositorParams } from "../../weather-compositor/presets";
import { ParameterPanel } from "./parameter-panel";
import { CheckpointDots } from "./checkpoint-dots";
import { TIME_CHECKPOINT_ORDER, TIME_CHECKPOINTS } from "../lib/constants";
import type { ConditionCheckpoints, TimeCheckpoint } from "../types";

interface DetailEditorProps {
  condition: WeatherCondition;
  params: FullCompositorParams;
  baseParams: FullCompositorParams;
  checkpoints?: ConditionCheckpoints;
  isSignedOff: boolean;
  expandedGroups: Set<string>;
  currentTime: number;
  showWidgetOverlay: boolean;
  onParamsChange: (params: FullCompositorParams) => void;
  onToggleGroup: (group: string) => void;
  onReset: () => void;
  onSignOff: () => void;
  onCheckpointClick: (checkpoint: TimeCheckpoint) => void;
  onCompare: () => void;
  onToggleWidgetOverlay: () => void;
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

export function DetailEditor({
  condition,
  params,
  baseParams,
  checkpoints,
  isSignedOff,
  expandedGroups,
  currentTime,
  showWidgetOverlay,
  onParamsChange,
  onToggleGroup,
  onReset,
  onSignOff,
  onCheckpointClick,
  onCompare,
  onToggleWidgetOverlay,
}: DetailEditorProps) {
  const canvasProps = useMemo(() => mapParamsToCanvasProps(params), [params]);
  const label = CONDITION_LABELS[condition];

  const allCheckpointsReviewed = checkpoints
    ? TIME_CHECKPOINT_ORDER.every((cp) => checkpoints[cp] === "reviewed")
    : false;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900/50">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 px-4 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-white">{label}</h2>
          <CheckpointDots checkpoints={checkpoints} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCompare} className="gap-2">
            <Columns2 className="size-4" />
            Compare
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" />
            Reset
          </Button>
          <Button
            variant={isSignedOff ? "secondary" : "default"}
            size="sm"
            onClick={onSignOff}
            disabled={!allCheckpointsReviewed && !isSignedOff}
            title={
              !allCheckpointsReviewed && !isSignedOff
                ? "Review all time checkpoints first"
                : undefined
            }
          >
            {isSignedOff ? "Signed Off ✓" : "Sign Off"}
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-700 px-4 py-2">
        <span className="text-sm text-zinc-400">Checkpoints:</span>
        {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
          const { value, emoji, label } = TIME_CHECKPOINTS[checkpoint];
          const status = checkpoints?.[checkpoint] ?? "pending";
          const isActive = Math.abs(currentTime - value) < 0.02;

          return (
            <button
              key={checkpoint}
              onClick={() => onCheckpointClick(checkpoint)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-sm transition-colors ${
                isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : status === "reviewed"
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              }`}
              title={`${label} (${status})`}
            >
              <span>{emoji}</span>
              {status === "reviewed" && <span className="text-xs">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="relative shrink-0 border-r border-zinc-700 bg-black p-4">
          <div className="relative h-full w-[384px]">
            <WeatherEffectsCanvas className="absolute inset-0 rounded-xl" {...canvasProps} />
            {showWidgetOverlay && (
              <div className="relative z-10 h-full w-full [&_[data-slot=weather-widget]]:h-full [&_[data-slot=weather-widget]]:max-w-none [&_article]:h-full [&_[data-slot=card]]:h-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:shadow-none">
                <WeatherWidget
                  id="tuning-preview"
                  location="San Francisco, CA"
                  current={{
                    temp: 72,
                    tempMin: 65,
                    tempMax: 78,
                    condition: condition,
                  }}
                  forecast={[
                    { day: "Today", tempMin: 65, tempMax: 78, condition: condition },
                    { day: "Tue", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
                    { day: "Wed", tempMin: 62, tempMax: 75, condition: "cloudy" },
                    { day: "Thu", tempMin: 60, tempMax: 73, condition: "rain" },
                    { day: "Fri", tempMin: 63, tempMax: 76, condition: "clear" },
                  ]}
                  effects={{ enabled: false }}
                />
              </div>
            )}
          </div>
          <button
            onClick={onToggleWidgetOverlay}
            className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5 rounded bg-black/60 px-2 py-1 text-xs text-zinc-300 backdrop-blur transition-colors hover:bg-black/80"
          >
            {showWidgetOverlay ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {showWidgetOverlay ? "Hide" : "Show"} Widget
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ParameterPanel
            params={params}
            baseParams={baseParams}
            onParamsChange={onParamsChange}
            expandedGroups={expandedGroups}
            onToggleGroup={onToggleGroup}
          />
        </div>
      </div>
    </div>
  );
}
