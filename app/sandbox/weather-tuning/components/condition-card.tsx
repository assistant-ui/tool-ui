"use client";

import { cn } from "@/lib/ui/cn";
import { Check } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { CONDITION_LABELS } from "../../weather-compositor/presets";
import { CheckpointDots } from "./checkpoint-dots";
import type { ConditionCheckpoints } from "../types";

interface ConditionCardProps {
  condition: WeatherCondition;
  isSelected: boolean;
  isSignedOff: boolean;
  checkpoints?: ConditionCheckpoints;
  overrideCount: number;
  onClick: () => void;
}

export function ConditionCard({
  condition,
  isSelected,
  isSignedOff,
  checkpoints,
  overrideCount,
  onClick,
}: ConditionCardProps) {
  const label = CONDITION_LABELS[condition];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
        "hover:border-zinc-600 hover:bg-zinc-800/50",
        isSelected
          ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/50"
          : "border-zinc-700 bg-zinc-900/50",
        isSignedOff && !isSelected && "border-emerald-500/50"
      )}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap text-sm font-medium text-zinc-200">
            {label}
          </span>
          {isSignedOff && (
            <Check className="size-3.5 text-emerald-400" />
          )}
          {overrideCount > 0 && (
            <span className="rounded bg-zinc-700 px-1 py-0.5 text-[10px] text-zinc-400">
              {overrideCount}
            </span>
          )}
        </div>
        <CheckpointDots checkpoints={checkpoints} />
      </div>
    </button>
  );
}
