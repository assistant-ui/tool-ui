"use client";

import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
} from "@/app/workbench/lib/store";
import {
  LOCALE_OPTIONS,
  type DisplayMode,
  type DeviceType,
  type UserLocation,
} from "@/app/workbench/lib/types";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { SafeAreaInsetsControl } from "./safe-area-insets-control";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Square,
  PictureInPicture2,
  GalleryHorizontal,
  Moon,
  Sun,
  MoreHorizontal,
  MapPin,
  X,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/ui/cn";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  INPUT_GROUP_CLASSES,
  INPUT_CLASSES,
  ADDON_CLASSES,
  LABEL_CLASSES,
  SELECT_CLASSES,
  TOGGLE_BUTTON_CLASSES,
  TOGGLE_BUTTON_ACTIVE_CLASSES,
} from "./styles";

const DISPLAY_MODES: ReadonlyArray<{
  id: DisplayMode;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "inline", label: "Inline", icon: Square },
  { id: "pip", label: "PiP", icon: PictureInPicture2 },
  { id: "fullscreen", label: "Fullscreen", icon: Maximize2 },
  { id: "carousel", label: "Carousel", icon: GalleryHorizontal },
];

const DEVICE_TYPES: ReadonlyArray<{
  id: DeviceType;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

const LOCATION_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  location: UserLocation | null;
}> = [
  { id: "none", label: "None", location: null },
  {
    id: "sf",
    label: "San Francisco",
    location: {
      city: "San Francisco",
      region: "California",
      country: "US",
      timezone: "America/Los_Angeles",
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    id: "nyc",
    label: "New York",
    location: {
      city: "New York",
      region: "New York",
      country: "US",
      timezone: "America/New_York",
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  {
    id: "london",
    label: "London",
    location: {
      city: "London",
      region: "England",
      country: "GB",
      timezone: "Europe/London",
      latitude: 51.5074,
      longitude: -0.1278,
    },
  },
  {
    id: "tokyo",
    label: "Tokyo",
    location: {
      city: "Tokyo",
      region: "Tokyo",
      country: "JP",
      timezone: "Asia/Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
    },
  },
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

interface SettingRowProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function SettingRow({ label, htmlFor, children }: SettingRowProps) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-4">
      <Label htmlFor={htmlFor} className={`${LABEL_CLASSES} shrink-0 text-xs`}>
        {label}
      </Label>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function AdvancedSettingsPopover() {
  const displayMode = useDisplayMode();

  const {
    locale,
    maxHeight,
    safeAreaInsets,
    view,
    userLocation,
    setLocale,
    setMaxHeight,
    setSafeAreaInsets,
    setView,
    setUserLocation,
  } = useWorkbenchStore(
    useShallow((s) => ({
      locale: s.locale,
      maxHeight: s.maxHeight,
      safeAreaInsets: s.safeAreaInsets,
      view: s.view,
      userLocation: s.userLocation,
      setLocale: s.setLocale,
      setMaxHeight: s.setMaxHeight,
      setSafeAreaInsets: s.setSafeAreaInsets,
      setView: s.setView,
      setUserLocation: s.setUserLocation,
    })),
  );

  return (
    <Popover>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-7"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">More options</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-72 space-y-1">
        <div className="mb-4 text-sm font-medium">Environment Options</div>

        {view && (
          <SettingRow label="View">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium">
                <Layers className="size-3" />
                {view.mode}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground size-6 p-0"
                onClick={() => setView(null)}
                title="Dismiss view"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </SettingRow>
        )}

        {displayMode === "inline" && (
          <SettingRow label="Max height" htmlFor="max-height">
            <InputGroup className={INPUT_GROUP_CLASSES}>
              <InputGroupInput
                id="max-height"
                type="number"
                value={maxHeight}
                onChange={(e) => {
                  const clamped = clamp(Number(e.target.value), 100, 2000);
                  setMaxHeight(clamped);
                }}
                min={100}
                max={2000}
                className={INPUT_CLASSES}
              />
              <InputGroupAddon align="inline-end" className={ADDON_CLASSES}>
                px
              </InputGroupAddon>
            </InputGroup>
          </SettingRow>
        )}

        {displayMode === "fullscreen" && (
          <SettingRow label="Safe area">
            <SafeAreaInsetsControl
              value={safeAreaInsets}
              onChange={setSafeAreaInsets}
            />
          </SettingRow>
        )}

        <SettingRow label="Locale">
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger className={SELECT_CLASSES}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALE_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow label="Location">
          <div className="flex items-center gap-2">
            <Select
              value={
                LOCATION_PRESETS.find(
                  (p) =>
                    p.location?.city === userLocation?.city &&
                    p.location?.country === userLocation?.country,
                )?.id ?? "none"
              }
              onValueChange={(id) => {
                const preset = LOCATION_PRESETS.find((p) => p.id === id);
                setUserLocation(preset?.location ?? null);
              }}
            >
              <SelectTrigger className={SELECT_CLASSES}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_PRESETS.map((preset) => (
                  <SelectItem
                    key={preset.id}
                    value={preset.id}
                    className="text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {preset.location && <MapPin className="size-3" />}
                      {preset.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userLocation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground size-6 p-0"
                onClick={() => setUserLocation(null)}
                title="Clear location"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </SettingRow>
      </PopoverContent>
    </Popover>
  );
}

export function PreviewToolbar() {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();

  const { setDisplayMode, setDeviceType, setTheme } = useWorkbenchStore(
    useShallow((s) => ({
      setDisplayMode: s.setDisplayMode,
      setDeviceType: s.setDeviceType,
      setTheme: s.setTheme,
    })),
  );

  const isDark = theme === "dark";

  return (
    <div className="border-border/50 flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60 cursor-default text-xs select-none">
            Device
          </span>
          <ButtonGroup>
            {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
              <Tooltip key={id} delayDuration={500}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "size-7 p-0",
                      deviceType === id
                        ? TOGGLE_BUTTON_ACTIVE_CLASSES
                        : TOGGLE_BUTTON_CLASSES,
                    )}
                    onClick={() => setDeviceType(id)}
                  >
                    <Icon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </ButtonGroup>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/60 cursor-default text-xs select-none">
            Mode
          </span>
          <ButtonGroup>
            {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
              <Tooltip key={id} delayDuration={500}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "size-7 p-0",
                      displayMode === id
                        ? TOGGLE_BUTTON_ACTIVE_CLASSES
                        : TOGGLE_BUTTON_CLASSES,
                    )}
                    onClick={() => setDisplayMode(id)}
                  >
                    <Icon className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </ButtonGroup>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip delayDuration={500}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative size-7"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <Sun
                className={cn(
                  "size-4 transition-all",
                  isDark ? "scale-0 rotate-90" : "scale-100 rotate-0",
                )}
              />
              <Moon
                className={cn(
                  "absolute size-4 transition-all",
                  isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90",
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Toggle theme</TooltipContent>
        </Tooltip>

        <AdvancedSettingsPopover />
      </div>
    </div>
  );
}
