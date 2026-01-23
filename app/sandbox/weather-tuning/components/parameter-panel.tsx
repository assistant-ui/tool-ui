"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/ui/cn";
import { Sun, Cloud, CloudRain, Zap, Snowflake } from "lucide-react";
import type { FullCompositorParams } from "../../weather-compositor/presets";
import { ParameterRow, ParameterToggleRow } from "./parameter-row";

interface ParameterPanelProps {
  params: FullCompositorParams;
  baseParams: FullCompositorParams;
  onParamsChange: (params: FullCompositorParams) => void;
  expandedGroups: Set<string>;
  onToggleGroup: (group: string) => void;
}

function countChanges<T extends object>(current: T, base: T): number {
  let count = 0;
  for (const key of Object.keys(current) as (keyof T)[]) {
    const currentVal = current[key];
    const baseVal = base[key];
    if (typeof currentVal === "number" && typeof baseVal === "number") {
      if (Math.abs(currentVal - baseVal) > 0.001) count++;
    } else if (currentVal !== baseVal) {
      count++;
    }
  }
  return count;
}

function DeltaBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[9px] text-amber-600/60 dark:text-amber-400/60">
      {count}
    </span>
  );
}

const LAYER_CONFIG = {
  celestial: { icon: Sun, label: "Celestial", color: "from-amber-500 to-orange-500" },
  clouds: { icon: Cloud, label: "Clouds", color: "from-slate-400 to-slate-500" },
  rain: { icon: CloudRain, label: "Rain", color: "from-blue-500 to-cyan-500" },
  lightning: { icon: Zap, label: "Lightning", color: "from-purple-500 to-indigo-500" },
  snow: { icon: Snowflake, label: "Snow", color: "from-slate-200 to-blue-300" },
} as const;

