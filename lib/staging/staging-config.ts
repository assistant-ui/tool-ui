import type { ComponentId, StagingConfig } from "./types";
import { parameterSliderStagingConfig } from "./configs/parameter-slider";

const stagingConfigs: Partial<Record<ComponentId, StagingConfig>> = {
  "parameter-slider": parameterSliderStagingConfig,
};

export function getStagingConfig(
  componentId: ComponentId,
): StagingConfig | null {
  return stagingConfigs[componentId] ?? null;
}
