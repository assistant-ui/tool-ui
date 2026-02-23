"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/ui/cn";
import {
  WeatherEffectsCanvas,
  getMaxConcurrentWeatherWebglCanvases,
  setMaxConcurrentWeatherWebglCanvases,
} from "@/lib/weather-authoring/weather-widget/effects/weather-effects-canvas";
import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import {
  WEATHER_CONDITIONS,
  CONDITION_LABELS,
} from "../../weather-compositor/presets";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";
import { mapCompositorParamsToCanvasProps } from "../lib/map-to-canvas-props";
import type { TimeCheckpoint } from "../types";
import type { TuningStateReturn } from "../hooks/use-tuning-state";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Clock,
  Globe,
} from "lucide-react";
import {
  PARAMETER_GROUPS,
  type ParameterDef,
  type TunableLayerKey,
} from "./parameter-definitions";
import {
  WeatherDataOverlay,
  createWeatherOverlayStubData,
} from "./weather-data-overlay";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ParameterMatrixViewProps {
  tuningState: TuningStateReturn;
}

// -----------------------------------------------------------------------------
// Hooks
// -----------------------------------------------------------------------------

/**
 * Hook for reading/writing a single parameter value across conditions.
 * Encapsulates the logic for getting values from merged params and bulk updates.
 */
