import type { ConditionOverrides, FullCompositorParams } from "./presets";
import type { TimeCheckpoint } from "../weather-tuning/types";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../weather-tuning/lib/constants";

export interface CheckpointOverrides {
  dawn: ConditionOverrides;
  noon: ConditionOverrides;
  dusk: ConditionOverrides;
  midnight: ConditionOverrides;
}

type BaseParamsGetter = (checkpoint: TimeCheckpoint) => FullCompositorParams;

interface SurroundingCheckpoints {
  before: TimeCheckpoint;
  after: TimeCheckpoint;
  t: number;
}

export function getSurroundingCheckpoints(timeOfDay: number): SurroundingCheckpoints {
  const checkpointTimes = TIME_CHECKPOINT_ORDER.map((cp) => ({
    checkpoint: cp,
    value: TIME_CHECKPOINTS[cp].value,
  })).sort((a, b) => a.value - b.value);

  const normalized = ((timeOfDay % 1) + 1) % 1;

  for (let i = 0; i < checkpointTimes.length; i++) {
    const current = checkpointTimes[i];
    const next = checkpointTimes[(i + 1) % checkpointTimes.length];

    const start = current.value;
    let end = next.value;

    if (end < start) {
      end += 1;
    }

    let queryTime = normalized;
    if (queryTime < start && end > 1) {
      queryTime += 1;
    }

    if (queryTime >= start && queryTime < end) {
      const range = end - start;
      const t = range > 0 ? (queryTime - start) / range : 0;

      return {
        before: current.checkpoint,
        after: next.checkpoint,
        t,
      };
    }
  }

  return {
    before: "midnight",
    after: "dawn",
    t: 0,
  };
}

function lerpNumber(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolatePartialObject<T extends object>(
  a: Partial<T> | undefined,
  b: Partial<T> | undefined,
  baseA: T | undefined,
  baseB: T | undefined,
  t: number
): Partial<T> | undefined {
  if (!a && !b) return undefined;

  const result: Partial<T> = {};
  const allKeys = new Set([
    ...(a ? Object.keys(a) : []),
    ...(b ? Object.keys(b) : []),
  ]) as Set<keyof T>;

  for (const key of allKeys) {
    const aVal = a?.[key];
    const bVal = b?.[key];

    if (aVal === undefined && bVal === undefined) {
      continue;
    }

    let fromVal: T[keyof T] | undefined = aVal;
    let toVal: T[keyof T] | undefined = bVal;

    if (fromVal === undefined && baseA) {
      fromVal = baseA[key];
    }
    if (toVal === undefined && baseB) {
      toVal = baseB[key];
    }

    if (fromVal === undefined || toVal === undefined) {
      result[key] = (fromVal ?? toVal) as T[keyof T];
    } else if (typeof fromVal === "number" && typeof toVal === "number") {
      result[key] = lerpNumber(fromVal, toVal, t) as T[keyof T];
    } else if (typeof fromVal === "boolean") {
      result[key] = (t < 0.5 ? fromVal : toVal) as T[keyof T];
    } else {
      result[key] = (t < 0.5 ? fromVal : toVal) as T[keyof T];
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function interpolateOverrides(
  a: ConditionOverrides | undefined,
  b: ConditionOverrides | undefined,
  baseA: FullCompositorParams | undefined,
  baseB: FullCompositorParams | undefined,
  t: number
): ConditionOverrides | undefined {
  if (!a && !b) return undefined;

  const result: ConditionOverrides = {};

  const layers = interpolatePartialObject(a?.layers, b?.layers, baseA?.layers, baseB?.layers, t);
  if (layers) result.layers = layers;

  const celestial = interpolatePartialObject(a?.celestial, b?.celestial, baseA?.celestial, baseB?.celestial, t);
  if (celestial) result.celestial = celestial;

  const cloud = interpolatePartialObject(a?.cloud, b?.cloud, baseA?.cloud, baseB?.cloud, t);
  if (cloud) result.cloud = cloud;

  const rain = interpolatePartialObject(a?.rain, b?.rain, baseA?.rain, baseB?.rain, t);
  if (rain) result.rain = rain;

  const lightning = interpolatePartialObject(a?.lightning, b?.lightning, baseA?.lightning, baseB?.lightning, t);
  if (lightning) result.lightning = lightning;

  const snow = interpolatePartialObject(a?.snow, b?.snow, baseA?.snow, baseB?.snow, t);
  if (snow) result.snow = snow;

  return Object.keys(result).length > 0 ? result : undefined;
}

export function getInterpolatedOverrides(
  checkpointOverrides: CheckpointOverrides | undefined,
  timeOfDay: number,
  getBaseForCheckpoint?: BaseParamsGetter
): ConditionOverrides | undefined {
  if (!checkpointOverrides) return undefined;

  const { before, after, t } = getSurroundingCheckpoints(timeOfDay);

  const beforeOverrides = checkpointOverrides[before];
  const afterOverrides = checkpointOverrides[after];

  const baseA = getBaseForCheckpoint?.(before);
  const baseB = getBaseForCheckpoint?.(after);

  return interpolateOverrides(beforeOverrides, afterOverrides, baseA, baseB, t);
}

export function createEmptyCheckpointOverrides(): CheckpointOverrides {
  return {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {},
  };
}

export function isCheckpointOverridesEmpty(
  checkpointOverrides: CheckpointOverrides
): boolean {
  return (
    Object.keys(checkpointOverrides.dawn).length === 0 &&
    Object.keys(checkpointOverrides.noon).length === 0 &&
    Object.keys(checkpointOverrides.dusk).length === 0 &&
    Object.keys(checkpointOverrides.midnight).length === 0
  );
}

export function getCheckpointForTime(timeOfDay: number): TimeCheckpoint {
  const { before, after, t } = getSurroundingCheckpoints(timeOfDay);
  return t < 0.5 ? before : after;
}

export function isNearCheckpoint(
  timeOfDay: number,
  checkpoint: TimeCheckpoint,
  threshold = 0.02
): boolean {
  const checkpointValue = TIME_CHECKPOINTS[checkpoint].value;
  return Math.abs(timeOfDay - checkpointValue) < threshold;
}

export function getNearestCheckpoint(timeOfDay: number): TimeCheckpoint {
  let nearest: TimeCheckpoint = "noon";
  let minDist = Infinity;

  for (const checkpoint of TIME_CHECKPOINT_ORDER) {
    const value = TIME_CHECKPOINTS[checkpoint].value;
    let dist = Math.abs(timeOfDay - value);
    if (dist > 0.5) dist = 1 - dist;
    if (dist < minDist) {
      minDist = dist;
      nearest = checkpoint;
    }
  }

  return nearest;
}
