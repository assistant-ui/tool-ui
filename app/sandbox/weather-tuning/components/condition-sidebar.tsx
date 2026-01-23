"use client";

import { cn } from "@/lib/ui/cn";
import { Check, Cloud, CloudRain, CloudSnow, Sun, Wind, Zap, CloudFog, CloudHail, Cloudy, CloudDrizzle, Snowflake } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import { WEATHER_CONDITIONS, CONDITION_LABELS } from "../../weather-compositor/presets";
import { CheckpointDots } from "./checkpoint-dots";
import type { ConditionCheckpoints } from "../types";

interface ConditionSidebarProps {
  selectedCondition: WeatherCondition | null;
  signedOff: Set<WeatherCondition>;
  checkpoints: Partial<Record<WeatherCondition, ConditionCheckpoints>>;
  getOverrideCount: (condition: WeatherCondition) => number;
  onSelectCondition: (condition: WeatherCondition) => void;
}

const CONDITION_ICONS: Record<WeatherCondition, typeof Sun> = {
  clear: Sun,
  "partly-cloudy": Cloudy,
  cloudy: Cloud,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  "heavy-rain": CloudRain,
  thunderstorm: Zap,
  snow: CloudSnow,
  sleet: Snowflake,
  hail: CloudHail,
  windy: Wind,
};

const CONDITION_COLORS: Record<WeatherCondition, string> = {
  clear: "from-amber-500 to-orange-500",
  "partly-cloudy": "from-sky-400 to-slate-400",
  cloudy: "from-slate-400 to-slate-500",
  overcast: "from-slate-500 to-slate-600",
  fog: "from-slate-400 to-slate-500",
  drizzle: "from-blue-400 to-cyan-400",
  rain: "from-blue-500 to-cyan-500",
  "heavy-rain": "from-blue-600 to-indigo-600",
  thunderstorm: "from-purple-500 to-indigo-600",
  snow: "from-slate-200 to-blue-200",
  sleet: "from-cyan-300 to-slate-400",
  hail: "from-cyan-400 to-slate-400",
  windy: "from-teal-400 to-cyan-500",
};

export function ConditionSidebar({
  selectedCondition,
  signedOff,
  checkpoints,
  getOverrideCount,
  onSelectCondition,
}: ConditionSidebarProps) {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border/40">
      <div className="border-b border-border/40 px-3 py-2">
        <h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
          Conditions
        </h2>
      </div>

      <div className="scrollbar-subtle flex-1 overflow-y-auto py-1">
        <nav className="flex flex-col gap-px px-1.5">
          {WEATHER_CONDITIONS.map((condition) => {
            const Icon = CONDITION_ICONS[condition];
            const label = CONDITION_LABELS[condition];
            const isSelected = selectedCondition === condition;
            const isSignedOff = signedOff.has(condition);
            const overrideCount = getOverrideCount(condition);
            const colorGradient = CONDITION_COLORS[condition];

            return (
              <button
                key={condition}
                onClick={() => onSelectCondition(condition)}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-all",
                  isSelected
                    ? "bg-accent/80"
                    : "hover:bg-accent/40"
                )}
              >
                {isSelected && (
                  <div className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground/40" />
                )}

                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded transition-all",
                    isSelected
                      ? `bg-gradient-to-br ${colorGradient}`
                      : "bg-muted/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 transition-colors",
                      isSelected ? "text-white" : "text-muted-foreground/60"
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={cn(
                        "truncate text-xs transition-colors",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {label}
                    </span>
                    {isSignedOff && (
                      <Check className="size-3 text-green-600/70 dark:text-green-400/70" />
                    )}
                    {overrideCount > 0 && (
                      <span className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[9px] text-amber-600/70 dark:text-amber-400/70">
                        {overrideCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    <CheckpointDots checkpoints={checkpoints[condition]} size="sm" />
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border/40 px-3 py-2">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
          <kbd className="rounded border border-border/50 bg-muted/30 px-1 py-0.5 font-mono">
            ↑↓
          </kbd>
          <span>navigate</span>
        </div>
      </div>
    </aside>
  );
}
