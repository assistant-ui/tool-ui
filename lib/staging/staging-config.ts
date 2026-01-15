import type { ComponentId, StagingConfig } from "./types";
import { parameterSliderStagingConfig } from "./configs/parameter-slider";
import { statsDisplayStagingConfig } from "./configs/stats-display";
import { progressTrackerStagingConfig } from "./configs/progress-tracker";
import { planStagingConfig } from "./configs/plan";

const stagingConfigs: Partial<Record<ComponentId, StagingConfig>> = {
  "parameter-slider": parameterSliderStagingConfig,
  "stats-display": statsDisplayStagingConfig,
  "progress-tracker": progressTrackerStagingConfig,
  plan: planStagingConfig,
};

export function getStagingConfig(
  componentId: ComponentId,
): StagingConfig | null {
  return stagingConfigs[componentId] ?? null;
}
