import type { PrecipitationLevel, WeatherConditionCode } from "@/components/tool-ui/weather-widget/runtime";
import { snapTimeOfDayToNearestCheckpoint } from "@/components/tool-ui/weather-widget/generated/weather-runtime-core.generated";

export interface ProductionHarnessRuntimeInput {
  conditionCode: WeatherConditionCode;
  windSpeed: number;
  precipitationLevel: PrecipitationLevel;
  visibility: number;
  timestamp: string;
  timeOfDay: number;
}

export function createProductionHarnessRuntimeInput(
  input: ProductionHarnessRuntimeInput,
): ProductionHarnessRuntimeInput {
  return {
    ...input,
    timeOfDay: snapTimeOfDayToNearestCheckpoint(input.timeOfDay),
  };
}
