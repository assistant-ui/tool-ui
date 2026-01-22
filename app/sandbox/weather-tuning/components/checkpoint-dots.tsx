"use client";

import { cn } from "@/lib/ui/cn";
import type { ConditionCheckpoints } from "../types";
import { TIME_CHECKPOINT_ORDER } from "../lib/constants";

interface CheckpointDotsProps {
  checkpoints?: ConditionCheckpoints;
  className?: string;
}

const DEFAULT_CHECKPOINTS: ConditionCheckpoints = {
  dawn: "pending",
  noon: "pending",
  dusk: "pending",
  midnight: "pending",
};

export function CheckpointDots({
  checkpoints = DEFAULT_CHECKPOINTS,
  className,
}: CheckpointDotsProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
        const status = checkpoints[checkpoint] ?? "pending";
        return (
          <div
            key={checkpoint}
            className={cn(
              "size-1.5 rounded-full transition-colors",
              status === "reviewed"
                ? "bg-emerald-400"
                : "bg-zinc-600"
            )}
            title={`${checkpoint}: ${status}`}
          />
        );
      })}
    </div>
  );
}
