"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type {
  ConditionOverrides,
  FullCompositorParams,
  CheckpointOverrides,
} from "../../weather-compositor/presets";
import {
  getBaseParamsForCondition,
  mergeWithOverrides,
  extractOverrides,
  loadFromStorage,
  saveToStorage,
  DEFAULT_CHECKPOINT_OVERRIDES,
} from "../../weather-compositor/presets";
import {
  getInterpolatedOverrides,
  getNearestCheckpoint,
} from "../../weather-compositor/interpolation";
import type { ConditionCheckpoints, CompareMode, TimeCheckpoint } from "../types";
import { SESSION_KEY, DEFAULT_TIME_OF_DAY, TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";

export type LayerKey = "layers" | "celestial" | "cloud" | "rain" | "lightning" | "snow";

export interface GlassEffectParams {
  enabled: boolean;
  depth: number;
  strength: number;
  chromaticAberration: number;
  blur: number;
  brightness: number;
  saturation: number;
}

const DEFAULT_GLASS_PARAMS: GlassEffectParams = {
  enabled: true,
  depth: 3,
  strength: 75,
  chromaticAberration: 6,
  blur: 1.5,
  brightness: 0.8,
  saturation: 1.3,
};

interface WorkflowState {
  checkpoints: Partial<Record<WeatherCondition, ConditionCheckpoints>>;
  signedOff: WeatherCondition[];
}

function loadWorkflowState(): WorkflowState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as WorkflowState;
  } catch {
    return null;
  }
}

