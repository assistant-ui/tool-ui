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
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";

// Workbench-specific input styling constants
const WORKBENCH_INPUT_CLASSES =
  "bg-accent hover:bg-accent/80 focus:ring-ring border-0! transition-colors focus:ring-2 border-none!";

const WORKBENCH_SELECT_CLASSES = `${WORKBENCH_INPUT_CLASSES} w-fit text-xs border-none!`;

const WORKBENCH_LABEL_CLASSES = "text-xs font-normal";

const WORKBENCH_ADDON_CLASSES = "text-xs font-normal";

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
              <div className="flex flex-row items-center justify-between">
                <Label className={`${WORKBENCH_LABEL_CLASSES} tracking-wide`}>
                  Mode
                </Label>
                <ButtonGroup>
                  {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={displayMode === id ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 gap-2 border-none text-xs font-light"
                      onClick={() => setDisplayMode(id)}
                    >
                      <Icon className="text-yellow size-3" />
                      {label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label className={WORKBENCH_LABEL_CLASSES}>Device</Label>
                <ButtonGroup>
                  {DEVICE_TYPES.map(({ id, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={deviceType === id ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 gap-2 border-none text-xs font-light"
                      onClick={() => setDeviceType(id)}
                    >
                      <Icon className="text-yellow size-3" />
                    </Button>
                  ))}
                </ButtonGroup>
              </div>

              <div className="flex h-9 items-center justify-between">
                <Label
                  htmlFor="theme-toggle"
                  className={WORKBENCH_LABEL_CLASSES}
                >
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

              <div className="flex items-center justify-between">
                <Label className={WORKBENCH_LABEL_CLASSES}>Locale</Label>
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
                <Label htmlFor="max-height" className={WORKBENCH_LABEL_CLASSES}>
                  Max Height
                </Label>
                <InputGroup className="w-fit border-none">
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
                  />
                  <InputGroupAddon
                    align="inline-end"
                    className={WORKBENCH_ADDON_CLASSES}
                  >
                    px
                  </InputGroupAddon>
                </InputGroup>
              </div>

              {/* Safe Area Insets */}
              <div className="space-y-2">
                <Label className={WORKBENCH_LABEL_CLASSES}>
                  Safe Area Insets
                </Label>
                <div className="grid max-w-48 grid-cols-2 gap-2">
                  {SAFE_AREA_INSETS.map(({ key, symbol, ariaLabel }) => (
                    <InputGroup key={key} className="border-none">
                      <InputGroupAddon className={WORKBENCH_ADDON_CLASSES}>
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
                <Label className={WORKBENCH_LABEL_CLASSES}>User Agent</Label>
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
