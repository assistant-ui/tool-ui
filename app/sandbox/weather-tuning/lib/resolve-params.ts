import type { FullCompositorParams } from "../../weather-compositor/presets";
import { mergeWithOverrides } from "../../weather-compositor/presets";
import { getInterpolatedOverrides } from "../../weather-compositor/interpolation";
import type { CheckpointOverrides } from "../../weather-compositor/interpolation";
import type { TimeCheckpoint } from "../types";

type BaseGetter = (checkpoint: TimeCheckpoint) => FullCompositorParams;

/**
 * Resolve the effective compositor params at a given time-of-day.
 *
 * We treat "repo" presets as the baseline defaults, and "user" overrides as
 * transient deltas layered on top. Both layers can interpolate across time.
 */
export function resolveCompositorParamsAtTime(opts: {
  timeOfDay: number;
  rawBaseAtTime: FullCompositorParams;
  getRawBaseForCheckpoint: BaseGetter;
  repoCheckpointOverrides: CheckpointOverrides | undefined;
  getRepoBaseForCheckpoint: BaseGetter;
  userCheckpointOverrides: CheckpointOverrides | undefined;
}): FullCompositorParams {
  const repoInterpolated = getInterpolatedOverrides(
    opts.repoCheckpointOverrides,
    opts.timeOfDay,
    opts.getRawBaseForCheckpoint,
  );
  const baseWithRepo = repoInterpolated
    ? mergeWithOverrides(opts.rawBaseAtTime, repoInterpolated)
    : opts.rawBaseAtTime;

  const userInterpolated = getInterpolatedOverrides(
    opts.userCheckpointOverrides,
    opts.timeOfDay,
    opts.getRepoBaseForCheckpoint,
  );

  return userInterpolated
    ? mergeWithOverrides(baseWithRepo, userInterpolated)
    : baseWithRepo;
}
