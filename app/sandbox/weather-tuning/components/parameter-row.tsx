"use client";

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
    <div className="flex items-center gap-3 py-1">
      <div className="w-40 shrink-0">
        <span className="text-sm text-zinc-300">{label}</span>
      </div>

      <div className="flex-1">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>

      <div className="w-16 shrink-0 text-right">
        <span
          className={cn(
            "font-mono text-sm",
            isChanged ? "text-amber-400" : "text-zinc-500"
          )}
        >
          {displayValue}
        </span>
      </div>

      {isChanged && (
        <button
          onClick={onReset}
          className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
          title={`Reset to ${baseValue.toFixed(2)}`}
        >
          ↺
        </button>
      )}
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
    <div className="flex items-center gap-3 py-1">
      <div className="w-40 shrink-0">
        <span className="text-sm text-zinc-300">{label}</span>
      </div>

      <div className="flex-1">
        <button
          onClick={() => onChange(!value)}
          className={cn(
            "rounded px-3 py-1 text-sm transition-colors",
            value
              ? "bg-blue-500/20 text-blue-400"
              : "bg-zinc-800 text-zinc-500"
          )}
        >
          {value ? "On" : "Off"}
        </button>
      </div>

      <div className="w-16 shrink-0" />

      {isChanged && (
        <button
          onClick={onReset}
          className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
          title={`Reset to ${baseValue ? "On" : "Off"}`}
        >
          ↺
        </button>
      )}
    </div>
  );
}
