"use client";

import { useControls, Leva } from "leva";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CloudCanvas } from "@/app/sandbox/cloud-effect/cloud-canvas";
import { RainCanvas } from "@/app/sandbox/rain-effect/rain-canvas";
import { LightningCanvas } from "@/app/sandbox/lightning-effect/lightning-canvas";
import { SnowCanvas } from "@/app/sandbox/snow-effect/snow-canvas";
import { CelestialCanvas } from "@/components/tool-ui/weather-widget/effects/celestial-canvas";
import { Download, Upload, RotateCcw } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import {
  WEATHER_CONDITIONS,
  CONDITION_LABELS,
  getBaseParamsForCondition,
  mergeWithOverrides,
  extractOverrides,
  loadFromStorage,
  saveToStorage,
  exportToFile,
  importFromFile,
  type FullCompositorParams,
  type ConditionOverrides,
} from "./presets";

function formatTimeLabel(timeOfDay: number): string {
  const totalMinutes = timeOfDay * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

interface ConditionPillProps {
  condition: WeatherCondition;
  isActive: boolean;
  hasOverrides: boolean;
  onClick: () => void;
}

function ConditionPill({ condition, isActive, hasOverrides, onClick }: ConditionPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all
        ${isActive
          ? "bg-white/20 text-white ring-1 ring-white/30"
          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
        }
      `}
    >
      {CONDITION_LABELS[condition]}
      {hasOverrides && (
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-blue-400" />
      )}
    </button>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function WeatherCompositorSandbox() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeCondition, setActiveCondition] = useState<WeatherCondition>("clear");
  const [overrides, setOverrides] = useState<Partial<Record<WeatherCondition, ConditionOverrides>>>({});
  const isInitializing = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = loadFromStorage();
    if (stored) {
      setActiveCondition(stored.activeCondition);
      setOverrides(stored.overrides);
    }
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, []);

  const baseParams = useMemo(
    () => getBaseParamsForCondition(activeCondition),
    [activeCondition]
  );
  const currentOverrides = overrides[activeCondition];
  const mergedParams = useMemo(
    () => mergeWithOverrides(baseParams, currentOverrides),
    [baseParams, currentOverrides]
  );

  const [layers, setLayers] = useControls("Layers", () => ({
    celestial: { value: mergedParams.layers.celestial, label: "Celestial" },
    clouds: { value: mergedParams.layers.clouds, label: "Clouds" },
    rain: { value: mergedParams.layers.rain, label: "Rain" },
    lightning: { value: mergedParams.layers.lightning, label: "Lightning" },
    snow: { value: mergedParams.layers.snow, label: "Snow" },
  }), [activeCondition]);

  const [celestial, setCelestial] = useControls("Celestial", () => ({
    timeOfDay: { value: mergedParams.celestial.timeOfDay, min: 0, max: 1, step: 0.01, label: "Time (0=midnight)" },
    moonPhase: { value: mergedParams.celestial.moonPhase, min: 0, max: 1, step: 0.01, label: "Moon Phase" },
    starDensity: { value: mergedParams.celestial.starDensity, min: 0, max: 1, step: 0.05, label: "Star Density" },
    celestialX: { value: mergedParams.celestial.celestialX, min: 0, max: 1, step: 0.01, label: "Position X" },
    celestialY: { value: mergedParams.celestial.celestialY, min: 0, max: 1, step: 0.01, label: "Position Y" },
    sunSize: { value: mergedParams.celestial.sunSize, min: 0.02, max: 0.2, step: 0.005, label: "Sun Size" },
    moonSize: { value: mergedParams.celestial.moonSize, min: 0.02, max: 0.15, step: 0.005, label: "Moon Size" },
  }), [activeCondition]);

  const [cloud, setCloud] = useControls("Clouds", () => ({
    coverage: { value: mergedParams.cloud.coverage, min: 0, max: 1, step: 0.01, label: "Coverage" },
    density: { value: mergedParams.cloud.density, min: 0, max: 1, step: 0.01, label: "Density" },
    softness: { value: mergedParams.cloud.softness, min: 0, max: 1, step: 0.01, label: "Softness" },
    windSpeed: { value: mergedParams.cloud.windSpeed, min: 0, max: 2, step: 0.05, label: "Wind Speed" },
    turbulence: { value: mergedParams.cloud.turbulence, min: 0, max: 2, step: 0.05, label: "Turbulence" },
    numLayers: { value: mergedParams.cloud.numLayers, min: 1, max: 6, step: 1, label: "Layers" },
    ambientDarkness: { value: mergedParams.cloud.ambientDarkness, min: 0, max: 1, step: 0.05, label: "Darkness" },
  }), [activeCondition]);

  const [rain, setRain] = useControls("Rain", () => ({
    glassIntensity: { value: mergedParams.rain.glassIntensity, min: 0, max: 1, step: 0.05, label: "Glass Drops" },
    fallingIntensity: { value: mergedParams.rain.fallingIntensity, min: 0, max: 1, step: 0.05, label: "Falling Rain" },
    fallingAngle: { value: mergedParams.rain.fallingAngle, min: -0.5, max: 0.5, step: 0.02, label: "Angle" },
    fallingLayers: { value: mergedParams.rain.fallingLayers, min: 1, max: 5, step: 1, label: "Layers" },
  }), [activeCondition]);

  const [lightning, setLightning] = useControls("Lightning", () => ({
    autoMode: { value: mergedParams.lightning.autoMode, label: "Auto Trigger" },
    autoInterval: { value: mergedParams.lightning.autoInterval, min: 2, max: 15, step: 0.5, label: "Interval (s)" },
    sceneIllumination: { value: mergedParams.lightning.sceneIllumination, min: 0, max: 1, step: 0.05, label: "Scene Light" },
  }), [activeCondition]);

  const [snow, setSnow] = useControls("Snow", () => ({
    intensity: { value: mergedParams.snow.intensity, min: 0, max: 1, step: 0.05, label: "Intensity" },
    snowWindSpeed: { value: mergedParams.snow.snowWindSpeed, min: 0, max: 1, step: 0.05, label: "Wind Speed" },
    drift: { value: mergedParams.snow.drift, min: 0, max: 1, step: 0.05, label: "Drift" },
    snowLayers: { value: mergedParams.snow.snowLayers, min: 1, max: 6, step: 1, label: "Layers" },
  }), [activeCondition]);

  const currentParams: FullCompositorParams = {
    layers,
    celestial,
    cloud,
    rain,
    lightning,
    snow,
  };

  const debouncedParams = useDebounce(currentParams, 300);

  useEffect(() => {
    if (isInitializing.current || !isMounted) return;

    const newOverrides = extractOverrides(debouncedParams, baseParams);
    const hasChanges = Object.keys(newOverrides).length > 0;

    setOverrides(prev => {
      const updated = { ...prev };
      if (hasChanges) {
        updated[activeCondition] = newOverrides;
      } else {
        delete updated[activeCondition];
      }
      return updated;
    });
  }, [debouncedParams, activeCondition, baseParams, isMounted]);

  const stateToSave = useDebounce({ activeCondition, overrides }, 500);

  useEffect(() => {
    if (!isMounted || isInitializing.current) return;
    saveToStorage(stateToSave);
  }, [stateToSave, isMounted]);

  const handleConditionChange = useCallback((condition: WeatherCondition) => {
    setActiveCondition(condition);
    const newBase = getBaseParamsForCondition(condition);
    const existingOverrides = overrides[condition];
    const merged = mergeWithOverrides(newBase, existingOverrides);

    setLayers(merged.layers);
    setCelestial(merged.celestial);
    setCloud(merged.cloud);
    setRain(merged.rain);
    setLightning(merged.lightning);
    setSnow(merged.snow);
  }, [overrides, setLayers, setCelestial, setCloud, setRain, setLightning, setSnow]);

  const handleExport = useCallback(() => {
    exportToFile({ activeCondition, overrides });
  }, [activeCondition, overrides]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFromFile(file);
      setActiveCondition(imported.activeCondition);
      setOverrides(imported.overrides);
      handleConditionChange(imported.activeCondition);
    } catch (err) {
      console.error("Failed to import presets:", err);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleConditionChange]);

  const handleReset = useCallback(() => {
    setOverrides(prev => {
      const updated = { ...prev };
      delete updated[activeCondition];
      return updated;
    });
    const base = getBaseParamsForCondition(activeCondition);
    setLayers(base.layers);
    setCelestial(base.celestial);
    setCloud(base.cloud);
    setRain(base.rain);
    setLightning(base.lightning);
    setSnow(base.snow);
  }, [activeCondition, setLayers, setCelestial, setCloud, setRain, setLightning, setSnow]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Weather Compositor" }}
        theme={{
          sizes: {
            rootWidth: "280px",
            controlWidth: "140px",
          },
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        <div className="flex w-full max-w-[600px] flex-wrap items-center justify-center gap-2">
          {WEATHER_CONDITIONS.map((condition) => (
            <ConditionPill
              key={condition}
              condition={condition}
              isActive={condition === activeCondition}
              hasOverrides={overrides[condition] !== undefined}
              onClick={() => handleConditionChange(condition)}
            />
          ))}
          <div className="ml-2 flex items-center gap-1 border-l border-white/20 pl-2">
            <button
              onClick={handleExport}
              className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Export presets"
            >
              <Download className="size-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Import presets"
            >
              <Upload className="size-4" />
            </button>
            <button
              onClick={handleReset}
              className="rounded p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              title="Reset current condition to defaults"
            >
              <RotateCcw className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border border-white/10"
          style={{
            width: "400px",
            height: "280px",
          }}
        >
          {layers.celestial && (
            <CelestialCanvas
              className="absolute inset-0"
              timeOfDay={celestial.timeOfDay}
              moonPhase={celestial.moonPhase}
              starDensity={celestial.starDensity}
              celestialX={celestial.celestialX}
              celestialY={celestial.celestialY}
              sunSize={celestial.sunSize}
              moonSize={celestial.moonSize}
            />
          )}

          {layers.clouds && (
            <CloudCanvas
              className="absolute inset-0"
              coverage={cloud.coverage}
              density={cloud.density}
              softness={cloud.softness}
              windSpeed={cloud.windSpeed}
              turbulence={cloud.turbulence}
              numLayers={cloud.numLayers}
              sunAltitude={celestial.timeOfDay < 0.5 ? celestial.timeOfDay * 2 : 2 - celestial.timeOfDay * 2}
              ambientDarkness={cloud.ambientDarkness}
              starDensity={0}
              transparentBackground={true}
            />
          )}

          {layers.rain && (
            <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
              <RainCanvas
                className="absolute inset-0"
                glassIntensity={rain.glassIntensity}
                fallingIntensity={rain.fallingIntensity}
                fallingAngle={rain.fallingAngle}
                fallingLayers={rain.fallingLayers}
              />
            </div>
          )}

          {layers.lightning && (
            <div className="absolute inset-0" style={{ mixBlendMode: "screen" }}>
              <LightningCanvas
                className="absolute inset-0"
                autoMode={lightning.autoMode}
                autoInterval={lightning.autoInterval}
                sceneIllumination={lightning.sceneIllumination}
              />
            </div>
          )}

          {layers.snow && (
            <div className="absolute inset-0" style={{ mixBlendMode: "plus-lighter" }}>
              <SnowCanvas
                className="absolute inset-0"
                intensity={snow.intensity}
                windSpeed={snow.snowWindSpeed}
                drift={snow.drift}
                layers={snow.snowLayers}
              />
            </div>
          )}

          <div className="pointer-events-none absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white/80 backdrop-blur-sm">
            {formatTimeLabel(celestial.timeOfDay)}
          </div>
        </div>
      </div>
    </div>
  );
}