function saveWorkflowState(
  checkpoints: Partial<Record<WeatherCondition, ConditionCheckpoints>>,
  signedOff: Set<WeatherCondition>
): void {
  if (typeof window === "undefined") return;
  try {
    const state: WorkflowState = {
      checkpoints,
      signedOff: Array.from(signedOff),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    console.warn("Failed to save workflow state to localStorage");
  }
}

function createEmptyCheckpointOverrides(): CheckpointOverrides {
  return {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {},
  };
}


export function useTuningState() {
  const [checkpointOverrides, setCheckpointOverrides] = useState<
    Partial<Record<WeatherCondition, CheckpointOverrides>>
  >({});
  const [globalTimeOfDay, setGlobalTimeOfDay] = useState(DEFAULT_TIME_OF_DAY);
  const [activeEditCheckpoint, setActiveEditCheckpoint] = useState<TimeCheckpoint>(
    () => getNearestCheckpoint(DEFAULT_TIME_OF_DAY)
  );
  const [selectedCondition, setSelectedCondition] =
    useState<WeatherCondition | null>("clear");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set()
  );
  const [compareMode, setCompareMode] = useState<CompareMode>("off");
  const [compareTarget, setCompareTarget] = useState<WeatherCondition | null>(
    null
  );
  const [showWidgetOverlay, setShowWidgetOverlay] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [checkpoints, setCheckpoints] = useState<
    Partial<Record<WeatherCondition, ConditionCheckpoints>>
  >({});
  const [signedOff, setSignedOff] = useState<Set<WeatherCondition>>(
    () => new Set()
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [glassParams, setGlassParams] = useState<GlassEffectParams>(DEFAULT_GLASS_PARAMS);

  useEffect(() => {
    const compositorState = loadFromStorage();
    if (compositorState) {
      setCheckpointOverrides(compositorState.checkpointOverrides);
      setGlobalTimeOfDay(compositorState.globalSettings.timeOfDay);
      setActiveEditCheckpoint(getNearestCheckpoint(compositorState.globalSettings.timeOfDay));
    }

    const workflowState = loadWorkflowState();
    if (workflowState) {
      setCheckpoints(workflowState.checkpoints);
      setSignedOff(new Set(workflowState.signedOff));
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    saveToStorage({
      version: 2,
      activeCondition: selectedCondition ?? "clear",
      globalSettings: { timeOfDay: globalTimeOfDay },
      checkpointOverrides,
    });
  }, [checkpointOverrides, globalTimeOfDay, selectedCondition, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveWorkflowState(checkpoints, signedOff);
  }, [checkpoints, signedOff, isHydrated]);

  // Auto-expand parameter groups for active layers when condition changes
  useEffect(() => {
    if (!selectedCondition) return;

    const params = getParamsForCondition(selectedCondition);

    const groups = new Set<string>();
    if (params.layers.celestial) groups.add("celestial");
    if (params.layers.clouds) groups.add("cloud");
    if (params.layers.rain) groups.add("rain");
    if (params.layers.lightning) groups.add("lightning");
    if (params.layers.snow) groups.add("snow");

    setExpandedGroups(groups);
    // Only re-run when condition changes, not on every override change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCondition]);

  const getTimestamp = useCallback((timeOfDay: number) => {
    const date = new Date();
    const hours = Math.floor(timeOfDay * 24);
    const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  }, []);

  const getBaseParamsForCheckpoint = useCallback(
    (condition: WeatherCondition, checkpoint: TimeCheckpoint): FullCompositorParams => {
      const checkpointTime = TIME_CHECKPOINTS[checkpoint].value;
      const timestamp = getTimestamp(checkpointTime);
      const base = getBaseParamsForCondition(condition, timestamp);
      base.celestial.timeOfDay = checkpointTime;

      // Merge in the tuned defaults as part of the base
      const defaults = DEFAULT_CHECKPOINT_OVERRIDES[condition]?.[checkpoint];
      if (defaults) {
        return mergeWithOverrides(base, defaults);
      }
      return base;
    },
    [getTimestamp]
  );

  const getParamsForCondition = useCallback(
    (condition: WeatherCondition): FullCompositorParams => {
      const timestamp = getTimestamp(globalTimeOfDay);
      const base = getBaseParamsForCondition(condition, timestamp);
      // User overrides only (defaults are now baked into getBaseParamsForCheckpoint)
      const userOverrides = checkpointOverrides[condition];

      const getBaseForCheckpoint = (checkpoint: TimeCheckpoint) =>
        getBaseParamsForCheckpoint(condition, checkpoint);

      const interpolatedOverrides = getInterpolatedOverrides(
        userOverrides,
        globalTimeOfDay,
        getBaseForCheckpoint
      );
      const merged = mergeWithOverrides(base, interpolatedOverrides);
      merged.celestial.timeOfDay = globalTimeOfDay;
      return merged;
    },
    [checkpointOverrides, globalTimeOfDay, getTimestamp, getBaseParamsForCheckpoint]
  );

  const getBaseParams = useCallback(
    (condition: WeatherCondition): FullCompositorParams => {
      const timestamp = getTimestamp(globalTimeOfDay);
      const base = getBaseParamsForCondition(condition, timestamp);
      base.celestial.timeOfDay = globalTimeOfDay;
      return base;
    },
    [globalTimeOfDay, getTimestamp]
  );

  const updateCheckpointOverrides = useCallback(
    (condition: WeatherCondition, checkpoint: TimeCheckpoint, newOverrides: ConditionOverrides) => {
      setCheckpointOverrides((prev) => {
        const existing = prev[condition] ?? createEmptyCheckpointOverrides();
        return {
          ...prev,
          [condition]: {
            ...existing,
            [checkpoint]: newOverrides,
          },
        };
      });
    },
    []
  );

  const updateParams = useCallback(
    (condition: WeatherCondition, newParams: FullCompositorParams) => {
      // If in preview mode, snap to nearest checkpoint before saving
      // This prevents corruption from saving interpolated values against wrong base
      let checkpointToEdit = activeEditCheckpoint;
      if (isPreviewing) {
        checkpointToEdit = getNearestCheckpoint(globalTimeOfDay);
        setActiveEditCheckpoint(checkpointToEdit);
        setGlobalTimeOfDay(TIME_CHECKPOINTS[checkpointToEdit].value);
        setIsPreviewing(false);
      }

      const base = getBaseParamsForCheckpoint(condition, checkpointToEdit);
      const newOverrides = extractOverrides(newParams, base);
      updateCheckpointOverrides(condition, checkpointToEdit, newOverrides);
    },
    [
      getBaseParamsForCheckpoint,
      activeEditCheckpoint,
      updateCheckpointOverrides,
      isPreviewing,
      globalTimeOfDay,
    ]
  );

  const resetCondition = useCallback((condition: WeatherCondition) => {
    setCheckpointOverrides((prev) => {
      const next = { ...prev };
      delete next[condition];
      return next;
    });
    setCheckpoints((prev) => {
      const next = { ...prev };
      delete next[condition];
      return next;
    });
    setSignedOff((prev) => {
      const next = new Set(prev);
      next.delete(condition);
      return next;
    });
  }, []);

  const copyLayerFromCondition = useCallback(
    (
      sourceCondition: WeatherCondition,
      targetCondition: WeatherCondition,
      layerKey: LayerKey
    ) => {
      const sourceCheckpoints = checkpointOverrides[sourceCondition];

      setCheckpointOverrides((prev) => {
        const existing = prev[targetCondition] ?? createEmptyCheckpointOverrides();
        const updated = { ...existing };

        for (const checkpoint of TIME_CHECKPOINT_ORDER) {
          const sourceOverrides = sourceCheckpoints?.[checkpoint];
          const sourceLayerData = sourceOverrides?.[layerKey];

          if (sourceLayerData && Object.keys(sourceLayerData).length > 0) {
            updated[checkpoint] = {
              ...updated[checkpoint],
              [layerKey]: { ...sourceLayerData },
            };
          } else {
            const currentCheckpoint = updated[checkpoint];
            if (currentCheckpoint && layerKey in currentCheckpoint) {
              const { [layerKey]: _, ...rest } = currentCheckpoint;
              updated[checkpoint] = rest;
            }
          }
        }

        return {
          ...prev,
          [targetCondition]: updated,
        };
      });
    },
    [checkpointOverrides]
  );

  const toggleGroup = useCallback((group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const signedOffCount = useMemo(() => signedOff.size, [signedOff]);

  const getOverrideCount = useCallback(
    (condition: WeatherCondition): number => {
      const conditionCheckpointOverrides = checkpointOverrides[condition];
      if (!conditionCheckpointOverrides) return 0;

      let count = 0;
      for (const checkpoint of TIME_CHECKPOINT_ORDER) {
        const checkpointData = conditionCheckpointOverrides[checkpoint];
        if (!checkpointData) continue;
        for (const group of Object.values(checkpointData)) {
          if (group && typeof group === "object") {
            count += Object.keys(group).length;
          }
        }
      }
      return count;
    },
    [checkpointOverrides]
  );

  const markCheckpointReviewed = useCallback(
    (condition: WeatherCondition, checkpoint: TimeCheckpoint) => {
      setCheckpoints((prev) => {
        const current = prev[condition] ?? {
          dawn: "pending",
          noon: "pending",
          dusk: "pending",
          midnight: "pending",
        };
        return {
          ...prev,
          [condition]: {
            ...current,
            [checkpoint]: "reviewed",
          },
        };
      });
    },
    []
  );

  const copyCheckpointToCheckpoints = useCallback(
    (
      condition: WeatherCondition,
      sourceCheckpoint: TimeCheckpoint,
      targetCheckpoints: TimeCheckpoint[]
    ) => {
      setCheckpointOverrides((prev) => {
        const existing = prev[condition] ?? createEmptyCheckpointOverrides();
        const sourceData = existing[sourceCheckpoint] ?? {};
        const updated = { ...existing };

        for (const target of targetCheckpoints) {
          if (target !== sourceCheckpoint) {
            updated[target] = JSON.parse(JSON.stringify(sourceData));
          }
        }

        return {
          ...prev,
          [condition]: updated,
        };
      });

      for (const target of targetCheckpoints) {
        if (target !== sourceCheckpoint) {
          markCheckpointReviewed(condition, target);
        }
      }
    },
    [markCheckpointReviewed]
  );

  const updateParameterAtCheckpoint = useCallback(
    (
      condition: WeatherCondition,
      checkpoint: TimeCheckpoint,
      layer: LayerKey,
      parameter: string,
      value: number | boolean
    ) => {
      setCheckpointOverrides((prev) => {
        const existing = prev[condition] ?? createEmptyCheckpointOverrides();
        const checkpointData = existing[checkpoint] ?? {};
        const layerData = (checkpointData[layer] as Record<string, unknown>) ?? {};

        return {
          ...prev,
          [condition]: {
            ...existing,
            [checkpoint]: {
              ...checkpointData,
              [layer]: {
                ...layerData,
                [parameter]: value,
              },
            },
          },
        };
      });
    },
    []
  );

  const bulkUpdateParameter = useCallback(
    (
      conditions: WeatherCondition[],
      checkpoints: TimeCheckpoint[],
      layer: LayerKey,
      parameter: string,
      value: number | boolean
    ) => {
      setCheckpointOverrides((prev) => {
        const updated = { ...prev };

        for (const condition of conditions) {
          const existing = updated[condition] ?? createEmptyCheckpointOverrides();
          const conditionUpdated = { ...existing };

          for (const checkpoint of checkpoints) {
            const checkpointData = conditionUpdated[checkpoint] ?? {};
            const layerData = (checkpointData[layer] as Record<string, unknown>) ?? {};

            conditionUpdated[checkpoint] = {
              ...checkpointData,
              [layer]: {
                ...layerData,
                [parameter]: value,
              },
            };
          }

          updated[condition] = conditionUpdated;
        }

        return updated;
      });
    },
    []
  );

  const goToCheckpoint = useCallback(
    (condition: WeatherCondition, checkpoint: TimeCheckpoint) => {
      const { value } = TIME_CHECKPOINTS[checkpoint];
      setGlobalTimeOfDay(value);
      setActiveEditCheckpoint(checkpoint);
      setIsPreviewing(false);
      markCheckpointReviewed(condition, checkpoint);
    },
    [markCheckpointReviewed]
  );

  const scrubTime = useCallback((time: number) => {
    setGlobalTimeOfDay(time);
    setIsPreviewing(true);
  }, []);

  const exitPreview = useCallback(() => {
    setIsPreviewing(false);
    const nearest = getNearestCheckpoint(globalTimeOfDay);
    setActiveEditCheckpoint(nearest);
  }, [globalTimeOfDay]);

  const toggleSignOff = useCallback((condition: WeatherCondition) => {
    setSignedOff((prev) => {
      const next = new Set(prev);
      if (next.has(condition)) {
        next.delete(condition);
      } else {
        next.add(condition);
      }
      return next;
    });
  }, []);

  const getConditionCheckpoints = useCallback(
    (condition: WeatherCondition): ConditionCheckpoints => {
      return (
        checkpoints[condition] ?? {
          dawn: "pending",
          noon: "pending",
          dusk: "pending",
          midnight: "pending",
        }
      );
    },
    [checkpoints]
  );

  const allCheckpointsReviewed = useCallback(
    (condition: WeatherCondition): boolean => {
      const cp = getConditionCheckpoints(condition);
      return TIME_CHECKPOINT_ORDER.every((key) => cp[key] === "reviewed");
    },
    [getConditionCheckpoints]
  );

  return {
    checkpointOverrides,
    globalTimeOfDay,
    setGlobalTimeOfDay,
    activeEditCheckpoint,
    setActiveEditCheckpoint,
    selectedCondition,
    setSelectedCondition,
    expandedGroups,
    toggleGroup,
    compareMode,
    setCompareMode,
    compareTarget,
    setCompareTarget,
    showWidgetOverlay,
    setShowWidgetOverlay,
    isPreviewing,
    setIsPreviewing,
    checkpoints,
    setCheckpoints,
    signedOff,
    setSignedOff,
    signedOffCount,
    isHydrated,
    glassParams,
    setGlassParams,

    getParamsForCondition,
    getBaseParams,
    getBaseParamsForCheckpoint,
    updateCheckpointOverrides,
    updateParams,
    updateParameterAtCheckpoint,
    bulkUpdateParameter,
    resetCondition,
    copyLayerFromCondition,
    copyCheckpointToCheckpoints,
    getOverrideCount,
    markCheckpointReviewed,
    goToCheckpoint,
    scrubTime,
    exitPreview,
    toggleSignOff,
    getConditionCheckpoints,
    allCheckpointsReviewed,
  };
}

export type TuningStateReturn = ReturnType<typeof useTuningState>;
