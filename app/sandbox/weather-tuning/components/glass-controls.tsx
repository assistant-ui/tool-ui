"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import type { GlassEffectParams } from "../hooks/use-tuning-state";

interface GlassControlsProps {
  params: GlassEffectParams;
  onChange: (params: GlassEffectParams) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderRow({ label, value, min, max, step, onChange, disabled }: SliderRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn(
        "w-24 text-[11px]",
        disabled ? "text-muted-foreground/30" : "text-muted-foreground/70"
      )}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted/50 disabled:cursor-not-allowed disabled:opacity-30 [&::-webkit-slider-thumb]:size-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground/60"
      />
      <span className={cn(
        "w-8 text-right font-mono text-[10px]",
        disabled ? "text-muted-foreground/30" : "text-muted-foreground/50"
      )}>
        {value}
      </span>
    </div>
  );
}

export function GlassControls({ params, onChange }: GlassControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateParam = <K extends keyof GlassEffectParams>(key: K, value: GlassEffectParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="rounded-lg border border-border/40 bg-card/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className={cn(
            "size-3.5 transition-colors",
            params.enabled ? "text-foreground/60" : "text-muted-foreground/30"
          )} />
          <span className="text-[11px] font-medium text-foreground/70">Glass Effect</span>
          {!params.enabled && (
            <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[9px] text-muted-foreground/50">
              OFF
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground/40 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border/30 px-3 py-2.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={params.enabled}
                onChange={(e) => updateParam("enabled", e.target.checked)}
                className="size-3 rounded border-border accent-foreground"
              />
              <span className="text-[11px] text-muted-foreground/70">
                Enable SVG refraction
              </span>
            </label>
            <span className="text-[9px] text-muted-foreground/40">
              (disable to simulate unsupported browsers)
            </span>
          </div>

          <div className="space-y-1.5">
            <SliderRow
              label="Depth"
              value={params.depth}
              min={2}
              max={20}
              step={1}
              onChange={(v) => updateParam("depth", v)}
              disabled={!params.enabled}
            />
            <SliderRow
              label="Strength"
              value={params.strength}
              min={10}
              max={120}
              step={5}
              onChange={(v) => updateParam("strength", v)}
              disabled={!params.enabled}
            />
            <SliderRow
              label="Chromatic"
              value={params.chromaticAberration}
              min={0}
              max={20}
              step={1}
              onChange={(v) => updateParam("chromaticAberration", v)}
              disabled={!params.enabled}
            />
            <SliderRow
              label="Blur"
              value={params.blur}
              min={0}
              max={6}
              step={0.5}
              onChange={(v) => updateParam("blur", v)}
              disabled={!params.enabled}
            />
            <SliderRow
              label="Brightness"
              value={params.brightness}
              min={0.8}
              max={1.4}
              step={0.05}
              onChange={(v) => updateParam("brightness", v)}
              disabled={!params.enabled}
            />
            <SliderRow
              label="Saturation"
              value={params.saturation}
              min={0.5}
              max={2.0}
              step={0.1}
              onChange={(v) => updateParam("saturation", v)}
              disabled={!params.enabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}
