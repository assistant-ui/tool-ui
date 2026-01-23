"use client";

import { RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/ui/cn";

interface ParameterRowProps {
  label: string;
  value: number;
  baseValue: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onReset: () => void;
}

export function ParameterRow({
  label,
  value,
  baseValue,
  min,
  max,
  step = 0.01,
  onChange,
  onReset,
}: ParameterRowProps) {
  const isChanged = Math.abs(value - baseValue) > 0.001;
  const displayValue = value.toFixed(2);

  return (
    <div className="group flex items-center gap-2.5 rounded px-1.5 py-1.5 transition-colors hover:bg-accent/30">
      <div className="w-28 shrink-0">
        <span className={cn(
          "text-[11px] transition-colors",
          isChanged ? "text-foreground/80" : "text-muted-foreground/60"
        )}>
          {label}
        </span>
      </div>

      <div className="relative flex-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="relative w-full [&_[data-slot=slider-track]]:h-0.5 [&_[data-slot=slider-range]]:bg-foreground/20"
        />
      </div>

      <div className="flex w-16 shrink-0 items-center justify-end gap-1">
        <span
          className={cn(
            "rounded px-1 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
            isChanged
              ? "bg-amber-500/10 text-amber-600/80 dark:text-amber-400/80"
              : "text-muted-foreground/40"
          )}
        >
          {displayValue}
        </span>
        <button
          onClick={onReset}
          className={cn(
            "flex size-4 items-center justify-center rounded transition-all",
            isChanged
              ? "text-muted-foreground/50 opacity-100 hover:bg-accent hover:text-muted-foreground"
              : "pointer-events-none opacity-0"
          )}
          title={`Reset to ${baseValue.toFixed(2)}`}
        >
          <RotateCcw className="size-2.5" />
        </button>
      </div>
    </div>
  );
}

interface ParameterToggleRowProps {
  label: string;
  value: boolean;
  baseValue: boolean;
  onChange: (value: boolean) => void;
  onReset: () => void;
}

export function ParameterToggleRow({
  label,
  value,
  baseValue,
  onChange,
  onReset,
}: ParameterToggleRowProps) {
  const isChanged = value !== baseValue;

  return (
    <div className="group flex items-center gap-2.5 rounded px-1.5 py-1.5 transition-colors hover:bg-accent/30">
      <div className="w-28 shrink-0">
        <span className={cn(
          "text-[11px] transition-colors",
          isChanged ? "text-foreground/80" : "text-muted-foreground/60"
        )}>
          {label}
        </span>
      </div>

      <div className="flex-1">
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "relative flex h-4 w-7 items-center rounded-full transition-colors",
            value ? "bg-foreground/30" : "bg-muted/50"
          )}
        >
          <span
            className={cn(
              "absolute size-3 rounded-full bg-white shadow-sm transition-transform",
              value ? "translate-x-3.5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>

      <div className="flex w-16 shrink-0 items-center justify-end gap-1">
        <span
          className={cn(
            "rounded px-1 py-0.5 text-[10px] transition-colors",
            value
              ? "text-foreground/60"
              : "text-muted-foreground/40"
          )}
        >
          {value ? "On" : "Off"}
        </span>
        <button
          onClick={onReset}
          className={cn(
            "flex size-4 items-center justify-center rounded transition-all",
            isChanged
              ? "text-muted-foreground/50 opacity-100 hover:bg-accent hover:text-muted-foreground"
              : "pointer-events-none opacity-0"
          )}
          title={`Reset to ${baseValue ? "On" : "Off"}`}
        >
          <RotateCcw className="size-2.5" />
        </button>
      </div>
    </div>
  );
}
