"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type {
  ConditionOverrides,
  FullCompositorParams,
} from "../../weather-compositor/presets";
import {
  getBaseParamsForCondition,
  mergeWithOverrides,
  extractOverrides,
  loadFromStorage,
  saveToStorage,
} from "../../weather-compositor/presets";
import type { ConditionCheckpoints, CompareMode, TimeCheckpoint } from "../types";
import { SESSION_KEY, DEFAULT_TIME_OF_DAY, TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";

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

export function useTuningState() {
  const [overrides, setOverrides] = useState<
    Partial<Record<WeatherCondition, ConditionOverrides>>
  >({});
  const [globalTimeOfDay, setGlobalTimeOfDay] = useState(DEFAULT_TIME_OF_DAY);
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
  const [checkpoints, setCheckpoints] = useState<
    Partial<Record<WeatherCondition, ConditionCheckpoints>>
  >({});
  const [signedOff, setSignedOff] = useState<Set<WeatherCondition>>(
    () => new Set()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const compositorState = loadFromStorage();
    if (compositorState) {
      setOverrides(compositorState.overrides);
      setGlobalTimeOfDay(compositorState.globalSettings.timeOfDay);
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
      activeCondition: selectedCondition ?? "clear",
      globalSettings: { timeOfDay: globalTimeOfDay },
      overrides,
    });
  }, [overrides, globalTimeOfDay, selectedCondition, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveWorkflowState(checkpoints, signedOff);
  }, [checkpoints, signedOff, isHydrated]);

  // Auto-expand parameter groups for active layers when condition changes
  useEffect(() => {
    if (!selectedCondition) return;

    const base = getBaseParamsForCondition(selectedCondition);
    const conditionOverrides = overrides[selectedCondition];
    const params = mergeWithOverrides(base, conditionOverrides);

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

  const getParamsForCondition = useCallback(
    (condition: WeatherCondition): FullCompositorParams => {
      const timestamp = getTimestamp(globalTimeOfDay);
      const base = getBaseParamsForCondition(condition, timestamp);
      const conditionOverrides = overrides[condition];
      const merged = mergeWithOverrides(base, conditionOverrides);
      merged.celestial.timeOfDay = globalTimeOfDay;
      return merged;
    },
    [overrides, globalTimeOfDay, getTimestamp]
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

  const updateOverrides = useCallback(
    (condition: WeatherCondition, newOverrides: ConditionOverrides) => {
      setOverrides((prev) => ({
        ...prev,
        [condition]: newOverrides,
      }));
    },
    []
  );

  const updateParams = useCallback(
    (condition: WeatherCondition, newParams: FullCompositorParams) => {
      const base = getBaseParams(condition);
      const newOverrides = extractOverrides(newParams, base);
      updateOverrides(condition, newOverrides);
    },
    [getBaseParams, updateOverrides]
  );

  const resetCondition = useCallback((condition: WeatherCondition) => {
    setOverrides((prev) => {
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
      const conditionOverrides = overrides[condition];
      if (!conditionOverrides) return 0;

      let count = 0;
      for (const group of Object.values(conditionOverrides)) {
        if (group && typeof group === "object") {
          count += Object.keys(group).length;
        }
      }
      return count;
    },
    [overrides]
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

  const goToCheckpoint = useCallback(
    (condition: WeatherCondition, checkpoint: TimeCheckpoint) => {
      const { value } = TIME_CHECKPOINTS[checkpoint];
      setGlobalTimeOfDay(value);
      markCheckpointReviewed(condition, checkpoint);
    },
    [markCheckpointReviewed]
  );

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
    overrides,
    globalTimeOfDay,
    setGlobalTimeOfDay,
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
    checkpoints,
    setCheckpoints,
    signedOff,
    setSignedOff,
    signedOffCount,
    isHydrated,

    getParamsForCondition,
    getBaseParams,
    updateOverrides,
    updateParams,
    resetCondition,
    getOverrideCount,
    markCheckpointReviewed,
    goToCheckpoint,
    toggleSignOff,
    getConditionCheckpoints,
    allCheckpointsReviewed,
  };
}

export type TuningStateReturn = ReturnType<typeof useTuningState>;
