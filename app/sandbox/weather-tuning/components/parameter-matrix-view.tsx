"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/ui/cn";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects/weather-effects-canvas";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WEATHER_CONDITIONS, CONDITION_LABELS } from "../../weather-compositor/presets";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";
import type { TimeCheckpoint } from "../types";
import type { TuningStateReturn, LayerKey } from "../hooks/use-tuning-state";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronRight, Copy, Layers, Clock, Globe } from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ParameterMatrixViewProps {
  tuningState: TuningStateReturn;
}

/** Layers that can contain tunable numeric parameters */
type TunableLayerKey = Exclude<LayerKey, "layers">;

interface ParameterDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

interface ParameterGroup {
  name: string;
  layer: TunableLayerKey;
  params: ParameterDef[];
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    name: "Sky",
    layer: "celestial",
    params: [
      { key: "celestialY", label: "Sun/Moon Height", min: 0, max: 1, step: 0.01 },
      { key: "celestialX", label: "Sun/Moon Position", min: 0, max: 1, step: 0.01 },
      { key: "skyBrightness", label: "Brightness", min: 0, max: 2, step: 0.01 },
      { key: "skySaturation", label: "Saturation", min: 0, max: 2, step: 0.01 },
      { key: "skyContrast", label: "Contrast", min: 0, max: 2, step: 0.01 },
      { key: "starDensity", label: "Star Density", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Clouds",
    layer: "cloud",
    params: [
      { key: "coverage", label: "Coverage", min: 0, max: 1, step: 0.01 },
      { key: "density", label: "Density", min: 0, max: 1, step: 0.01 },
      { key: "softness", label: "Softness", min: 0, max: 1, step: 0.01 },
      { key: "lightIntensity", label: "Light Intensity", min: 0, max: 2, step: 0.01 },
      { key: "ambientDarkness", label: "Ambient Darkness", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Rain",
    layer: "rain",
    params: [
      { key: "fallingIntensity", label: "Falling Intensity", min: 0, max: 1, step: 0.01 },
      { key: "fallingSpeed", label: "Falling Speed", min: 0.1, max: 3, step: 0.1 },
      { key: "glassIntensity", label: "Glass Droplets", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Snow",
    layer: "snow",
    params: [
      { key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
      { key: "fallSpeed", label: "Fall Speed", min: 0.1, max: 3, step: 0.1 },
      { key: "windSpeed", label: "Wind", min: 0, max: 2, step: 0.01 },
      { key: "drift", label: "Drift", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Lightning",
    layer: "lightning",
    params: [
      { key: "glowIntensity", label: "Flash Intensity", min: 0, max: 2, step: 0.01 },
      { key: "branchDensity", label: "Branch Density", min: 0, max: 1, step: 0.01 },
    ],
  },
];

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
  checkpoint: TimeCheckpoint
) {
  const getValue = useCallback(
    (condition: WeatherCondition): number | undefined => {
      const params = tuningState.getFullParamsForCheckpoint(condition, checkpoint);
      const layerParams = params[layer];
      if (!layerParams || typeof layerParams !== "object") return undefined;
      // Layer params are typed interfaces but we need dynamic key access
      const value = (layerParams as unknown as Record<string, unknown>)[paramKey];
      return typeof value === "number" ? value : undefined;
    },
    [tuningState, layer, paramKey, checkpoint]
  );

  const setValue = useCallback(
    (condition: WeatherCondition, value: number) => {
      tuningState.updateParameterAtCheckpoint(condition, checkpoint, layer, paramKey, value);
    },
    [tuningState, checkpoint, layer, paramKey]
  );

  const applyToAllConditions = useCallback(
    (sourceCondition: WeatherCondition) => {
      const value = getValue(sourceCondition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter(
        WEATHER_CONDITIONS.filter((c) => c !== sourceCondition),
        [checkpoint],
        layer,
        paramKey,
        value
      );
    },
    [getValue, tuningState, checkpoint, layer, paramKey]
  );

  const applyToAllCheckpoints = useCallback(
    (condition: WeatherCondition) => {
      const value = getValue(condition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter([condition], TIME_CHECKPOINT_ORDER, layer, paramKey, value);
    },
    [getValue, tuningState, layer, paramKey]
  );

  const applyEverywhere = useCallback(
    (sourceCondition: WeatherCondition) => {
      const value = getValue(sourceCondition);
      if (value === undefined) return;

      tuningState.bulkUpdateParameter(
        WEATHER_CONDITIONS,
        TIME_CHECKPOINT_ORDER,
        layer,
        paramKey,
        value
      );
    },
    [getValue, tuningState, layer, paramKey]
  );

  return { getValue, setValue, applyToAllConditions, applyToAllCheckpoints, applyEverywhere };
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
  condition: WeatherCondition;
  tuningState: TuningStateReturn;
  checkpoint: TimeCheckpoint;
}) {
  const params = useMemo(
    () => tuningState.getFullParamsForCheckpoint(condition, checkpoint),
    [condition, tuningState, checkpoint]
  );

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border/50 bg-black">
      <WeatherEffectsCanvas
        layers={params.layers}
        celestial={params.celestial}
        cloud={params.cloud}
        rain={params.rain}
        lightning={params.lightning}
        snow={params.snow}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <span className="text-[10px] font-medium text-white/80">
          {CONDITION_LABELS[condition]}
        </span>
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
          className="rounded p-1 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
          title="Apply value to..."
        >
          <Copy className="size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem onClick={onApplyToAllConditions} className="gap-2 text-xs">
          <Layers className="size-3.5" />
          All conditions
          <span className="ml-auto text-[10px] text-muted-foreground">this time</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onApplyToAllCheckpoints} className="gap-2 text-xs">
          <Clock className="size-3.5" />
          All times
          <span className="ml-auto text-[10px] text-muted-foreground">this condition</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onApplyEverywhere} className="gap-2 text-xs font-medium">
          <Globe className="size-3.5" />
          Everywhere
          <span className="ml-auto text-[10px] text-muted-foreground">all × all</span>
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
  condition: WeatherCondition;
  param: ParameterDef;
  layer: TunableLayerKey;
  tuningState: TuningStateReturn;
  checkpoint: TimeCheckpoint;
}) {
  const { getValue, setValue, applyToAllConditions, applyToAllCheckpoints, applyEverywhere } =
    useParameterAccessor(tuningState, layer, param.key, checkpoint);

  const value = getValue(condition);
  if (value === undefined) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="w-24 truncate text-[10px] text-muted-foreground">
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
      <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">
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
    <div className="border-b border-border/30">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/30"
      >
        <ChevronIcon className="size-3.5 text-muted-foreground" />
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
    <div className="sticky top-0 z-10 border-b border-border/50 bg-background p-3">
      <h2 className="text-sm font-medium">Parameters</h2>
      <p className="mt-1 text-[10px] text-muted-foreground">
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
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
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
    <div className="sticky top-[88px] z-[5] border-b border-t border-border/30 bg-muted/50 px-3 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {name}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export function ParameterMatrixView({ tuningState }: ParameterMatrixViewProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<TimeCheckpoint>("noon");

  return (
    <div className="flex h-full">
      {/* Left: Parameter list */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-border/50">
        <ParameterListHeader
          selectedCheckpoint={selectedCheckpoint}
          onSelectCheckpoint={setSelectedCheckpoint}
        />

        <div>
          {PARAMETER_GROUPS.map((group) => (
            <div key={group.name}>
              <GroupHeader name={group.name} />
              <div className="divide-y divide-border/30">
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
          <p className="mt-1 text-[10px] text-muted-foreground">
            All conditions at {TIME_CHECKPOINTS[selectedCheckpoint].label.toLowerCase()}
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
