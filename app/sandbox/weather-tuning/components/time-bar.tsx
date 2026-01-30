"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  TIME_CHECKPOINTS,
  TIME_CHECKPOINT_ORDER,
} from "../lib/constants";

interface TimeBarProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimeBar({ value, onChange }: TimeBarProps) {
  const formatTime = (timeOfDay: number): string => {
    const hours = Math.floor(timeOfDay * 24);
    const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex min-w-[80px] items-center gap-2">
        <span className="text-sm font-medium text-zinc-300">Time:</span>
        <span className="font-mono text-sm text-zinc-400">
          {formatTime(value)}
        </span>
      </div>

      <div className="flex-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      <div className="flex gap-1">
        {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
          const { value: checkpointValue, label } = TIME_CHECKPOINTS[checkpoint];
          const isActive = Math.abs(value - checkpointValue) < 0.02;

          return (
            <Button
              key={checkpoint}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onChange(checkpointValue)}
              className="px-3 text-[11px] font-medium uppercase tracking-wide"
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
