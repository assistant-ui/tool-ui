"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "@/lib/weather-authoring/weather-widget/effects/tuned-presets";
import {
  resolveWeatherEffectsCanvasProps,
  type WeatherEffectsCanvasProps,
  type WeatherEffectsCheckpointMode,
} from "@/lib/weather-authoring/weather-widget/effects";
import type {
  ConditionOverrides,
  FullCompositorParams,
  CheckpointOverrides,
} from "../../weather-compositor/presets";
import {
  getRawBaseParamsForCondition,
  mergeWithOverrides,
  extractOverrides,
  loadFromStorage,
  saveToStorage,
  WEATHER_CONDITIONS,
  type CompositorState,
} from "../../weather-compositor/presets";
import {
  getNearestCheckpoint,
  getInterpolatedOverrides,
} from "../../weather-compositor/interpolation";
import type {
  ConditionCheckpoints,
  CompareMode,
  TimeCheckpoint,
} from "../types";
import {
  DEFAULT_TIME_OF_DAY,
  TIME_CHECKPOINTS,
  TIME_CHECKPOINT_ORDER,
} from "../lib/constants";
import { mapToolUiPresetsToCompositor } from "../lib/tool-ui-import";
import { resolveCompositorParamsAtTime } from "../lib/resolve-params";
import { recoverRepoCheckpointOverrides } from "../lib/recover-repo-overrides";
import { createStudioTimestamp } from "../lib/studio-timestamp";
import { mergeTunedPresets, toToolUiDelta } from "../lib/tool-ui-export";
import { loadWorkflowState, saveWorkflowState } from "../lib/workflow-state";

export type LayerKey =
  | "layers"
  | "celestial"
  | "cloud"
  | "rain"
  | "lightning"
  | "snow"
  | "glass"
  | "post";

