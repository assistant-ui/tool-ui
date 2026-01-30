"use client";

import { cn } from "@/lib/ui/cn";
import type { ConditionCheckpoints } from "../types";
import { TIME_CHECKPOINT_ORDER } from "../lib/constants";

interface CheckpointDotsProps {
  checkpoints?: ConditionCheckpoints;
  className?: string;
  size?: "sm" | "md";
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
  size = "md",
}: CheckpointDotsProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
        const status = checkpoints[checkpoint] ?? "pending";
        return (
          <div
            key={checkpoint}
            className={cn(
              "rounded-full transition-colors",
              size === "sm" ? "size-1" : "size-1.5",
              status === "reviewed"
                ? "bg-green-500 dark:bg-green-400"
                : "bg-muted-foreground/30"
            )}
            title={`${checkpoint}: ${status}`}
          />
        );
      })}
    </div>
  );
}
