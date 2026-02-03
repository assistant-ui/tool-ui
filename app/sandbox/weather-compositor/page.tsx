"use client";

import { useControls, Leva } from "leva";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { CloudCanvas } from "@/app/sandbox/cloud-effect/cloud-canvas";
import { RainCanvas } from "@/app/sandbox/rain-effect/rain-canvas";
import { LightningCanvas } from "@/app/sandbox/lightning-effect/lightning-canvas";
import { SnowCanvas } from "@/app/sandbox/snow-effect/snow-canvas";
import { CelestialCanvas } from "@/components/tool-ui/weather-widget/effects/celestial-canvas";
import {
  Download,
  Upload,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
} from "lucide-react";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects/weather-effects-canvas";
import type { WeatherEffectLayer } from "@/components/tool-ui/weather-widget/effects";
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
  type CheckpointOverrides,
  type GlobalSettings,
} from "./presets";
import {
  getInterpolatedOverrides,
  getNearestCheckpoint,
} from "./interpolation";
import { TIME_CHECKPOINTS } from "../weather-tuning/lib/constants";
import type { TimeCheckpoint } from "../weather-tuning/types";

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

function ConditionPill({
  condition,
  isActive,
  hasOverrides,
  onClick,
}: ConditionPillProps) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
        isActive
          ? "bg-white/20 text-white ring-1 ring-white/30"
          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
      } `}
    >
      {CONDITION_LABELS[condition]}
      {hasOverrides && (
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-blue-400" />
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

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  timeOfDay: 0.5,
};

function createEmptyCheckpointOverrides(): CheckpointOverrides {
  return { dawn: {}, noon: {}, dusk: {}, midnight: {} };
}

export default function WeatherCompositorSandbox() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeCondition, setActiveCondition] =
    useState<WeatherCondition>("clear");
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(
    DEFAULT_GLOBAL_SETTINGS,
  );
  const [checkpointOverrides, setCheckpointOverrides] = useState<
    Partial<Record<WeatherCondition, CheckpointOverrides>>
  >({});
  const [previewMode, setPreviewMode] = useState<
    "layers" | "widget" | "unified"
  >("layers");
  const isInitializing = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const stored = loadFromStorage();
    if (stored) {
      setActiveCondition(stored.activeCondition);
      setGlobalSettings(stored.globalSettings ?? DEFAULT_GLOBAL_SETTINGS);
      setCheckpointOverrides(stored.checkpointOverrides);
    }
    setTimeout(() => {
      isInitializing.current = false;
    }, 100);
  }, []);

  const getBaseForCheckpoint = useCallback(
    (checkpoint: TimeCheckpoint) => {
      const checkpointTime = TIME_CHECKPOINTS[checkpoint].value;
      return getBaseParamsForCondition(
        activeCondition,
        new Date(Date.now())
          .toISOString()
          .replace(
            /T\d{2}:\d{2}/,
            `T${String(Math.floor(checkpointTime * 24)).padStart(2, "0")}:${String(Math.floor(((checkpointTime * 24) % 1) * 60)).padStart(2, "0")}`,
          ),
      );
    },
    [activeCondition],
  );

  const baseParams = useMemo(
    () => getBaseParamsForCondition(activeCondition),
    [activeCondition],
  );
  const currentConditionCheckpoints = checkpointOverrides[activeCondition];
  const currentOverrides = useMemo(
    () =>
      getInterpolatedOverrides(
        currentConditionCheckpoints,
        globalSettings.timeOfDay,
        getBaseForCheckpoint,
      ),
    [
      currentConditionCheckpoints,
      globalSettings.timeOfDay,
      getBaseForCheckpoint,
    ],
  );
  const mergedParams = useMemo(
    () => mergeWithOverrides(baseParams, currentOverrides),
    [baseParams, currentOverrides],
  );

  // Global controls (not persisted per-condition)
  const [global, setGlobal] = useControls(
    "Global",
    () => ({
      timeOfDay: {
        value: globalSettings.timeOfDay,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Time of Day",
      },
    }),
    [],
  );

  // Sync global controls with state
  useEffect(() => {
    if (isInitializing.current) return;
    setGlobalSettings({ timeOfDay: global.timeOfDay });
  }, [global.timeOfDay]);

  const [layers, setLayers] = useControls(
    "Layers",
    () => ({
      celestial: { value: mergedParams.layers.celestial, label: "Celestial" },
      clouds: { value: mergedParams.layers.clouds, label: "Clouds" },
      rain: { value: mergedParams.layers.rain, label: "Rain" },
      lightning: { value: mergedParams.layers.lightning, label: "Lightning" },
      snow: { value: mergedParams.layers.snow, label: "Snow" },
    }),
    [activeCondition],
  );

  const enabledLayers = useMemo(
    () =>
      (Object.entries(layers) as Array<[WeatherEffectLayer, boolean]>)
        .filter(([, enabled]) => enabled)
        .map(([layer]) => layer),
    [layers],
  );

  const [celestial, setCelestial] = useControls(
    "Celestial",
    () => ({
      moonPhase: {
        value: mergedParams.celestial.moonPhase,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Moon Phase",
      },
      starDensity: {
        value: mergedParams.celestial.starDensity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Star Density",
      },
      celestialX: {
        value: mergedParams.celestial.celestialX,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Position X",
      },
      celestialY: {
        value: mergedParams.celestial.celestialY,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Position Y",
      },
      sunSize: {
        value: mergedParams.celestial.sunSize,
        min: 0.01,
        max: 0.8,
        step: 0.005,
        label: "Sun Size",
      },
      moonSize: {
        value: mergedParams.celestial.moonSize,
        min: 0.01,
        max: 0.6,
        step: 0.005,
        label: "Moon Size",
      },
      sunGlowIntensity: {
        value: mergedParams.celestial.sunGlowIntensity,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Sun Glow",
      },
      sunGlowSize: {
        value: mergedParams.celestial.sunGlowSize,
        min: 0.05,
        max: 2,
        step: 0.05,
        label: "Sun Glow Size",
      },
      sunRayCount: {
        value: mergedParams.celestial.sunRayCount,
        min: 0,
        max: 48,
        step: 1,
        label: "Sun Ray Count",
      },
      sunRayLength: {
        value: mergedParams.celestial.sunRayLength,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Sun Ray Length",
      },
      sunRayIntensity: {
        value: mergedParams.celestial.sunRayIntensity,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Sun Ray Intensity",
      },
      sunRayShimmer: {
        value: mergedParams.celestial.sunRayShimmer,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Sun Ray Shimmer",
      },
      sunRayShimmerSpeed: {
        value: mergedParams.celestial.sunRayShimmerSpeed,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Sun Ray Shimmer Speed",
      },
      moonGlowIntensity: {
        value: mergedParams.celestial.moonGlowIntensity,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Moon Glow",
      },
      moonGlowSize: {
        value: mergedParams.celestial.moonGlowSize,
        min: 0.05,
        max: 1.5,
        step: 0.02,
        label: "Moon Glow Size",
      },
      skyBrightness: {
        value: mergedParams.celestial.skyBrightness,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Sky Brightness",
      },
      skySaturation: {
        value: mergedParams.celestial.skySaturation,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Sky Saturation",
      },
      skyContrast: {
        value: mergedParams.celestial.skyContrast,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Sky Contrast",
      },
    }),
    [activeCondition],
  );

  const [cloud, setCloud] = useControls(
    "Clouds",
    () => ({
      cloudScale: {
        value: mergedParams.cloud.cloudScale,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: "Scale",
      },
      coverage: {
        value: mergedParams.cloud.coverage,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Coverage",
      },
      density: {
        value: mergedParams.cloud.density,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Density",
      },
      softness: {
        value: mergedParams.cloud.softness,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Softness",
      },
      windSpeed: {
        value: mergedParams.cloud.windSpeed,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Wind Speed",
      },
      windAngle: {
        value: mergedParams.cloud.windAngle,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Wind Angle",
      },
      turbulence: {
        value: mergedParams.cloud.turbulence,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Turbulence",
      },
      lightIntensity: {
        value: mergedParams.cloud.lightIntensity,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Light Intensity",
      },
      ambientDarkness: {
        value: mergedParams.cloud.ambientDarkness,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Darkness",
      },
      backlightIntensity: {
        value: mergedParams.cloud.backlightIntensity ?? 0.5,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Backlight",
      },
      numLayers: {
        value: mergedParams.cloud.numLayers,
        min: 1,
        max: 10,
        step: 1,
        label: "Layers",
      },
      // Legacy params for original CloudCanvas only:
      sunAzimuth: {
        value: mergedParams.cloud.sunAzimuth,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Sun Azimuth (legacy)",
      },
      layerSpread: {
        value: mergedParams.cloud.layerSpread,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Layer Spread (legacy)",
      },
      starSize: {
        value: mergedParams.cloud.starSize,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: "Star Size (legacy)",
      },
      starTwinkleSpeed: {
        value: mergedParams.cloud.starTwinkleSpeed,
        min: 0,
        max: 10,
        step: 0.1,
        label: "Twinkle Speed (legacy)",
      },
      starTwinkleAmount: {
        value: mergedParams.cloud.starTwinkleAmount,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Twinkle Amount (legacy)",
      },
      horizonLine: {
        value: mergedParams.cloud.horizonLine,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Horizon (legacy)",
      },
    }),
    [activeCondition],
  );

  const [rain, setRain] = useControls(
    "Rain",
    () => ({
      glassIntensity: {
        value: mergedParams.rain.glassIntensity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Glass Drops",
      },
      zoom: {
        value: mergedParams.rain.zoom,
        min: 0.1,
        max: 5,
        step: 0.05,
        label: "Zoom",
      },
      fallingIntensity: {
        value: mergedParams.rain.fallingIntensity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Falling Rain",
      },
      fallingSpeed: {
        value: mergedParams.rain.fallingSpeed,
        min: 0.05,
        max: 10,
        step: 0.1,
        label: "Fall Speed",
      },
      fallingAngle: {
        value: mergedParams.rain.fallingAngle,
        min: -1.5,
        max: 1.5,
        step: 0.02,
        label: "Angle",
      },
      fallingStreakLength: {
        value: mergedParams.rain.fallingStreakLength,
        min: 0.1,
        max: 5,
        step: 0.05,
        label: "Streak Length",
      },
      fallingLayers: {
        value: mergedParams.rain.fallingLayers,
        min: 1,
        max: 10,
        step: 1,
        label: "Layers",
      },
      fallingRefraction: {
        value: mergedParams.rain.fallingRefraction,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Refraction",
      },
      fallingWaviness: {
        value: mergedParams.rain.fallingWaviness,
        min: 0,
        max: 2,
        step: 0.02,
        label: "Waviness",
      },
      fallingThicknessVar: {
        value: mergedParams.rain.fallingThicknessVar,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Thickness Var",
      },
    }),
    [activeCondition],
  );

  const [lightning, setLightning] = useControls(
    "Lightning",
    () => ({
      branchDensity: {
        value: mergedParams.lightning.branchDensity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Branch Density",
      },
      displacement: {
        value: mergedParams.lightning.displacement,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Displacement",
      },
      glowIntensity: {
        value: mergedParams.lightning.glowIntensity,
        min: 0,
        max: 5,
        step: 0.05,
        label: "Glow Intensity",
      },
      flashDuration: {
        value: mergedParams.lightning.flashDuration,
        min: 0.01,
        max: 2,
        step: 0.01,
        label: "Flash Duration",
      },
      sceneIllumination: {
        value: mergedParams.lightning.sceneIllumination,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Scene Light",
      },
      afterglowPersistence: {
        value: mergedParams.lightning.afterglowPersistence,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Afterglow",
      },
      autoMode: {
        value: mergedParams.lightning.autoMode,
        label: "Auto Trigger",
      },
      autoInterval: {
        value: mergedParams.lightning.autoInterval,
        min: 0.5,
        max: 60,
        step: 0.5,
        label: "Interval (s)",
      },
    }),
    [activeCondition],
  );

  const [snow, setSnow] = useControls(
    "Snow",
    () => ({
      intensity: {
        value: mergedParams.snow.intensity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Intensity",
      },
      layers: {
        value: mergedParams.snow.layers,
        min: 1,
        max: 12,
        step: 1,
        label: "Layers",
      },
      fallSpeed: {
        value: mergedParams.snow.fallSpeed,
        min: 0.01,
        max: 5,
        step: 0.05,
        label: "Fall Speed",
      },
      windSpeed: {
        value: mergedParams.snow.windSpeed,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Wind Speed",
      },
      windAngle: {
        value: mergedParams.snow.windAngle,
        min: -Math.PI,
        max: Math.PI,
        step: 0.1,
        label: "Wind Angle",
      },
      turbulence: {
        value: mergedParams.snow.turbulence,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Turbulence",
      },
      drift: {
        value: mergedParams.snow.drift,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Drift",
      },
      flutter: {
        value: mergedParams.snow.flutter,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Flutter",
      },
      windShear: {
        value: mergedParams.snow.windShear,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Wind Shear",
      },
      flakeSize: {
        value: mergedParams.snow.flakeSize,
        min: 0.1,
        max: 5,
        step: 0.05,
        label: "Flake Size",
      },
      sizeVariation: {
        value: mergedParams.snow.sizeVariation,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Size Variation",
      },
      opacity: {
        value: mergedParams.snow.opacity,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Opacity",
      },
      glowAmount: {
        value: mergedParams.snow.glowAmount,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Glow",
      },
      sparkle: {
        value: mergedParams.snow.sparkle,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Sparkle",
      },
      visibility: {
        value: mergedParams.snow.visibility,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Visibility",
      },
    }),
    [activeCondition],
  );

  const [interactions] = useControls(
    "Interactions (Unified)",
    () => ({
      rainRefractionStrength: {
        value: 1.0,
        min: 0,
        max: 3,
        step: 0.05,
        label: "Rain Refraction",
      },
      lightningSceneIllumination: {
        value: 0.6,
        min: 0,
        max: 2,
        step: 0.05,
        label: "Lightning Illumination",
      },
    }),
    [],
  );

  const [_glassPanel] = useControls(
    "Glass Panel (Unified)",
    () => ({
      enabled: { value: true, label: "Enabled" },
      regionX: { value: 0.05, min: 0, max: 1, step: 0.01, label: "Region X" },
      regionY: { value: 0.65, min: 0, max: 1, step: 0.01, label: "Region Y" },
      regionW: {
        value: 0.9,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Region Width",
      },
      regionH: {
        value: 0.25,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Region Height",
      },
      refractionScale: {
        value: 30,
        min: 10,
        max: 80,
        step: 1,
        label: "Refraction Scale",
      },
      edgeWidth: {
        value: 0.15,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: "Edge Width",
      },
      chromaticAberration: {
        value: 1.2,
        min: 1.0,
        max: 2.0,
        step: 0.05,
        label: "Chromatic Aberration",
      },
      specularIntensity: {
        value: 1.5,
        min: 0,
        max: 3,
        step: 0.1,
        label: "Specular Intensity",
      },
      lightAngle: {
        value: 225,
        min: 0,
        max: 360,
        step: 5,
        label: "Light Angle (°)",
      },
    }),
    [],
  );

  // Combine Leva values with global timeOfDay for full params
  const currentParams: FullCompositorParams = {
    layers,
    celestial: { ...celestial, timeOfDay: global.timeOfDay },
    cloud,
    rain,
    lightning,
    snow,
  };

  const debouncedParams = useDebounce(currentParams, 300);
  const debouncedCondition = useDebounce(activeCondition, 300);

  useEffect(() => {
    if (isInitializing.current || !isMounted) return;

    // Guard against race condition: only save if the debounced condition
    // matches the current active condition. This prevents params from
    // condition A being saved to condition B when switching quickly.
    if (debouncedCondition !== activeCondition) return;

    // Use checkpoint-specific base for extracting overrides to ensure
    // we compute deltas against the correct defaults
    const activeCheckpoint = getNearestCheckpoint(globalSettings.timeOfDay);
    const checkpointBase = getBaseForCheckpoint(activeCheckpoint);
    const newOverrides = extractOverrides(debouncedParams, checkpointBase);
    const hasChanges = Object.keys(newOverrides).length > 0;

    setCheckpointOverrides((prev) => {
      const existing =
        prev[debouncedCondition] ?? createEmptyCheckpointOverrides();
      if (hasChanges) {
        return {
          ...prev,
          [debouncedCondition]: {
            ...existing,
            [activeCheckpoint]: newOverrides,
          },
        };
      } else {
        const updated = {
          ...existing,
          [activeCheckpoint]: {},
        };
        const allEmpty = Object.values(updated).every(
          (o) => Object.keys(o).length === 0,
        );
        if (allEmpty) {
          const next = { ...prev };
          delete next[debouncedCondition];
          return next;
        }
        return { ...prev, [debouncedCondition]: updated };
      }
    });
  }, [
    debouncedParams,
    debouncedCondition,
    activeCondition,
    getBaseForCheckpoint,
    isMounted,
    globalSettings.timeOfDay,
  ]);

  const stateToSave = useDebounce(
    { activeCondition, globalSettings, checkpointOverrides },
    500,
  );

  useEffect(() => {
    if (!isMounted || isInitializing.current) return;
    saveToStorage({ version: 2, ...stateToSave });
  }, [stateToSave, isMounted]);

  const handleConditionChange = useCallback(
    (condition: WeatherCondition) => {
      setActiveCondition(condition);
      const newBase = getBaseParamsForCondition(condition);
      const existingCheckpoints = checkpointOverrides[condition];
      const getBaseForNewCondition = (checkpoint: TimeCheckpoint) => {
        const checkpointTime = TIME_CHECKPOINTS[checkpoint].value;
        return getBaseParamsForCondition(
          condition,
          new Date(Date.now())
            .toISOString()
            .replace(
              /T\d{2}:\d{2}/,
              `T${String(Math.floor(checkpointTime * 24)).padStart(2, "0")}:${String(Math.floor(((checkpointTime * 24) % 1) * 60)).padStart(2, "0")}`,
            ),
        );
      };
      const interpolatedOverrides = getInterpolatedOverrides(
        existingCheckpoints,
        globalSettings.timeOfDay,
        getBaseForNewCondition,
      );
      const merged = mergeWithOverrides(newBase, interpolatedOverrides);

      setLayers(merged.layers);
      setCelestial({
        moonPhase: merged.celestial.moonPhase,
        starDensity: merged.celestial.starDensity,
        celestialX: merged.celestial.celestialX,
        celestialY: merged.celestial.celestialY,
        sunSize: merged.celestial.sunSize,
        moonSize: merged.celestial.moonSize,
        sunGlowIntensity: merged.celestial.sunGlowIntensity,
        sunGlowSize: merged.celestial.sunGlowSize,
        sunRayCount: merged.celestial.sunRayCount,
        sunRayLength: merged.celestial.sunRayLength,
        sunRayIntensity: merged.celestial.sunRayIntensity,
        sunRayShimmer: merged.celestial.sunRayShimmer,
        sunRayShimmerSpeed: merged.celestial.sunRayShimmerSpeed,
        moonGlowIntensity: merged.celestial.moonGlowIntensity,
        moonGlowSize: merged.celestial.moonGlowSize,
      });
      setCloud(merged.cloud);
      setRain(merged.rain);
      setLightning(merged.lightning);
      setSnow(merged.snow);
    },
    [
      checkpointOverrides,
      globalSettings.timeOfDay,
      setLayers,
      setCelestial,
      setCloud,
      setRain,
      setLightning,
      setSnow,
    ],
  );

  const handleExport = useCallback(() => {
    exportToFile({
      version: 2,
      activeCondition,
      globalSettings,
      checkpointOverrides,
    });
  }, [activeCondition, globalSettings, checkpointOverrides]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const imported = await importFromFile(file);
        setActiveCondition(imported.activeCondition);
        setGlobalSettings(imported.globalSettings ?? DEFAULT_GLOBAL_SETTINGS);
        setCheckpointOverrides(imported.checkpointOverrides);
        setGlobal({ timeOfDay: imported.globalSettings?.timeOfDay ?? 0.5 });
        handleConditionChange(imported.activeCondition);
      } catch (err) {
        console.error("Failed to import presets:", err);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleConditionChange, setGlobal],
  );

  const handleReset = useCallback(() => {
    setCheckpointOverrides((prev) => {
      const updated = { ...prev };
      delete updated[activeCondition];
      return updated;
    });
    const base = getBaseParamsForCondition(activeCondition);
    setLayers(base.layers);
    setCelestial({
      moonPhase: base.celestial.moonPhase,
      starDensity: base.celestial.starDensity,
      celestialX: base.celestial.celestialX,
      celestialY: base.celestial.celestialY,
      sunSize: base.celestial.sunSize,
      moonSize: base.celestial.moonSize,
      sunGlowIntensity: base.celestial.sunGlowIntensity,
      sunGlowSize: base.celestial.sunGlowSize,
      sunRayCount: base.celestial.sunRayCount,
      sunRayLength: base.celestial.sunRayLength,
      sunRayIntensity: base.celestial.sunRayIntensity,
      sunRayShimmer: base.celestial.sunRayShimmer,
      sunRayShimmerSpeed: base.celestial.sunRayShimmerSpeed,
      moonGlowIntensity: base.celestial.moonGlowIntensity,
      moonGlowSize: base.celestial.moonGlowSize,
    });
    setCloud(base.cloud);
    setRain(base.rain);
    setLightning(base.lightning);
    setSnow(base.snow);
  }, [
    activeCondition,
    setLayers,
    setCelestial,
    setCloud,
    setRain,
    setLightning,
    setSnow,
  ]);

  if (!isMounted) {
    return null;
  }

  const timeOfDay = global.timeOfDay;

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
              hasOverrides={checkpointOverrides[condition] !== undefined}
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
            <button
              onClick={() => setPreviewMode("layers")}
              className={`rounded p-1.5 transition-colors ${
                previewMode === "layers"
                  ? "bg-blue-500/30 text-blue-300"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title="Show separate effect layers"
            >
              <Layers className="size-4" />
            </button>
            <button
              onClick={() => setPreviewMode("widget")}
              className={`rounded p-1.5 transition-colors ${
                previewMode === "widget"
                  ? "bg-blue-500/30 text-blue-300"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title="Show widget with old compositor"
            >
              <Eye className="size-4" />
            </button>
            <button
              onClick={() => setPreviewMode("unified")}
              className={`rounded p-1.5 transition-colors ${
                previewMode === "unified"
                  ? "bg-purple-500/30 text-purple-300"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
              title="Show unified canvas (new!)"
            >
              <Sparkles className="size-4" />
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
            width: previewMode !== "layers" ? "480px" : "400px",
            height: previewMode !== "layers" ? "340px" : "280px",
          }}
        >
          {previewMode === "unified" ? (
            <div className="relative h-full w-full">
              <WeatherEffectsCanvas
                className="absolute inset-0"
                layers={{
                  celestial: layers.celestial,
                  clouds: layers.clouds,
                  rain: layers.rain,
                  lightning: layers.lightning,
                  snow: layers.snow,
                }}
                celestial={{
                  timeOfDay,
                  moonPhase: celestial.moonPhase,
                  starDensity: celestial.starDensity,
                  celestialX: celestial.celestialX,
                  celestialY: celestial.celestialY,
                  sunSize: celestial.sunSize,
                  moonSize: celestial.moonSize,
                  sunGlowIntensity: celestial.sunGlowIntensity,
                  sunGlowSize: celestial.sunGlowSize,
                  sunRayCount: celestial.sunRayCount,
                  sunRayLength: celestial.sunRayLength,
                  sunRayIntensity: celestial.sunRayIntensity,
                  sunRayShimmer: celestial.sunRayShimmer,
                  sunRayShimmerSpeed: celestial.sunRayShimmerSpeed,
                  moonGlowIntensity: celestial.moonGlowIntensity,
                  moonGlowSize: celestial.moonGlowSize,
                }}
                cloud={{
                  coverage: cloud.coverage,
                  density: cloud.density,
                  softness: cloud.softness,
                  cloudScale: cloud.cloudScale,
                  windSpeed: cloud.windSpeed,
                  windAngle: cloud.windAngle,
                  turbulence: cloud.turbulence,
                  lightIntensity: cloud.lightIntensity,
                  ambientDarkness: cloud.ambientDarkness,
                  backlightIntensity: cloud.backlightIntensity,
                  numLayers: cloud.numLayers,
                }}
                rain={{
                  glassIntensity: rain.glassIntensity,
                  glassZoom: rain.zoom,
                  fallingIntensity: rain.fallingIntensity,
                  fallingSpeed: rain.fallingSpeed,
                  fallingAngle: rain.fallingAngle,
                  fallingStreakLength: rain.fallingStreakLength,
                  fallingLayers: rain.fallingLayers,
                }}
                lightning={{
                  enabled: true,
                  autoMode: lightning.autoMode,
                  autoInterval: lightning.autoInterval,
                  flashIntensity: lightning.glowIntensity,
                  branchDensity: lightning.branchDensity,
                }}
                snow={{
                  intensity: snow.intensity,
                  layers: snow.layers,
                  fallSpeed: snow.fallSpeed,
                  windSpeed: snow.windSpeed,
                  drift: snow.drift,
                  flakeSize: snow.flakeSize,
                }}
                interactions={{
                  rainRefractionStrength: interactions.rainRefractionStrength,
                  lightningSceneIllumination:
                    interactions.lightningSceneIllumination,
                }}
              />
              <div className="relative z-10 h-full w-full [&_[data-slot=card]]:h-full [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:shadow-none [&_[data-slot=weather-widget]]:h-full [&_[data-slot=weather-widget]]:max-w-none [&_article]:h-full">
                <WeatherWidget
                  id="unified-preview"
                  location="San Francisco, CA"
                  current={{
                    temp: 72,
                    tempMin: 65,
                    tempMax: 78,
                    condition: activeCondition,
                  }}
                  forecast={[
                    {
                      day: "Today",
                      tempMin: 65,
                      tempMax: 78,
                      condition: activeCondition,
                    },
                    {
                      day: "Tue",
                      tempMin: 64,
                      tempMax: 77,
                      condition: "partly-cloudy",
                    },
                    {
                      day: "Wed",
                      tempMin: 61,
                      tempMax: 73,
                      condition: "cloudy",
                    },
                    { day: "Thu", tempMin: 58, tempMax: 68, condition: "rain" },
                    {
                      day: "Fri",
                      tempMin: 55,
                      tempMax: 65,
                      condition: "drizzle",
                    },
                  ]}
                  unit="fahrenheit"
                  updatedAt={(() => {
                    const date = new Date();
                    // Keep this aligned with `getTimeOfDay`, which interprets timestamps in UTC.
                    date.setUTCHours(
                      Math.floor(timeOfDay * 24),
                      Math.floor(((timeOfDay * 24) % 1) * 60),
                      0,
                      0,
                    );
                    return date.toISOString();
                  })()}
                  effects={{ enabled: false }}
                />
              </div>
            </div>
          ) : previewMode === "widget" ? (
            <WeatherWidget
              id="compositor-preview"
              location="San Francisco, CA"
              current={{
                temp: 72,
                tempMin: 65,
                tempMax: 78,
                condition: activeCondition,
              }}
              forecast={[
                {
                  day: "Today",
                  tempMin: 65,
                  tempMax: 78,
                  condition: activeCondition,
                },
                {
                  day: "Tue",
                  tempMin: 64,
                  tempMax: 77,
                  condition: "partly-cloudy",
                },
                { day: "Wed", tempMin: 61, tempMax: 73, condition: "cloudy" },
                { day: "Thu", tempMin: 58, tempMax: 68, condition: "rain" },
                { day: "Fri", tempMin: 55, tempMax: 65, condition: "drizzle" },
                {
                  day: "Sat",
                  tempMin: 60,
                  tempMax: 72,
                  condition: "partly-cloudy",
                },
                { day: "Sun", tempMin: 63, tempMax: 75, condition: "clear" },
              ]}
              unit="fahrenheit"
              updatedAt={(() => {
                const date = new Date();
                // Keep this aligned with `getTimeOfDay`, which interprets timestamps in UTC.
                date.setUTCHours(
                  Math.floor(timeOfDay * 24),
                  Math.floor(((timeOfDay * 24) % 1) * 60),
                  0,
                  0,
                );
                return date.toISOString();
              })()}
              effects={{ enabled: true }}
              customEffectProps={{
                enabledLayers,
                celestial: layers.celestial
                  ? {
                      timeOfDay,
                      moonPhase: celestial.moonPhase,
                      starDensity: celestial.starDensity,
                      celestialX: celestial.celestialX,
                      celestialY: celestial.celestialY,
                      sunSize: celestial.sunSize,
                      moonSize: celestial.moonSize,
                      sunGlowIntensity: celestial.sunGlowIntensity,
                      sunGlowSize: celestial.sunGlowSize,
                      sunRayCount: celestial.sunRayCount,
                      sunRayLength: celestial.sunRayLength,
                      sunRayIntensity: celestial.sunRayIntensity,
                      sunRayShimmer: celestial.sunRayShimmer,
                      sunRayShimmerSpeed: celestial.sunRayShimmerSpeed,
                      moonGlowIntensity: celestial.moonGlowIntensity,
                      moonGlowSize: celestial.moonGlowSize,
                    }
                  : undefined,
                cloud: layers.clouds
                  ? {
                      cloudScale: cloud.cloudScale,
                      coverage: cloud.coverage,
                      density: cloud.density,
                      softness: cloud.softness,
                      windSpeed: cloud.windSpeed,
                      windAngle: cloud.windAngle,
                      turbulence: cloud.turbulence,
                      sunAltitude:
                        timeOfDay < 0.5 ? timeOfDay * 2 : 2 - timeOfDay * 2,
                      sunAzimuth: cloud.sunAzimuth,
                      lightIntensity: cloud.lightIntensity,
                      ambientDarkness: cloud.ambientDarkness,
                      numLayers: cloud.numLayers,
                      layerSpread: cloud.layerSpread,
                      starDensity: 0,
                      starSize: cloud.starSize,
                      starTwinkleSpeed: cloud.starTwinkleSpeed,
                      starTwinkleAmount: cloud.starTwinkleAmount,
                      horizonLine: cloud.horizonLine,
                    }
                  : undefined,
                rain: layers.rain
                  ? {
                      glassIntensity: rain.glassIntensity,
                      zoom: rain.zoom,
                      fallingIntensity: rain.fallingIntensity,
                      fallingSpeed: rain.fallingSpeed,
                      fallingAngle: rain.fallingAngle,
                      fallingStreakLength: rain.fallingStreakLength,
                      fallingLayers: rain.fallingLayers,
                      fallingRefraction: rain.fallingRefraction,
                      fallingWaviness: rain.fallingWaviness,
                      fallingThicknessVar: rain.fallingThicknessVar,
                    }
                  : undefined,
                lightning: layers.lightning
                  ? {
                      branchDensity: lightning.branchDensity,
                      displacement: lightning.displacement,
                      glowIntensity: lightning.glowIntensity,
                      flashDuration: lightning.flashDuration,
                      sceneIllumination: lightning.sceneIllumination,
                      afterglowPersistence: lightning.afterglowPersistence,
                      autoMode: lightning.autoMode,
                      autoInterval: lightning.autoInterval,
                    }
                  : undefined,
                snow: layers.snow
                  ? {
                      intensity: snow.intensity,
                      layers: snow.layers,
                      fallSpeed: snow.fallSpeed,
                      windSpeed: snow.windSpeed,
                      windAngle: snow.windAngle,
                      turbulence: snow.turbulence,
                      drift: snow.drift,
                      flutter: snow.flutter,
                      windShear: snow.windShear,
                      flakeSize: snow.flakeSize,
                      sizeVariation: snow.sizeVariation,
                      opacity: snow.opacity,
                      glowAmount: snow.glowAmount,
                      sparkle: snow.sparkle,
                      visibility: snow.visibility,
                    }
                  : undefined,
              }}
            />
          ) : (
            <>
              {layers.celestial && (
                <CelestialCanvas
                  className="absolute inset-0"
                  timeOfDay={timeOfDay}
                  moonPhase={celestial.moonPhase}
                  starDensity={celestial.starDensity}
                  celestialX={celestial.celestialX}
                  celestialY={celestial.celestialY}
                  sunSize={celestial.sunSize}
                  moonSize={celestial.moonSize}
                  sunGlowIntensity={celestial.sunGlowIntensity}
                  sunGlowSize={celestial.sunGlowSize}
                  sunRayCount={celestial.sunRayCount}
                  sunRayLength={celestial.sunRayLength}
                  sunRayIntensity={celestial.sunRayIntensity}
                  moonGlowIntensity={celestial.moonGlowIntensity}
                  moonGlowSize={celestial.moonGlowSize}
                />
              )}

              {layers.clouds && (
                <CloudCanvas
                  className="absolute inset-0"
                  cloudScale={cloud.cloudScale}
                  coverage={cloud.coverage}
                  density={cloud.density}
                  softness={cloud.softness}
                  windSpeed={cloud.windSpeed}
                  windAngle={cloud.windAngle}
                  turbulence={cloud.turbulence}
                  sunAltitude={
                    timeOfDay < 0.5 ? timeOfDay * 2 : 2 - timeOfDay * 2
                  }
                  sunAzimuth={cloud.sunAzimuth}
                  lightIntensity={cloud.lightIntensity}
                  ambientDarkness={cloud.ambientDarkness}
                  numLayers={cloud.numLayers}
                  layerSpread={cloud.layerSpread}
                  starDensity={0}
                  starSize={cloud.starSize}
                  starTwinkleSpeed={cloud.starTwinkleSpeed}
                  starTwinkleAmount={cloud.starTwinkleAmount}
                  horizonLine={cloud.horizonLine}
                  transparentBackground={true}
                />
              )}

              {layers.rain && (
                <div
                  className="absolute inset-0"
                  style={{ mixBlendMode: "screen" }}
                >
                  <RainCanvas
                    className="absolute inset-0"
                    glassIntensity={rain.glassIntensity}
                    zoom={rain.zoom}
                    fallingIntensity={rain.fallingIntensity}
                    fallingSpeed={rain.fallingSpeed}
                    fallingAngle={rain.fallingAngle}
                    fallingStreakLength={rain.fallingStreakLength}
                    fallingLayers={rain.fallingLayers}
                    fallingRefraction={rain.fallingRefraction}
                    fallingWaviness={rain.fallingWaviness}
                    fallingThicknessVar={rain.fallingThicknessVar}
                  />
                </div>
              )}

              {layers.lightning && (
                <div
                  className="absolute inset-0"
                  style={{ mixBlendMode: "screen" }}
                >
                  <LightningCanvas
                    className="absolute inset-0"
                    branchDensity={lightning.branchDensity}
                    displacement={lightning.displacement}
                    glowIntensity={lightning.glowIntensity}
                    flashDuration={lightning.flashDuration}
                    sceneIllumination={lightning.sceneIllumination}
                    afterglowPersistence={lightning.afterglowPersistence}
                    autoMode={lightning.autoMode}
                    autoInterval={lightning.autoInterval}
                  />
                </div>
              )}

              {layers.snow && (
                <div
                  className="absolute inset-0"
                  style={{ mixBlendMode: "plus-lighter" }}
                >
                  <SnowCanvas
                    className="absolute inset-0"
                    intensity={snow.intensity}
                    layers={snow.layers}
                    fallSpeed={snow.fallSpeed}
                    windSpeed={snow.windSpeed}
                    windAngle={snow.windAngle}
                    turbulence={snow.turbulence}
                    drift={snow.drift}
                    flutter={snow.flutter}
                    windShear={snow.windShear}
                    flakeSize={snow.flakeSize}
                    sizeVariation={snow.sizeVariation}
                    opacity={snow.opacity}
                    glowAmount={snow.glowAmount}
                    sparkle={snow.sparkle}
                    visibility={snow.visibility}
                  />
                </div>
              )}
            </>
          )}

          <div className="pointer-events-none absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white/80 backdrop-blur-sm">
            {formatTimeLabel(timeOfDay)}
          </div>
        </div>
      </div>
    </div>
  );
}