const STUDIO_PREVIEW_CHECKPOINT_MODE: WeatherEffectsCheckpointMode = "nearest";

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
    Partial<Record<WeatherConditionCode, CheckpointOverrides>>
  >({});
  const [repoCheckpointOverrides, setRepoCheckpointOverrides] = useState<
    Partial<Record<WeatherConditionCode, CheckpointOverrides>>
  >(() =>
    mapToolUiPresetsToCompositor(TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES),
  );
  const [globalTimeOfDay, setGlobalTimeOfDay] = useState(DEFAULT_TIME_OF_DAY);
  const [activeEditCheckpoint, setActiveEditCheckpoint] =
    useState<TimeCheckpoint>(() => getNearestCheckpoint(DEFAULT_TIME_OF_DAY));
  const [selectedCondition, setSelectedCondition] =
    useState<WeatherConditionCode | null>("clear");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [compareMode, setCompareMode] = useState<CompareMode>("off");
  const [compareTarget, setCompareTarget] =
    useState<WeatherConditionCode | null>(null);
  const [showWidgetOverlay, setShowWidgetOverlay] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [checkpoints, setCheckpoints] = useState<
    Partial<Record<WeatherConditionCode, ConditionCheckpoints>>
  >({});
  const [signedOff, setSignedOff] = useState<Set<WeatherConditionCode>>(
    () => new Set(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    const compositorState = loadFromStorage() as CompositorState | null;
    if (compositorState) {
      setCheckpointOverrides(compositorState.checkpointOverrides ?? {});

      const storedTime = compositorState.globalSettings.timeOfDay;
      const nearest = getNearestCheckpoint(storedTime);
      const snappedTime = TIME_CHECKPOINTS[nearest].value;
      setGlobalTimeOfDay(snappedTime);
      setActiveEditCheckpoint(nearest);
    }

    const workflowState = loadWorkflowState();
    if (workflowState) {
      setCheckpoints(workflowState.checkpoints);
      setSignedOff(new Set(workflowState.signedOff));
      if (workflowState.repoCheckpointOverrides) {
        setRepoCheckpointOverrides(workflowState.repoCheckpointOverrides);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let cancelled = false;
    const recover = async () => {
      const recovered = await recoverRepoCheckpointOverrides();
      if (!cancelled && recovered) {
        setRepoCheckpointOverrides(recovered);
      }
    };

    void recover();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    saveToStorage({
      version: 4,
      activeCondition: selectedCondition ?? "clear",
      globalSettings: { timeOfDay: globalTimeOfDay },
      checkpointOverrides,
    });
  }, [checkpointOverrides, globalTimeOfDay, selectedCondition, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveWorkflowState({
      checkpoints,
      signedOff: Array.from(signedOff),
      repoCheckpointOverrides,
    });
  }, [checkpoints, signedOff, repoCheckpointOverrides, isHydrated]);

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
    // Important: our production helpers (`getTimeOfDay`, `getSunAltitude`) use UTC.
    // If we generate timestamps in local time and then read them as UTC, the
    // tuning studio silently shifts the day cycle (noon becomes evening, etc).
    // This presents as "bleeding" or wildly inconsistent cross-condition tuning.
    return createStudioTimestamp(timeOfDay);
  }, []);

  const getRawBaseParamsForCheckpoint = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoint: TimeCheckpoint,
    ): FullCompositorParams => {
      const checkpointTime = TIME_CHECKPOINTS[checkpoint].value;
      const timestamp = getTimestamp(checkpointTime);
      const base = getRawBaseParamsForCondition(condition, timestamp);
      base.celestial.timeOfDay = checkpointTime;
      return base;
    },
    [getTimestamp],
  );

  const getBaseParamsForCheckpoint = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoint: TimeCheckpoint,
    ): FullCompositorParams => {
      const base = getRawBaseParamsForCheckpoint(condition, checkpoint);
      const repoDefaults = repoCheckpointOverrides[condition]?.[checkpoint];
      return repoDefaults ? mergeWithOverrides(base, repoDefaults) : base;
    },
    [getRawBaseParamsForCheckpoint, repoCheckpointOverrides],
  );

  const resolveParamsAtTime = useCallback(
    (
      condition: WeatherConditionCode,
      timeOfDay: number,
    ): FullCompositorParams => {
      const timestamp = getTimestamp(timeOfDay);
      const rawBase = getRawBaseParamsForCondition(condition, timestamp);
      rawBase.celestial.timeOfDay = timeOfDay;

      return resolveCompositorParamsAtTime({
        timeOfDay,
        rawBaseAtTime: rawBase,
        getRawBaseForCheckpoint: (checkpoint) =>
          getRawBaseParamsForCheckpoint(condition, checkpoint),
        repoCheckpointOverrides: repoCheckpointOverrides[condition],
        getRepoBaseForCheckpoint: (checkpoint) =>
          getBaseParamsForCheckpoint(condition, checkpoint),
        userCheckpointOverrides: checkpointOverrides[condition],
      });
    },
    [
      checkpointOverrides,
      getBaseParamsForCheckpoint,
      getRawBaseParamsForCheckpoint,
      getTimestamp,
      repoCheckpointOverrides,
    ],
  );

  // Get full params including user overrides for a specific checkpoint
  const getFullParamsForCheckpoint = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoint: TimeCheckpoint,
    ): FullCompositorParams => {
      const checkpointTime = TIME_CHECKPOINTS[checkpoint].value;
      return resolveParamsAtTime(condition, checkpointTime);
    },
    [resolveParamsAtTime],
  );

  const getParamsForCondition = useCallback(
    (condition: WeatherConditionCode): FullCompositorParams => {
      return resolveParamsAtTime(condition, globalTimeOfDay);
    },
    [globalTimeOfDay, resolveParamsAtTime],
  );

  const getBaseParams = useCallback(
    (condition: WeatherConditionCode): FullCompositorParams => {
      const timestamp = getTimestamp(globalTimeOfDay);
      const rawBase = getRawBaseParamsForCondition(condition, timestamp);
      rawBase.celestial.timeOfDay = globalTimeOfDay;

      const repoOverridesForCondition = repoCheckpointOverrides[condition];
      const repoInterpolated = getInterpolatedOverrides(
        repoOverridesForCondition,
        globalTimeOfDay,
        (checkpoint) => getRawBaseParamsForCheckpoint(condition, checkpoint),
      );

      return repoInterpolated
        ? mergeWithOverrides(rawBase, repoInterpolated)
        : rawBase;
    },
    [
      getRawBaseParamsForCheckpoint,
      getTimestamp,
      globalTimeOfDay,
      repoCheckpointOverrides,
    ],
  );

  const previewTunedPresets = useMemo(
    () =>
      mergeTunedPresets(
        toToolUiDelta(repoCheckpointOverrides),
        toToolUiDelta(checkpointOverrides),
      ),
    [checkpointOverrides, repoCheckpointOverrides],
  );

  const getCanvasPropsForCondition = useCallback(
    (
      condition: WeatherConditionCode,
      timeOfDay: number,
      checkpointMode: WeatherEffectsCheckpointMode = STUDIO_PREVIEW_CHECKPOINT_MODE,
    ): WeatherEffectsCanvasProps => {
      const timestamp = getTimestamp(timeOfDay);
      return resolveWeatherEffectsCanvasProps({
        conditionCode: condition,
        timestamp,
        timeOfDay,
        tunedPresets: previewTunedPresets,
        checkpointMode,
      });
    },
    [getTimestamp, previewTunedPresets],
  );

  const withCheckpointOverrides = useCallback(
    (
      updater: (
        current: Partial<Record<WeatherConditionCode, CheckpointOverrides>>,
      ) => Partial<Record<WeatherConditionCode, CheckpointOverrides>>,
    ) => {
      setCheckpointOverrides((prev) => updater(prev));
    },
    [],
  );

  const clearStudioDeltas = useCallback(() => {
    // Clear pending user edits. This is used after applying an export so
    // subsequent applies only include new changes, while keeping the current
    // workflow state (review/sign-off).
    setCheckpointOverrides({});
    setIsPreviewing(false);
  }, []);

  const updateCheckpointOverrides = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoint: TimeCheckpoint,
      newOverrides: ConditionOverrides,
    ) => {
      withCheckpointOverrides((prev) => {
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
    [withCheckpointOverrides],
  );

  const updateParameterAtCheckpoint = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoint: TimeCheckpoint,
      layer: LayerKey,
      parameter: string,
      value: number | boolean,
    ) => {
      const base = getBaseParamsForCheckpoint(condition, checkpoint);
      const full = getFullParamsForCheckpoint(condition, checkpoint);
      const nextGroup = {
        ...(full[layer] as unknown as Record<string, number | boolean>),
        [parameter]: value,
      };
      const nextFull = {
        ...full,
        [layer]: nextGroup,
      } as FullCompositorParams;
      const newOverrides = extractOverrides(nextFull, base);
      updateCheckpointOverrides(condition, checkpoint, newOverrides);
    },
    [
      getBaseParamsForCheckpoint,
      getFullParamsForCheckpoint,
      updateCheckpointOverrides,
    ],
  );

  const updateParams = useCallback(
    (condition: WeatherConditionCode, newParams: FullCompositorParams) => {
      let checkpointToEdit = activeEditCheckpoint;
      if (isPreviewing) {
        // If we're previewing, snap edits back to the nearest checkpoint
        // so overrides are stored against a single, deterministic checkpoint.
        const previewParams = getParamsForCondition(condition);

        checkpointToEdit = getNearestCheckpoint(globalTimeOfDay);
        setActiveEditCheckpoint(checkpointToEdit);
        setGlobalTimeOfDay(TIME_CHECKPOINTS[checkpointToEdit].value);
        setIsPreviewing(false);

        const delta = extractOverrides(newParams, previewParams);

        const checkpointBase = getBaseParamsForCheckpoint(
          condition,
          checkpointToEdit,
        );
        const checkpointCurrent = getFullParamsForCheckpoint(
          condition,
          checkpointToEdit,
        );
        const checkpointNext = mergeWithOverrides(checkpointCurrent, delta);
        const newOverrides = extractOverrides(checkpointNext, checkpointBase);
        updateCheckpointOverrides(condition, checkpointToEdit, newOverrides);
        return;
      }

      const base = getBaseParamsForCheckpoint(condition, checkpointToEdit);
      const newOverrides = extractOverrides(newParams, base);
      updateCheckpointOverrides(condition, checkpointToEdit, newOverrides);
    },
    [
      getBaseParamsForCheckpoint,
      getFullParamsForCheckpoint,
      getParamsForCondition,
      activeEditCheckpoint,
      updateCheckpointOverrides,
      isPreviewing,
      globalTimeOfDay,
    ],
  );

  const resetCondition = useCallback(
    (condition: WeatherConditionCode) => {
      withCheckpointOverrides((prev) => {
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
    },
    [withCheckpointOverrides],
  );

  const copyLayerFromCondition = useCallback(
    (
      sourceCondition: WeatherConditionCode,
      targetCondition: WeatherConditionCode,
      layerKey: LayerKey,
    ) => {
      withCheckpointOverrides((prev) => {
        const existing =
          prev[targetCondition] ?? createEmptyCheckpointOverrides();
        const updated = { ...existing };

        for (const checkpoint of TIME_CHECKPOINT_ORDER) {
          // Get the FULL merged params for the source (base + defaults + user overrides)
          const sourceBase = getBaseParamsForCheckpoint(
            sourceCondition,
            checkpoint,
          );
          const sourceUserOverrides = prev[sourceCondition]?.[checkpoint];
          const sourceFull = sourceUserOverrides
            ? mergeWithOverrides(sourceBase, sourceUserOverrides)
            : sourceBase;

          // Get just the layer data from the full params
          const sourceLayerData = sourceFull[layerKey];

          if (
            sourceLayerData &&
            typeof sourceLayerData === "object" &&
            Object.keys(sourceLayerData).length > 0
          ) {
            // Apply the full layer data as overrides to the target
            updated[checkpoint] = {
              ...updated[checkpoint],
              [layerKey]: JSON.parse(JSON.stringify(sourceLayerData)),
            };
          } else {
            // Clear target's layer if source has no data
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
    [getBaseParamsForCheckpoint, withCheckpointOverrides],
  );

  const copyLayerToAllConditions = useCallback(
    (sourceCondition: WeatherConditionCode, layerKey: LayerKey) => {
      const otherConditions = WEATHER_CONDITIONS.filter(
        (c) => c !== sourceCondition,
      );
      for (const target of otherConditions) {
        copyLayerFromCondition(sourceCondition, target, layerKey);
      }
    },
    [copyLayerFromCondition],
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
    (condition: WeatherConditionCode): number => {
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
    [checkpointOverrides],
  );

  const markCheckpointReviewed = useCallback(
    (condition: WeatherConditionCode, checkpoint: TimeCheckpoint) => {
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
    [],
  );

  const copyCheckpointToCheckpoints = useCallback(
    (
      condition: WeatherConditionCode,
      sourceCheckpoint: TimeCheckpoint,
      targetCheckpoints: TimeCheckpoint[],
    ) => {
      withCheckpointOverrides((prev) => {
        const existing = prev[condition] ?? createEmptyCheckpointOverrides();
        const updated = { ...existing };

        const sourceFull = getFullParamsForCheckpoint(
          condition,
          sourceCheckpoint,
        );

        for (const target of targetCheckpoints) {
          if (target !== sourceCheckpoint) {
            const targetBase = getBaseParamsForCheckpoint(condition, target);
            const rebased = extractOverrides(sourceFull, targetBase);
            updated[target] = JSON.parse(JSON.stringify(rebased));
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
    [
      getBaseParamsForCheckpoint,
      getFullParamsForCheckpoint,
      markCheckpointReviewed,
      withCheckpointOverrides,
    ],
  );

  const bulkUpdateParameter = useCallback(
    (
      conditions: WeatherConditionCode[],
      checkpoints: TimeCheckpoint[],
      layer: LayerKey,
      parameter: string,
      value: number | boolean,
    ) => {
      for (const condition of conditions) {
        for (const checkpoint of checkpoints) {
          updateParameterAtCheckpoint(
            condition,
            checkpoint,
            layer,
            parameter,
            value,
          );
        }
      }
    },
    [updateParameterAtCheckpoint],
  );

  const bulkUpdateParameterAcrossCheckpoints = useCallback(
    (
      condition: WeatherConditionCode,
      checkpoints: TimeCheckpoint[],
      layer: LayerKey,
      parameter: string,
      value: number | boolean,
    ) => {
      withCheckpointOverrides((prev) => {
        const existing = prev[condition] ?? createEmptyCheckpointOverrides();
        const updated = { ...existing };

        for (const checkpoint of checkpoints) {
          const base = getBaseParamsForCheckpoint(condition, checkpoint);
          const userOverrides = existing[checkpoint];
          const full = userOverrides
            ? mergeWithOverrides(base, userOverrides)
            : base;

          const nextGroup = {
            ...(full[layer] as unknown as Record<string, number | boolean>),
            [parameter]: value,
          };
          const nextFull = {
            ...full,
            [layer]: nextGroup,
          } as FullCompositorParams;

          const newOverrides = extractOverrides(nextFull, base);
          updated[checkpoint] = newOverrides;
        }

        return {
          ...prev,
          [condition]: updated,
        };
      });
    },
    [getBaseParamsForCheckpoint, withCheckpointOverrides],
  );

  const goToCheckpoint = useCallback(
    (condition: WeatherConditionCode, checkpoint: TimeCheckpoint) => {
      const { value } = TIME_CHECKPOINTS[checkpoint];
      setGlobalTimeOfDay(value);
      setActiveEditCheckpoint(checkpoint);
      setIsPreviewing(false);
      markCheckpointReviewed(condition, checkpoint);
    },
    [markCheckpointReviewed],
  );

  const scrubTime = useCallback((time: number) => {
    const nearest = getNearestCheckpoint(time);
    setGlobalTimeOfDay(TIME_CHECKPOINTS[nearest].value);
    setActiveEditCheckpoint(nearest);
    setIsPreviewing(true);
  }, []);

  const exitPreview = useCallback(() => {
    setIsPreviewing(false);
    const nearest = getNearestCheckpoint(globalTimeOfDay);
    setActiveEditCheckpoint(nearest);
  }, [globalTimeOfDay]);

  const toggleSignOff = useCallback((condition: WeatherConditionCode) => {
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
    (condition: WeatherConditionCode): ConditionCheckpoints => {
      return (
        checkpoints[condition] ?? {
          dawn: "pending",
          noon: "pending",
          dusk: "pending",
          midnight: "pending",
        }
      );
    },
    [checkpoints],
  );

  const allCheckpointsReviewed = useCallback(
    (condition: WeatherConditionCode): boolean => {
      const cp = getConditionCheckpoints(condition);
      return TIME_CHECKPOINT_ORDER.every((key) => cp[key] === "reviewed");
    },
    [getConditionCheckpoints],
  );

  return {
    checkpointOverrides,
    setCheckpointOverrides,
    repoCheckpointOverrides,
    setRepoCheckpointOverrides,
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
    clearStudioDeltas,
    getParamsForCondition,
    getCanvasPropsForCondition,
    getBaseParams,
    getBaseParamsForCheckpoint,
    getFullParamsForCheckpoint,
    updateCheckpointOverrides,
    updateParams,
    updateParameterAtCheckpoint,
    bulkUpdateParameter,
    bulkUpdateParameterAcrossCheckpoints,
    resetCondition,
    copyLayerFromCondition,
    copyLayerToAllConditions,
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
