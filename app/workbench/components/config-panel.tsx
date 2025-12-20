"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
  useOpenAIGlobals,
  useActiveToolCall,
} from "@/app/workbench/lib/store";
import {
  LOCALE_OPTIONS,
  type DisplayMode,
  type DeviceType,
  type UserLocation,
} from "@/app/workbench/lib/types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SafeAreaInsetsControl } from "./safe-area-insets-control";
import { MockConfigPanel } from "./mock-config-panel";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Square,
  PictureInPicture2,
  X,
  Layers,
  MapPin,
  GalleryHorizontal,
  Loader2,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/ui/cn";
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
  { id: "fullscreen", label: "Full", icon: Maximize2 },
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

interface SettingRowProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function formatDelay(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

function ToolCallLoadingIndicator() {
  const activeToolCall = useActiveToolCall();

  if (!activeToolCall) return null;

  return (
    <div className="bg-primary/5 flex items-center gap-2 px-4 py-2">
      <Loader2 className="text-primary size-3.5 animate-spin" />
      <span className="text-muted-foreground text-xs">
        <span className="font-medium">{activeToolCall.toolName}</span>
        <span className="text-muted-foreground/60 ml-1.5">
          ({formatDelay(activeToolCall.delay)} delay)
        </span>
      </span>
    </div>
  );
}

function SettingRow({ label, htmlFor, className, children }: SettingRowProps) {
  return (
    <div
      className={`flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1.5 ${className ?? ""}`}
    >
      <Label htmlFor={htmlFor} className={`${LABEL_CLASSES} shrink-0`}>
        {label}
      </Label>
      <div className="ml-auto shrink-0">{children}</div>
    </div>
  );
}

function EnvironmentTab() {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();
  const openAIGlobals = useOpenAIGlobals();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    locale,
    maxHeight,
    safeAreaInsets,
    view,
    userLocation,
    setDisplayMode,
    setDeviceType,
    setTheme,
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
      setDisplayMode: s.setDisplayMode,
      setDeviceType: s.setDeviceType,
      setTheme: s.setTheme,
      setLocale: s.setLocale,
      setMaxHeight: s.setMaxHeight,
      setSafeAreaInsets: s.setSafeAreaInsets,
      setView: s.setView,
      setUserLocation: s.setUserLocation,
    })),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="scrollbar-subtle flex-1 space-y-2 overflow-y-auto py-2 pr-4">
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

        <SettingRow label="Device">
          <ButtonGroup>
            {DEVICE_TYPES.map(({ id, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                className={
                  deviceType === id
                    ? TOGGLE_BUTTON_ACTIVE_CLASSES
                    : TOGGLE_BUTTON_CLASSES
                }
                onClick={() => setDeviceType(id)}
              >
                <Icon className="size-3" />
              </Button>
            ))}
          </ButtonGroup>
        </SettingRow>

        <SettingRow label="Mode">
          <ButtonGroup>
            {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                size="sm"
                className={
                  displayMode === id
                    ? TOGGLE_BUTTON_ACTIVE_CLASSES
                    : TOGGLE_BUTTON_CLASSES
                }
                onClick={() => setDisplayMode(id)}
              >
                <Icon className="size-3" />
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </SettingRow>

        <SettingRow label="Dark mode" htmlFor="theme-toggle">
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </SettingRow>

        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between py-2 text-xs transition-colors">
            <span>More options</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                showAdvanced && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
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
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Accordion
        type="single"
        collapsible
        className="border-border/40 border-t"
      >
        <AccordionItem value="environment" className="border-0">
          <AccordionTrigger className="hover:bg-muted/30 px-4 py-2.5 hover:no-underline">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Raw Environment
            </span>
          </AccordionTrigger>
          <AccordionContent className="scrollbar-subtle max-h-64 overflow-y-auto px-4">
            <pre className="bg-muted/30 text-muted-foreground rounded-md p-3 font-mono text-[10px] leading-relaxed">
              {JSON.stringify(openAIGlobals, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function SimulationTab() {
  return (
    <div className="flex h-full flex-col">
      <ToolCallLoadingIndicator />
      <div className="min-h-0 flex-1 overflow-hidden">
        <MockConfigPanel />
      </div>
    </div>
  );
}

export function ConfigPanel() {
  return (
    <div className="flex h-full flex-col py-3">
      <Tabs defaultValue="environment" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 grid w-auto grid-cols-2">
          <TabsTrigger value="environment" className="text-xs">
            Environment
          </TabsTrigger>
          <TabsTrigger value="simulation" className="text-xs">
            Simulation
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="environment"
          className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          <EnvironmentTab />
        </TabsContent>
        <TabsContent
          value="simulation"
          className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden"
        >
          <SimulationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
