"use client";

import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useSelectedComponent,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
} from "@/lib/workbench/store";
import {
  LOCALE_OPTIONS,
  type DisplayMode,
  type DeviceType,
} from "@/lib/workbench/types";
import { workbenchComponents } from "@/lib/workbench/component-registry";
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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Square,
  PictureInPicture2,
  Import,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";

// Workbench-specific input styling constants
const WORKBENCH_INPUT_CLASSES =
  "bg-accent hover:bg-accent/80 focus:ring-ring border-0 transition-colors focus:ring-2";

const WORKBENCH_SELECT_CLASSES = `${WORKBENCH_INPUT_CLASSES} w-full text-xs`;

// Configuration for display mode buttons
const DISPLAY_MODES: ReadonlyArray<{
  id: DisplayMode;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "inline", label: "Inline", icon: Square },
  { id: "pip", label: "PiP", icon: PictureInPicture2 },
  { id: "fullscreen", label: "Full", icon: Maximize2 },
];

// Configuration for device type buttons
const DEVICE_TYPES: ReadonlyArray<{
  id: DeviceType;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

// Configuration for safe area insets
const SAFE_AREA_INSETS = [
  { key: "left" as const, symbol: "←", ariaLabel: "Left inset" },
  { key: "top" as const, symbol: "↑", ariaLabel: "Top inset" },
  { key: "right" as const, symbol: "→", ariaLabel: "Right inset" },
  { key: "bottom" as const, symbol: "↓", ariaLabel: "Bottom inset" },
] as const;

/**
 * Clamps a number between min and max values
 */
function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function ConfigPanel({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const selectedComponent = useSelectedComponent();
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();

  const {
    locale,
    maxHeight,
    safeAreaInsets,
    setSelectedComponent,
    setDisplayMode,
    setDeviceType,
    setTheme,
    setLocale,
    setMaxHeight,
    setSafeAreaInsets,
  } = useWorkbenchStore(
    useShallow((s) => ({
      locale: s.locale,
      maxHeight: s.maxHeight,
      safeAreaInsets: s.safeAreaInsets,
      setSelectedComponent: s.setSelectedComponent,
      setDisplayMode: s.setDisplayMode,
      setDeviceType: s.setDeviceType,
      setTheme: s.setTheme,
      setLocale: s.setLocale,
      setMaxHeight: s.setMaxHeight,
      setSafeAreaInsets: s.setSafeAreaInsets,
    })),
  );

  // Collapsed state view
  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center py-3">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="scrollbar-subtle flex h-full min-w-80 flex-col overflow-y-auto">
      {/* Collapse button */}
      <div className="flex items-center justify-end px-2 py-2">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["component", "display", "advanced"]}
      >
        {/* Component Selection */}
        <AccordionItem value="component">
          <AccordionTrigger className="text-muted-foreground/80 px-5 text-xs font-medium tracking-wide">
            <span>Component</span>
          </AccordionTrigger>
          <AccordionContent className="px-5 pt-2 pb-4">
            <div className="space-y-3">
              <Select
                value={selectedComponent}
                onValueChange={setSelectedComponent}
              >
                <SelectTrigger className={WORKBENCH_SELECT_CLASSES}>
                  <SelectValue placeholder="Select component" />
                </SelectTrigger>
                <SelectContent>
                  {workbenchComponents.map((comp) => (
                    <SelectItem
                      className="py-2 text-xs"
                      key={comp.id}
                      value={comp.id}
                    >
                      {comp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Import placeholder */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled
              >
                <Import className="size-4" />
                Import (coming soon)
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Display Settings */}
        <AccordionItem value="display">
          <AccordionTrigger className="text-muted-foreground/80 px-5 text-xs font-medium tracking-wide">
            <span>Display</span>
          </AccordionTrigger>
          <AccordionContent className="px-5 pt-2 pb-4">
            <div className="space-y-4">
              {/* Display Mode */}
              <div className="space-y-2">
                <Label className="text-xs font-normal tracking-wide">
                  Mode
                </Label>
                <ButtonGroup className="w-full">
                  {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={displayMode === id ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 gap-2 text-xs font-light"
                      onClick={() => setDisplayMode(id)}
                    >
                      <Icon className="text-yellow size-3" />
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              {/* Device Type */}
              <div className="space-y-2">
                <Label className="text-xs">Device</Label>
                <ButtonGroup className="w-full">
                  {DEVICE_TYPES.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={deviceType === id ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 gap-2 text-xs font-light"
                      onClick={() => setDeviceType(id)}
                    >
                      <Icon className="text-yellow size-3" />
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle" className="text-xs">
                  Dark Theme
                </Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>

              {/* Locale Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Locale</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger className={WORKBENCH_SELECT_CLASSES}>
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
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Settings */}
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-muted-foreground/80 px-5 text-xs font-medium tracking-wide">
            <span>Advanced</span>
          </AccordionTrigger>
          <AccordionContent className="px-5 pt-2 pb-4">
            <div className="space-y-4">
              {/* Max Height */}
              <div className="space-y-2">
                <Label htmlFor="max-height" className="text-xs">
                  Max Height
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id="max-height"
                    type="number"
                    value={maxHeight}
                    onChange={(e) => {
                      const clamped = clamp(Number(e.target.value), 100, 2000);
                      setMaxHeight(clamped);
                    }}
                    className="bg-accent hover:bg-accent/80 placeholder:text-muted-foreground focus-visible:ring-ring disabled:text-yellow flex h-9 w-full rounded-md border-0 px-3 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
                    min={100}
                    max={2000}
                  />
                </InputGroup>
              </div>

              {/* Safe Area Insets */}
              <div className="space-y-2">
                <Label className="text-xs">Safe Area Insets</Label>
                <div className="grid max-w-48 grid-cols-2 gap-2">
                  {SAFE_AREA_INSETS.map(({ key, symbol, ariaLabel }) => (
                    <InputGroup key={key}>
                      <InputGroupAddon>
                        <InputGroupText>{symbol}</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id={`inset-${key}`}
                        type="number"
                        value={safeAreaInsets[key]}
                        onChange={(e) => {
                          const clamped = clamp(Number(e.target.value), 0, 100);
                          setSafeAreaInsets({ [key]: clamped });
                        }}
                        min={0}
                        max={100}
                        aria-label={ariaLabel}
                        className={WORKBENCH_INPUT_CLASSES}
                      />
                    </InputGroup>
                  ))}
                </div>
              </div>

              {/* User Agent Info (Read-only) */}
              <div className="space-y-2">
                <Label className="text-xs">User Agent</Label>
                <div className="bg-muted text-muted-foreground rounded-md border p-2 text-xs">
                  <div>
                    Device: <span className="font-mono">{deviceType}</span>
                  </div>
                  <div>
                    Hover:{" "}
                    <span className="font-mono">
                      {deviceType === "desktop" ? "true" : "false"}
                    </span>
                  </div>
                  <div>
                    Touch:{" "}
                    <span className="font-mono">
                      {deviceType !== "desktop" ? "true" : "false"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
