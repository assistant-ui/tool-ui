"use client";

import { Settings, Loader2, Sun, Moon, Monitor, Play, Eye } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/ui/cn";
import {
  previewConfigs,
  type ComponentId,
} from "@/lib/docs/preview-config";
import { getStagingConfig } from "@/lib/staging/staging-config";
import {
  useStagingStore,
  usePresetNames,
} from "./use-staging-state";
import type { DebugLevel } from "@/lib/staging/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const COMPONENT_IDS = Object.keys(previewConfigs) as ComponentId[];

const DEBUG_LEVEL_LABELS: Record<DebugLevel, string> = {
  off: "Off",
  boundaries: "Boundaries",
  margins: "Margins",
  full: "Full",
};

function ComponentSelector() {
  const { componentId, setComponent } = useStagingStore();

  return (
    <Select value={componentId} onValueChange={(v) => setComponent(v as ComponentId)}>
      <SelectTrigger className="h-8 w-[180px] border-none bg-transparent text-sm font-medium shadow-none focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COMPONENT_IDS.map((id) => (
          <SelectItem key={id} value={id} className="text-sm">
            {formatComponentName(id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function formatComponentName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function PresetPills() {
  const { presetName, setPreset } = useStagingStore();
  const presetNames = usePresetNames();

  return (
    <div className="flex items-center gap-1">
      {presetNames.map((name, index) => (
        <button
          key={name}
          onClick={() => setPreset(name)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            presetName === name
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <span className="text-muted-foreground mr-1.5 font-mono opacity-60">
            {index + 1}
          </span>
          {formatPresetName(name)}
        </button>
      ))}
    </div>
  );
}

function formatPresetName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function SettingsPopover() {
  const { componentId, debugLevel, setDebugLevel, isLoading, toggleLoading } =
    useStagingStore();
  const { theme, setTheme } = useTheme();

  const stagingConfig = getStagingConfig(componentId);
  const hasDebugOverlays = stagingConfig?.supportedDebugLevels?.length ?? 0 > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-4">
          {hasDebugOverlays && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Debug Overlay
                </Label>
                <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  D
                </kbd>
              </div>
              <RadioGroup
                value={debugLevel}
                onValueChange={(v) => setDebugLevel(v as DebugLevel)}
                className="grid grid-cols-2 gap-2"
              >
                {(stagingConfig?.supportedDebugLevels ?? []).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={`debug-${level}`} />
                    <Label htmlFor={`debug-${level}`} className="text-sm cursor-pointer">
                      {DEBUG_LEVEL_LABELS[level]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                State
              </Label>
              <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                L
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="loading-toggle" className="text-sm cursor-pointer">
                Loading
              </Label>
              <Switch
                id="loading-toggle"
                checked={isLoading}
                onCheckedChange={toggleLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Theme
            </Label>
            <div className="flex gap-1">
              <Button
                variant={theme === "light" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-1.5 h-3.5 w-3.5" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-1.5 h-3.5 w-3.5" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setTheme("system")}
              >
                <Monitor className="mr-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-[10px] text-muted-foreground">
              Press <kbd className="rounded bg-muted px-1 py-0.5 font-mono">1</kbd>-<kbd className="rounded bg-muted px-1 py-0.5 font-mono">9</kbd> to switch presets
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ViewModeToggle() {
  const { viewMode, setViewMode } = useStagingStore();

  return (
    <div className="flex items-center rounded-lg border p-0.5">
      <button
        onClick={() => setViewMode("static")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
          viewMode === "static"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Static view"
      >
        <Eye className="h-3 w-3" />
        Static
      </button>
      <button
        onClick={() => setViewMode("showcase")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
          viewMode === "showcase"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Showcase animation"
      >
        <Play className="h-3 w-3" />
        Showcase
      </button>
    </div>
  );
}

function DebugLevelIndicator() {
  const { debugLevel, cycleDebugLevel } = useStagingStore();

  if (debugLevel === "off") return null;

  const colors: Record<DebugLevel, string> = {
    off: "",
    boundaries: "bg-blue-500",
    margins: "bg-emerald-500",
    full: "bg-orange-500",
  };

  return (
    <button
      onClick={cycleDebugLevel}
      className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80"
      title="Click or press D to cycle"
    >
      <span className={cn("h-2 w-2 rounded-full", colors[debugLevel])} />
      <span className="font-medium">{DEBUG_LEVEL_LABELS[debugLevel]}</span>
    </button>
  );
}

function LoadingIndicator() {
  const { isLoading } = useStagingStore();

  if (!isLoading) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>Loading</span>
    </div>
  );
}

export function StagingToolbar() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <ComponentSelector />
          <div className="bg-border h-4 w-px" />
          <PresetPills />
        </div>

        <div className="flex items-center gap-2">
          <ViewModeToggle />
          <div className="bg-border h-4 w-px" />
          <DebugLevelIndicator />
          <LoadingIndicator />
          <SettingsPopover />
        </div>
      </div>
    </header>
  );
}