export function ParameterPanel({
  params,
  baseParams,
  onParamsChange,
  expandedGroups,
  onToggleGroup,
}: ParameterPanelProps) {
  const updateLayer = (key: keyof typeof params.layers, value: boolean) => {
    onParamsChange({
      ...params,
      layers: { ...params.layers, [key]: value },
    });
  };

  const updateCelestial = (
    key: keyof typeof params.celestial,
    value: number
  ) => {
    onParamsChange({
      ...params,
      celestial: { ...params.celestial, [key]: value },
    });
  };

  const updateCloud = (key: keyof typeof params.cloud, value: number) => {
    onParamsChange({
      ...params,
      cloud: { ...params.cloud, [key]: value },
    });
  };

  const updateRain = (key: keyof typeof params.rain, value: number) => {
    onParamsChange({
      ...params,
      rain: { ...params.rain, [key]: value },
    });
  };

  const updateLightning = (
    key: keyof typeof params.lightning,
    value: number | boolean
  ) => {
    onParamsChange({
      ...params,
      lightning: { ...params.lightning, [key]: value },
    });
  };

  const updateSnow = (key: keyof typeof params.snow, value: number) => {
    onParamsChange({
      ...params,
      snow: { ...params.snow, [key]: value },
    });
  };

  const expandedArray = Array.from(expandedGroups);

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-border/30 bg-card/80 px-3 py-2.5 backdrop-blur-xl">
        <div className="mb-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Layers
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(["celestial", "clouds", "rain", "lightning", "snow"] as const).map((layer) => {
            const config = LAYER_CONFIG[layer];
            const Icon = config.icon;
            const isEnabled = params.layers[layer];
            const baseEnabled = baseParams.layers[layer];
            const isChanged = isEnabled !== baseEnabled;

            return (
              <button
                key={layer}
                onClick={() => updateLayer(layer, !isEnabled)}
                className={cn(
                  "group flex items-center gap-1 rounded px-2 py-1 text-[10px] transition-all",
                  isEnabled
                    ? "bg-accent/60 text-foreground/80"
                    : "bg-muted/30 text-muted-foreground/50 hover:bg-muted/50 hover:text-muted-foreground",
                  isChanged && "ring-1 ring-amber-500/30"
                )}
              >
                <div
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded transition-all",
                    isEnabled
                      ? "bg-gradient-to-br " + config.color
                      : "bg-muted/50"
                  )}
                >
                  <Icon className={cn("size-2", isEnabled ? "text-white" : "text-muted-foreground/50")} />
                </div>
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <Accordion
        type="multiple"
        value={expandedArray}
        onValueChange={(value) => {
          const newExpanded = new Set(value);
          for (const group of expandedArray) {
            if (!newExpanded.has(group)) {
              onToggleGroup(group);
            }
          }
          for (const group of value) {
            if (!expandedGroups.has(group)) {
              onToggleGroup(group);
            }
          }
        }}
        className="flex-1 px-3 pb-3"
      >

      {params.layers.celestial && (
      <AccordionItem value="celestial" className="border-border/30">
        <AccordionTrigger className="py-2.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-amber-500 to-orange-500">
              <Sun className="size-3 text-white" />
            </div>
            <span>Celestial</span>
            <DeltaBadge
              count={countChanges(params.celestial, baseParams.celestial)}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <ParameterRow
              label="Time of Day"
              value={params.celestial.timeOfDay}
              baseValue={baseParams.celestial.timeOfDay}
              min={0}
              max={1}
              onChange={(v) => updateCelestial("timeOfDay", v)}
              onReset={() =>
                updateCelestial("timeOfDay", baseParams.celestial.timeOfDay)
              }
            />
            <ParameterRow
              label="Moon Phase"
              value={params.celestial.moonPhase}
              baseValue={baseParams.celestial.moonPhase}
              min={0}
              max={1}
              onChange={(v) => updateCelestial("moonPhase", v)}
              onReset={() =>
                updateCelestial("moonPhase", baseParams.celestial.moonPhase)
              }
            />
            <ParameterRow
              label="Star Density"
              value={params.celestial.starDensity}
              baseValue={baseParams.celestial.starDensity}
              min={0}
              max={2}
              onChange={(v) => updateCelestial("starDensity", v)}
              onReset={() =>
                updateCelestial("starDensity", baseParams.celestial.starDensity)
              }
            />
            <ParameterRow
              label="Celestial X"
              value={params.celestial.celestialX}
              baseValue={baseParams.celestial.celestialX}
              min={0}
              max={1}
              onChange={(v) => updateCelestial("celestialX", v)}
              onReset={() =>
                updateCelestial("celestialX", baseParams.celestial.celestialX)
              }
            />
            <ParameterRow
              label="Celestial Y"
              value={params.celestial.celestialY}
              baseValue={baseParams.celestial.celestialY}
              min={0}
              max={1}
              onChange={(v) => updateCelestial("celestialY", v)}
              onReset={() =>
                updateCelestial("celestialY", baseParams.celestial.celestialY)
              }
            />
            <ParameterRow
              label="Sun Size"
              value={params.celestial.sunSize}
              baseValue={baseParams.celestial.sunSize}
              min={0.01}
              max={0.8}
              onChange={(v) => updateCelestial("sunSize", v)}
              onReset={() =>
                updateCelestial("sunSize", baseParams.celestial.sunSize)
              }
            />
            <ParameterRow
              label="Moon Size"
              value={params.celestial.moonSize}
              baseValue={baseParams.celestial.moonSize}
              min={0.01}
              max={0.6}
              onChange={(v) => updateCelestial("moonSize", v)}
              onReset={() =>
                updateCelestial("moonSize", baseParams.celestial.moonSize)
              }
            />
            <ParameterRow
              label="Sun Glow Intensity"
              value={params.celestial.sunGlowIntensity}
              baseValue={baseParams.celestial.sunGlowIntensity}
              min={0}
              max={5}
              onChange={(v) => updateCelestial("sunGlowIntensity", v)}
              onReset={() =>
                updateCelestial(
                  "sunGlowIntensity",
                  baseParams.celestial.sunGlowIntensity
                )
              }
            />
            <ParameterRow
              label="Sun Glow Size"
              value={params.celestial.sunGlowSize}
              baseValue={baseParams.celestial.sunGlowSize}
              min={0.05}
              max={2}
              onChange={(v) => updateCelestial("sunGlowSize", v)}
              onReset={() =>
                updateCelestial("sunGlowSize", baseParams.celestial.sunGlowSize)
              }
            />
            <ParameterRow
              label="Sun Ray Count"
              value={params.celestial.sunRayCount}
              baseValue={baseParams.celestial.sunRayCount}
              min={0}
              max={48}
              step={1}
              onChange={(v) => updateCelestial("sunRayCount", v)}
              onReset={() =>
                updateCelestial("sunRayCount", baseParams.celestial.sunRayCount)
              }
            />
            <ParameterRow
              label="Sun Ray Length"
              value={params.celestial.sunRayLength}
              baseValue={baseParams.celestial.sunRayLength}
              min={0}
              max={3}
              onChange={(v) => updateCelestial("sunRayLength", v)}
              onReset={() =>
                updateCelestial("sunRayLength", baseParams.celestial.sunRayLength)
              }
            />
            <ParameterRow
              label="Sun Ray Intensity"
              value={params.celestial.sunRayIntensity}
              baseValue={baseParams.celestial.sunRayIntensity}
              min={0}
              max={3}
              onChange={(v) => updateCelestial("sunRayIntensity", v)}
              onReset={() =>
                updateCelestial(
                  "sunRayIntensity",
                  baseParams.celestial.sunRayIntensity
                )
              }
            />
            <ParameterRow
              label="Moon Glow Intensity"
              value={params.celestial.moonGlowIntensity}
              baseValue={baseParams.celestial.moonGlowIntensity}
              min={0}
              max={5}
              onChange={(v) => updateCelestial("moonGlowIntensity", v)}
              onReset={() =>
                updateCelestial(
                  "moonGlowIntensity",
                  baseParams.celestial.moonGlowIntensity
                )
              }
            />
            <ParameterRow
              label="Moon Glow Size"
              value={params.celestial.moonGlowSize}
              baseValue={baseParams.celestial.moonGlowSize}
              min={0.05}
              max={1.5}
              onChange={(v) => updateCelestial("moonGlowSize", v)}
              onReset={() =>
                updateCelestial("moonGlowSize", baseParams.celestial.moonGlowSize)
              }
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      )}

      {params.layers.clouds && (
      <AccordionItem value="cloud" className="border-border/30">
        <AccordionTrigger className="py-2.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-slate-400 to-slate-500">
              <Cloud className="size-3 text-white" />
            </div>
            <span>Clouds</span>
            <DeltaBadge count={countChanges(params.cloud, baseParams.cloud)} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <ParameterRow
              label="Coverage"
              value={params.cloud.coverage}
              baseValue={baseParams.cloud.coverage}
              min={0}
              max={1}
              onChange={(v) => updateCloud("coverage", v)}
              onReset={() => updateCloud("coverage", baseParams.cloud.coverage)}
            />
            <ParameterRow
              label="Density"
              value={params.cloud.density}
              baseValue={baseParams.cloud.density}
              min={0}
              max={1}
              onChange={(v) => updateCloud("density", v)}
              onReset={() => updateCloud("density", baseParams.cloud.density)}
            />
            <ParameterRow
              label="Softness"
              value={params.cloud.softness}
              baseValue={baseParams.cloud.softness}
              min={0}
              max={1}
              onChange={(v) => updateCloud("softness", v)}
              onReset={() => updateCloud("softness", baseParams.cloud.softness)}
            />
            <ParameterRow
              label="Cloud Scale"
              value={params.cloud.cloudScale}
              baseValue={baseParams.cloud.cloudScale}
              min={0.5}
              max={5}
              onChange={(v) => updateCloud("cloudScale", v)}
              onReset={() =>
                updateCloud("cloudScale", baseParams.cloud.cloudScale)
              }
            />
            <ParameterRow
              label="Wind Speed"
              value={params.cloud.windSpeed}
              baseValue={baseParams.cloud.windSpeed}
              min={0}
              max={2}
              onChange={(v) => updateCloud("windSpeed", v)}
              onReset={() => updateCloud("windSpeed", baseParams.cloud.windSpeed)}
            />
            <ParameterRow
              label="Wind Angle"
              value={params.cloud.windAngle}
              baseValue={baseParams.cloud.windAngle}
              min={-180}
              max={180}
              step={1}
              onChange={(v) => updateCloud("windAngle", v)}
              onReset={() => updateCloud("windAngle", baseParams.cloud.windAngle)}
            />
            <ParameterRow
              label="Turbulence"
              value={params.cloud.turbulence}
              baseValue={baseParams.cloud.turbulence}
              min={0}
              max={1}
              onChange={(v) => updateCloud("turbulence", v)}
              onReset={() =>
                updateCloud("turbulence", baseParams.cloud.turbulence)
              }
            />
            <ParameterRow
              label="Light Intensity"
              value={params.cloud.lightIntensity}
              baseValue={baseParams.cloud.lightIntensity}
              min={0}
              max={2}
              onChange={(v) => updateCloud("lightIntensity", v)}
              onReset={() =>
                updateCloud("lightIntensity", baseParams.cloud.lightIntensity)
              }
            />
            <ParameterRow
              label="Ambient Darkness"
              value={params.cloud.ambientDarkness}
              baseValue={baseParams.cloud.ambientDarkness}
              min={0}
              max={1}
              onChange={(v) => updateCloud("ambientDarkness", v)}
              onReset={() =>
                updateCloud("ambientDarkness", baseParams.cloud.ambientDarkness)
              }
            />
            <ParameterRow
              label="Backlight Intensity"
              value={params.cloud.backlightIntensity}
              baseValue={baseParams.cloud.backlightIntensity}
              min={0}
              max={2}
              onChange={(v) => updateCloud("backlightIntensity", v)}
              onReset={() =>
                updateCloud(
                  "backlightIntensity",
                  baseParams.cloud.backlightIntensity
                )
              }
            />
            <ParameterRow
              label="Num Layers"
              value={params.cloud.numLayers}
              baseValue={baseParams.cloud.numLayers}
              min={1}
              max={6}
              step={1}
              onChange={(v) => updateCloud("numLayers", v)}
              onReset={() => updateCloud("numLayers", baseParams.cloud.numLayers)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      )}

      {params.layers.rain && (
      <AccordionItem value="rain" className="border-border/30">
        <AccordionTrigger className="py-2.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-cyan-500">
              <CloudRain className="size-3 text-white" />
            </div>
            <span>Rain</span>
            <DeltaBadge count={countChanges(params.rain, baseParams.rain)} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <ParameterRow
              label="Glass Intensity"
              value={params.rain.glassIntensity}
              baseValue={baseParams.rain.glassIntensity}
              min={0}
              max={1}
              onChange={(v) => updateRain("glassIntensity", v)}
              onReset={() =>
                updateRain("glassIntensity", baseParams.rain.glassIntensity)
              }
            />
            <ParameterRow
              label="Zoom"
              value={params.rain.zoom}
              baseValue={baseParams.rain.zoom}
              min={0.5}
              max={2}
              onChange={(v) => updateRain("zoom", v)}
              onReset={() => updateRain("zoom", baseParams.rain.zoom)}
            />
            <ParameterRow
              label="Falling Intensity"
              value={params.rain.fallingIntensity}
              baseValue={baseParams.rain.fallingIntensity}
              min={0}
              max={1}
              onChange={(v) => updateRain("fallingIntensity", v)}
              onReset={() =>
                updateRain("fallingIntensity", baseParams.rain.fallingIntensity)
              }
            />
            <ParameterRow
              label="Falling Speed"
              value={params.rain.fallingSpeed}
              baseValue={baseParams.rain.fallingSpeed}
              min={0.1}
              max={3}
              onChange={(v) => updateRain("fallingSpeed", v)}
              onReset={() =>
                updateRain("fallingSpeed", baseParams.rain.fallingSpeed)
              }
            />
            <ParameterRow
              label="Falling Angle"
              value={params.rain.fallingAngle}
              baseValue={baseParams.rain.fallingAngle}
              min={-0.5}
              max={0.5}
              onChange={(v) => updateRain("fallingAngle", v)}
              onReset={() =>
                updateRain("fallingAngle", baseParams.rain.fallingAngle)
              }
            />
            <ParameterRow
              label="Streak Length"
              value={params.rain.fallingStreakLength}
              baseValue={baseParams.rain.fallingStreakLength}
              min={0.1}
              max={2}
              onChange={(v) => updateRain("fallingStreakLength", v)}
              onReset={() =>
                updateRain(
                  "fallingStreakLength",
                  baseParams.rain.fallingStreakLength
                )
              }
            />
            <ParameterRow
              label="Falling Layers"
              value={params.rain.fallingLayers}
              baseValue={baseParams.rain.fallingLayers}
              min={1}
              max={6}
              step={1}
              onChange={(v) => updateRain("fallingLayers", v)}
              onReset={() =>
                updateRain("fallingLayers", baseParams.rain.fallingLayers)
              }
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      )}

      {params.layers.lightning && (
      <AccordionItem value="lightning" className="border-border/30">
        <AccordionTrigger className="py-2.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-indigo-500">
              <Zap className="size-3 text-white" />
            </div>
            <span>Lightning</span>
            <DeltaBadge
              count={countChanges(params.lightning, baseParams.lightning)}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <ParameterToggleRow
              label="Auto Mode"
              value={params.lightning.autoMode}
              baseValue={baseParams.lightning.autoMode}
              onChange={(v) => updateLightning("autoMode", v)}
              onReset={() =>
                updateLightning("autoMode", baseParams.lightning.autoMode)
              }
            />
            <ParameterRow
              label="Auto Interval"
              value={params.lightning.autoInterval}
              baseValue={baseParams.lightning.autoInterval}
              min={1}
              max={30}
              step={0.5}
              onChange={(v) => updateLightning("autoInterval", v)}
              onReset={() =>
                updateLightning("autoInterval", baseParams.lightning.autoInterval)
              }
            />
            <ParameterRow
              label="Branch Density"
              value={params.lightning.branchDensity}
              baseValue={baseParams.lightning.branchDensity}
              min={0}
              max={1}
              onChange={(v) => updateLightning("branchDensity", v)}
              onReset={() =>
                updateLightning(
                  "branchDensity",
                  baseParams.lightning.branchDensity
                )
              }
            />
            <ParameterRow
              label="Glow Intensity"
              value={params.lightning.glowIntensity}
              baseValue={baseParams.lightning.glowIntensity}
              min={0}
              max={2}
              onChange={(v) => updateLightning("glowIntensity", v)}
              onReset={() =>
                updateLightning("glowIntensity", baseParams.lightning.glowIntensity)
              }
            />
            <ParameterRow
              label="Flash Duration"
              value={params.lightning.flashDuration}
              baseValue={baseParams.lightning.flashDuration}
              min={0.05}
              max={0.5}
              onChange={(v) => updateLightning("flashDuration", v)}
              onReset={() =>
                updateLightning("flashDuration", baseParams.lightning.flashDuration)
              }
            />
            <ParameterRow
              label="Scene Illumination"
              value={params.lightning.sceneIllumination}
              baseValue={baseParams.lightning.sceneIllumination}
              min={0}
              max={1}
              onChange={(v) => updateLightning("sceneIllumination", v)}
              onReset={() =>
                updateLightning(
                  "sceneIllumination",
                  baseParams.lightning.sceneIllumination
                )
              }
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      )}

      {params.layers.snow && (
      <AccordionItem value="snow" className="border-border/30">
        <AccordionTrigger className="py-2.5 text-xs text-muted-foreground hover:text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-gradient-to-br from-slate-200 to-blue-300">
              <Snowflake className="size-3 text-slate-700" />
            </div>
            <span>Snow</span>
            <DeltaBadge count={countChanges(params.snow, baseParams.snow)} />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-1">
            <ParameterRow
              label="Intensity"
              value={params.snow.intensity}
              baseValue={baseParams.snow.intensity}
              min={0}
              max={1}
              onChange={(v) => updateSnow("intensity", v)}
              onReset={() => updateSnow("intensity", baseParams.snow.intensity)}
            />
            <ParameterRow
              label="Layers"
              value={params.snow.layers}
              baseValue={baseParams.snow.layers}
              min={1}
              max={8}
              step={1}
              onChange={(v) => updateSnow("layers", v)}
              onReset={() => updateSnow("layers", baseParams.snow.layers)}
            />
            <ParameterRow
              label="Fall Speed"
              value={params.snow.fallSpeed}
              baseValue={baseParams.snow.fallSpeed}
              min={0.1}
              max={2}
              onChange={(v) => updateSnow("fallSpeed", v)}
              onReset={() => updateSnow("fallSpeed", baseParams.snow.fallSpeed)}
            />
            <ParameterRow
              label="Wind Speed"
              value={params.snow.windSpeed}
              baseValue={baseParams.snow.windSpeed}
              min={0}
              max={2}
              onChange={(v) => updateSnow("windSpeed", v)}
              onReset={() => updateSnow("windSpeed", baseParams.snow.windSpeed)}
            />
            <ParameterRow
              label="Drift"
              value={params.snow.drift}
              baseValue={baseParams.snow.drift}
              min={0}
              max={1}
              onChange={(v) => updateSnow("drift", v)}
              onReset={() => updateSnow("drift", baseParams.snow.drift)}
            />
            <ParameterRow
              label="Flake Size"
              value={params.snow.flakeSize}
              baseValue={baseParams.snow.flakeSize}
              min={0.5}
              max={3}
              onChange={(v) => updateSnow("flakeSize", v)}
              onReset={() => updateSnow("flakeSize", baseParams.snow.flakeSize)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      )}
      </Accordion>
    </div>
  );
}
