"use client";

import { useState, useRef, useEffect } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isChanged = Math.abs(value - baseValue) > 0.001;
  const displayValue = value.toFixed(2);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    setEditValue(displayValue);
    setIsEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const increment = e.shiftKey ? step * 10 : step;
      const newValue = Math.min(max, parseFloat(editValue) + increment);
      setEditValue(newValue.toFixed(2));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const decrement = e.shiftKey ? step * 10 : step;
      const newValue = Math.max(min, parseFloat(editValue) - decrement);
      setEditValue(newValue.toFixed(2));
    }
  };

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
        {isChanged && (
          <div
            className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-muted-foreground/30"
            style={{
              left: `${((baseValue - min) / (max - min)) * 100}%`,
            }}
            title={`Base: ${baseValue.toFixed(2)}`}
          />
        )}
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
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            aria-label={`${label} value`}
            className={cn(
              "w-12 rounded border border-blue-500/50 bg-blue-500/10 px-1 py-0.5",
              "font-mono text-[10px] tabular-nums text-blue-600 dark:text-blue-400",
              "outline-none ring-1 ring-blue-500/30"
            )}
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={cn(
              "rounded px-1 py-0.5 font-mono text-[10px] tabular-nums transition-colors",
              "hover:bg-accent hover:ring-1 hover:ring-border",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isChanged
                ? "bg-amber-500/10 text-amber-600/80 dark:text-amber-400/80"
                : "text-muted-foreground/40"
            )}
            aria-label={`Edit ${label}: ${displayValue}`}
          >
            {displayValue}
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          disabled={!isChanged}
          className={cn(
            "flex size-4 items-center justify-center rounded transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isChanged
              ? "text-muted-foreground/50 opacity-100 hover:bg-accent hover:text-muted-foreground"
              : "pointer-events-none opacity-0"
          )}
          aria-label={`Reset ${label} to ${baseValue.toFixed(2)}`}
        >
          <RotateCcw className="size-2.5" aria-hidden="true" />
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
          type="button"
          role="switch"
          aria-checked={value}
          aria-label={label}
          onClick={() => onChange(!value)}
          className={cn(
            "relative flex h-4 w-7 items-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            value ? "bg-foreground/30" : "bg-muted/50"
          )}
        >
          <span
            aria-hidden="true"
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
          type="button"
          onClick={onReset}
          disabled={!isChanged}
          className={cn(
            "flex size-4 items-center justify-center rounded transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isChanged
              ? "text-muted-foreground/50 opacity-100 hover:bg-accent hover:text-muted-foreground"
              : "pointer-events-none opacity-0"
          )}
          aria-label={`Reset ${label} to ${baseValue ? "On" : "Off"}`}
        >
          <RotateCcw className="size-2.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