function useParameterAccessor(
  tuningState: TuningStateReturn,
  layer: TunableLayerKey,
  paramKey: string,
  checkpoint: TimeCheckpoint,
) {
  const getValue = useCallback(
    (condition: WeatherConditionCode): number | undefined => {
      const params = tuningState.getFullParamsForCheckpoint(
        condition,
        checkpoint,
      );
      const layerParams = params[layer];
      if (!layerParams || typeof layerParams !== "object") return undefined;
      // Layer params are typed interfaces but we need dynamic key access
      const value = (layerParams as unknown as Record<string, unknown>)[
        paramKey
      ];
      return typeof value === "number" ? value : undefined;
    },
    [tuningState, layer, paramKey, checkpoint],
  );

  const setValue = useCallback(
    (condition: WeatherConditionCode, value: number) => {
      tuningState.updateParameterAtCheckpoint(
        condition,
        checkpoint,
        layer,
        paramKey,
        value,
      );
    },
    [tuningState, checkpoint, layer, paramKey],
  );

  const applyToAllConditions = useCallback(
    (sourceCondition: WeatherConditionCode) => {
      const value = getValue(sourceCondition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter(
        WEATHER_CONDITIONS.filter((c) => c !== sourceCondition),
        [checkpoint],
        layer,
        paramKey,
        value,
      );
    },
    [getValue, tuningState, checkpoint, layer, paramKey],
  );

  const applyToAllCheckpoints = useCallback(
    (condition: WeatherConditionCode) => {
      const value = getValue(condition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter(
        [condition],
        TIME_CHECKPOINT_ORDER,
        layer,
        paramKey,
        value,
      );
    },
    [getValue, tuningState, layer, paramKey],
  );

  const applyEverywhere = useCallback(
    (sourceCondition: WeatherConditionCode) => {
      const value = getValue(sourceCondition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter(
        WEATHER_CONDITIONS,
        TIME_CHECKPOINT_ORDER,
        layer,
        paramKey,
        value,
      );
    },
    [getValue, tuningState, layer, paramKey],
  );

  return {
    getValue,
    setValue,
    applyToAllConditions,
    applyToAllCheckpoints,
    applyEverywhere,
  };
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

/** Preview tile showing weather effects for a single condition */
function ConditionPreview({
  condition,
  tuningState,
  checkpoint,
}: {
  condition: WeatherConditionCode;
  tuningState: TuningStateReturn;
  checkpoint: TimeCheckpoint;
}) {
  const params = useMemo(
    () => tuningState.getFullParamsForCheckpoint(condition, checkpoint),
    [condition, tuningState, checkpoint],
  );
  const canvasProps = useMemo(
    () => mapCompositorParamsToCanvasProps(params),
    [params],
  );
  const overlayData = useMemo(
    () => createWeatherOverlayStubData(condition),
    [condition],
  );

  return (
    <div className="border-border/50 relative aspect-4/3 w-full overflow-hidden rounded-md border bg-black @container/weather [container-type:size]">
      <WeatherEffectsCanvas className="absolute inset-0" {...canvasProps} />
      <div className="absolute inset-0 z-10">
        <WeatherDataOverlay
          glassParams={params.glass}
          location={overlayData.location}
          conditionCode={condition}
          temperature={overlayData.temperature}
          tempHigh={overlayData.tempHigh}
          tempLow={overlayData.tempLow}
          forecast={overlayData.forecast}
          unit={overlayData.unit}
          timeOfDay={params.celestial.timeOfDay}
        />
      </div>
    </div>
  );
}

/** Dropdown menu for bulk-applying a parameter value */
function BulkApplyMenu({
  onApplyToAllConditions,
  onApplyToAllCheckpoints,
  onApplyEverywhere,
}: {
  onApplyToAllConditions: () => void;
  onApplyToAllCheckpoints: () => void;
  onApplyEverywhere: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground rounded p-1"
          title="Apply value to..."
        >
          <Copy className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem
          onClick={onApplyToAllConditions}
          className="gap-2 text-xs"
        >
          <Layers className="size-3.5" />
          All conditions
          <span className="text-muted-foreground ml-auto text-[10px]">
            this time
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onApplyToAllCheckpoints}
          className="gap-2 text-xs"
        >
          <Clock className="size-3.5" />
          All times
          <span className="text-muted-foreground ml-auto text-[10px]">
            this condition
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onApplyEverywhere}
          className="gap-2 text-xs font-medium"
        >
          <Globe className="size-3.5" />
          Everywhere
          <span className="text-muted-foreground ml-auto text-[10px]">
            all × all
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Single condition row with slider and bulk-apply menu */
function ConditionSlider({
  condition,
  param,
  layer,
  tuningState,
  checkpoint,
}: {
  condition: WeatherConditionCode;
  param: ParameterDef;
  layer: TunableLayerKey;
  tuningState: TuningStateReturn;
  checkpoint: TimeCheckpoint;
}) {
  const {
    getValue,
    setValue,
    applyToAllConditions,
    applyToAllCheckpoints,
    applyEverywhere,
  } = useParameterAccessor(tuningState, layer, param.key, checkpoint);

  const value = getValue(condition);
  if (value === undefined) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-24 truncate text-[10px]">
        {CONDITION_LABELS[condition]}
      </span>
      <Slider
        value={[value]}
        min={param.min}
        max={param.max}
        step={param.step}
        onValueChange={([v]) => setValue(condition, v)}
        className="flex-1"
      />
      <span className="text-muted-foreground w-12 text-right font-mono text-[10px]">
        {value.toFixed(2)}
      </span>
      <BulkApplyMenu
        onApplyToAllConditions={() => applyToAllConditions(condition)}
        onApplyToAllCheckpoints={() => applyToAllCheckpoints(condition)}
        onApplyEverywhere={() => applyEverywhere(condition)}
      />
    </div>
  );
}

/** Expandable row for a single parameter showing sliders for all conditions */
function ParameterRow({
  param,
  layer,
  tuningState,
  selectedCheckpoint,
}: {
  param: ParameterDef;
  layer: TunableLayerKey;
  tuningState: TuningStateReturn;
  selectedCheckpoint: TimeCheckpoint;
}) {
  const [expanded, setExpanded] = useState(false);

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div className="border-border/30 border-b">
      <button
        onClick={() => setExpanded(!expanded)}
        className="hover:bg-muted/30 flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <ChevronIcon className="text-muted-foreground size-3.5" />
        <span className="text-xs font-medium">{param.label}</span>
      </button>

      {expanded && (
        <div className="space-y-2 px-3 pb-3">
          {WEATHER_CONDITIONS.map((condition) => (
            <ConditionSlider
              key={condition}
              condition={condition}
              param={param}
              layer={layer}
              tuningState={tuningState}
              checkpoint={selectedCheckpoint}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Header with checkpoint selector tabs */
function ParameterListHeader({
  selectedCheckpoint,
  onSelectCheckpoint,
}: {
  selectedCheckpoint: TimeCheckpoint;
  onSelectCheckpoint: (checkpoint: TimeCheckpoint) => void;
}) {
  return (
    <div className="border-border/50 bg-background sticky top-0 z-10 border-b p-3">
      <h2 className="text-sm font-medium">Parameters</h2>
      <p className="text-muted-foreground mt-1 text-[10px]">
        Edit parameters across all conditions
      </p>

      <div className="mt-3 flex gap-1">
        {TIME_CHECKPOINT_ORDER.map((checkpoint) => (
          <button
            key={checkpoint}
            onClick={() => onSelectCheckpoint(checkpoint)}
            className={cn(
              "flex-1 rounded px-2 py-1.5 text-[10px] font-medium transition-all",
              selectedCheckpoint === checkpoint
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            {TIME_CHECKPOINTS[checkpoint].label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Sticky group header for parameter sections */
function GroupHeader({ name }: { name: string }) {
  return (
    <div className="border-border/30 bg-muted/50 sticky top-[88px] z-5 border-t border-b px-3 py-1.5">
      <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {name}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function ParameterMatrixView({ tuningState }: ParameterMatrixViewProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] =
    useState<TimeCheckpoint>("noon");

  // The Parameter view can render many previews at once; temporarily increase the
  // WebGL context budget so all tiles can initialize on capable machines.
  useEffect(() => {
    const prev = getMaxConcurrentWeatherWebglCanvases();
    setMaxConcurrentWeatherWebglCanvases(13);
    return () => setMaxConcurrentWeatherWebglCanvases(prev);
  }, []);

  return (
    <div className="flex h-full">
      {/* Left: Parameter list */}
      <div className="border-border/50 w-80 shrink-0 overflow-y-auto border-r">
        <ParameterListHeader
          selectedCheckpoint={selectedCheckpoint}
          onSelectCheckpoint={setSelectedCheckpoint}
        />

        <div>
          {PARAMETER_GROUPS.map((group) => (
            <div key={group.name}>
              <GroupHeader name={group.name} />
              <div className="divide-border/30 divide-y">
                {group.params.map((param) => (
                  <ParameterRow
                    key={`${group.layer}-${param.key}`}
                    param={param}
                    layer={group.layer}
                    tuningState={tuningState}
                    selectedCheckpoint={selectedCheckpoint}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Condition grid preview */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h2 className="text-sm font-medium">Preview Grid</h2>
          <p className="text-muted-foreground mt-1 text-[10px]">
            All conditions at{" "}
            {TIME_CHECKPOINTS[selectedCheckpoint].label.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {WEATHER_CONDITIONS.map((condition) => (
            <ConditionPreview
              key={condition}
              condition={condition}
              tuningState={tuningState}
              checkpoint={selectedCheckpoint}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
