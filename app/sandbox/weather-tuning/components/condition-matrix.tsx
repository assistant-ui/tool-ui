"use client";

import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WEATHER_CONDITIONS } from "../../weather-compositor/presets";
import { ConditionCard } from "./condition-card";
import type { ConditionCheckpoints } from "../types";

interface ConditionMatrixProps {
  selectedCondition: WeatherCondition | null;
  signedOff: Set<WeatherCondition>;
  checkpoints: Partial<Record<WeatherCondition, ConditionCheckpoints>>;
  getOverrideCount: (condition: WeatherCondition) => number;
  onSelectCondition: (condition: WeatherCondition) => void;
}

export function ConditionMatrix({
  selectedCondition,
  signedOff,
  checkpoints,
  getOverrideCount,
  onSelectCondition,
}: ConditionMatrixProps) {
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <div className="flex gap-2 pb-2">
        {WEATHER_CONDITIONS.map((condition) => (
          <ConditionCard
            key={condition}
            condition={condition}
            isSelected={selectedCondition === condition}
            isSignedOff={signedOff.has(condition)}
            checkpoints={checkpoints[condition]}
            overrideCount={getOverrideCount(condition)}
            onClick={() => onSelectCondition(condition)}
          />
        ))}
      </div>
    </div>
  );
}
