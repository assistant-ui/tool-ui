import type { ComponentId, StagingConfig } from "./types";
import { parameterSliderStagingConfig } from "./configs/parameter-slider";
import { statsDisplayStagingConfig } from "./configs/stats-display";

const stagingConfigs: Partial<Record<ComponentId, StagingConfig>> = {
  "parameter-slider": parameterSliderStagingConfig,
  "stats-display": statsDisplayStagingConfig,
};

export function getStagingConfig(
  componentId: ComponentId,
): StagingConfig | null {
  return stagingConfigs[componentId] ?? null;
}
