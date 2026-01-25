"use client";

import { useMemo } from "react";
import { RotateCcw, Columns2, Eye, EyeOff, CheckCircle2, Pencil } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects";
import { WeatherDataOverlay } from "./weather-data-overlay";
import { CONDITION_LABELS } from "../../weather-compositor/presets";
import type { FullCompositorParams } from "../../weather-compositor/presets";
import { ParameterPanel } from "./parameter-panel";
import { TIME_CHECKPOINT_ORDER, TIME_CHECKPOINTS } from "../lib/constants";
import type { ConditionCheckpoints, TimeCheckpoint } from "../types";

type LayerKey = "layers" | "celestial" | "cloud" | "rain" | "lightning" | "snow";

interface DetailEditorProps {
  condition: WeatherCondition;
  params: FullCompositorParams;
  baseParams: FullCompositorParams;
  checkpoints?: ConditionCheckpoints;
  activeEditCheckpoint: TimeCheckpoint;
  isPreviewing: boolean;
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
  onCopyLayer?: (sourceCondition: WeatherCondition, layerKey: LayerKey) => void;
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
      skyBrightness: params.celestial.skyBrightness,
      skySaturation: params.celestial.skySaturation,
      skyContrast: params.celestial.skyContrast,
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
  activeEditCheckpoint,
  isPreviewing,
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
  onCopyLayer,
}: DetailEditorProps) {
  const canvasProps = useMemo(() => mapParamsToCanvasProps(params), [params]);
  const label = CONDITION_LABELS[condition];

  const allCheckpointsReviewed = checkpoints
    ? TIME_CHECKPOINT_ORDER.every((cp) => checkpoints[cp] === "reviewed")
    : false;

  const reviewedCount = checkpoints
    ? TIME_CHECKPOINT_ORDER.filter((cp) => checkpoints[cp] === "reviewed").length
    : 0;

  return (
    <div className="flex h-full gap-5">
      <div className="flex w-[420px] shrink-0 flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-xl">
          <div className="absolute inset-0 bg-black">
            <WeatherEffectsCanvas className="absolute inset-0" {...canvasProps} />
          </div>

          {showWidgetOverlay && (
            <WeatherDataOverlay
              location="San Francisco, CA"
              condition={condition}
              temperature={72}
              tempHigh={78}
              tempLow={65}
              humidity={45}
              windSpeed={8}
              visibility={10}
              forecast={[
                { day: "Today", tempMin: 65, tempMax: 78, condition: condition },
                { day: "Tue", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
                { day: "Wed", tempMin: 62, tempMax: 75, condition: "cloudy" },
                { day: "Thu", tempMin: 60, tempMax: 73, condition: "rain" },
                { day: "Fri", tempMin: 63, tempMax: 76, condition: "clear" },
              ]}
              unit="fahrenheit"
              timeOfDay={params.celestial.timeOfDay}
            />
          )}

          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between">
            <button
              onClick={onToggleWidgetOverlay}
              className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            >
              {showWidgetOverlay ? (
                <EyeOff className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              {showWidgetOverlay ? "Hide" : "Show"}
            </button>

            <button
              onClick={onCompare}
              className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            >
              <Columns2 className="size-3" />
              Compare
            </button>
          </div>

          {!showWidgetOverlay && (
            <div className="absolute left-2.5 top-2.5 z-20">
              <div className="rounded bg-black/50 px-2 py-1 backdrop-blur-sm">
                <h2 className="text-xs font-medium text-white">{label}</h2>
              </div>
            </div>
          )}

          <div className="absolute right-2.5 top-2.5 z-20">
            {isPreviewing ? (
              <div className="flex items-center gap-1.5 rounded-md bg-amber-500/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
                <Eye className="size-3 text-white/90" />
                <span className="text-xs font-medium text-white">
                  Preview Mode
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-md bg-blue-600/90 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
                <Pencil className="size-3 text-white/90" />
                <span className="text-xs font-medium text-white">
                  Editing {TIME_CHECKPOINTS[activeEditCheckpoint].label}
                </span>
                <span className="text-sm">{TIME_CHECKPOINTS[activeEditCheckpoint].emoji}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border/40 bg-card/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Checkpoints
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/40">
              {reviewedCount}/4
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
              const { value, emoji, label } = TIME_CHECKPOINTS[checkpoint];
              const status = checkpoints?.[checkpoint] ?? "pending";
              const isActive = Math.abs(currentTime - value) < 0.02;
              const isReviewed = status === "reviewed";
              const isEditing = checkpoint === activeEditCheckpoint;

              return (
                <button
                  key={checkpoint}
                  onClick={() => onCheckpointClick(checkpoint)}
                  className={cn(
                    "group relative flex flex-col items-center gap-1 rounded-md border py-2 transition-all",
                    isEditing
                      ? "border-blue-500/50 bg-blue-500/15 ring-2 ring-blue-500/30"
                      : isActive
                        ? "border-foreground/20 bg-accent/80"
                        : isReviewed
                          ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                          : "border-border/30 bg-muted/20 hover:bg-accent/40"
                  )}
                  title={`${label} (${status})${isEditing ? " - editing" : ""}`}
                >
                  <span className="text-base">{emoji}</span>
                  <span
                    className={cn(
                      "text-[8px] font-medium uppercase tracking-wider",
                      isEditing
                        ? "text-blue-600 dark:text-blue-400"
                        : isActive
                          ? "text-foreground/70"
                          : isReviewed
                            ? "text-green-600/60 dark:text-green-400/60"
                            : "text-muted-foreground/40"
                    )}
                  >
                    {checkpoint}
                  </span>
                  {isEditing && (
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                      <span className="whitespace-nowrap rounded-full bg-blue-500 px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-sm">
                        EDITING
                      </span>
                    </div>
                  )}
                  {isReviewed && !isEditing && (
                    <div className="absolute right-1 top-1">
                      <CheckCircle2 className="size-2.5 text-green-600/50 dark:text-green-400/50" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/40 bg-card/30 px-3 py-1.5 text-xs text-muted-foreground/60 transition-all hover:bg-accent/50 hover:text-muted-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
          <button
            onClick={onSignOff}
            disabled={!allCheckpointsReviewed && !isSignedOff}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              isSignedOff
                ? "border border-green-500/20 bg-green-500/10 text-green-600/70 dark:text-green-400/70"
                : allCheckpointsReviewed
                  ? "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                  : "cursor-not-allowed bg-muted/20 text-muted-foreground/30"
            )}
            title={
              !allCheckpointsReviewed && !isSignedOff
                ? "Review all checkpoints first"
                : undefined
            }
          >
            {isSignedOff ? (
              <>
                <CheckCircle2 className="size-3" />
                Done
              </>
            ) : (
              "Sign Off"
            )}
          </button>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border border-border/40 bg-card/30">
        <div className="scrollbar-subtle h-full overflow-y-auto">
          <ParameterPanel
            params={params}
            baseParams={baseParams}
            onParamsChange={onParamsChange}
            expandedGroups={expandedGroups}
            onToggleGroup={onToggleGroup}
            activeEditCheckpoint={activeEditCheckpoint}
            isPreviewing={isPreviewing}
            currentCondition={condition}
            onCopyLayer={onCopyLayer}
          />
        </div>
      </div>
    </div>
  );
}
