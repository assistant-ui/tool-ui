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

const SMALL_TEXT_CLASSES = "text-xs font-normal";
const INPUT_CLASSES =
  "bg-accent hover:bg-accent/80 focus:ring-ring border-0! transition-colors focus:ring-2 border-none!";
const SELECT_CLASSES = `${INPUT_CLASSES} w-fit text-xs border-none!`;
const TOGGLE_BUTTON_CLASSES = "flex-1 gap-2 border-none text-xs font-light";
const SECTION_HEADER_CLASSES =
  "text-muted-foreground/80 px-5 text-xs font-medium tracking-wide";
const SECTION_CONTENT_CLASSES = "px-5 pt-2 pb-4";
const PANEL_TOGGLE_CLASSES =
  "text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors";

const DISPLAY_MODES: ReadonlyArray<{
  id: DisplayMode;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "inline", label: "Inline", icon: Square },
  { id: "pip", label: "PiP", icon: PictureInPicture2 },
  { id: "fullscreen", label: "Full", icon: Maximize2 },
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

const SAFE_AREA_INSETS = [
  { key: "left" as const, symbol: "←", ariaLabel: "Left inset" },
  { key: "top" as const, symbol: "↑", ariaLabel: "Top inset" },
  { key: "right" as const, symbol: "→", ariaLabel: "Right inset" },
  { key: "bottom" as const, symbol: "↓", ariaLabel: "Bottom inset" },
] as const;

interface ConfigPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SettingRowProps {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

interface ConfigSectionProps {
  value: string;
  title: string;
  children: React.ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function SettingRow({ label, htmlFor, className, children }: SettingRowProps) {
  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      <Label htmlFor={htmlFor} className={SMALL_TEXT_CLASSES}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function ConfigSection({ value, title, children }: ConfigSectionProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className={SECTION_HEADER_CLASSES}>
        <span>{title}</span>
      </AccordionTrigger>
      <AccordionContent className={SECTION_CONTENT_CLASSES}>
        <div className="space-y-4">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function UserAgentInfo({ deviceType }: { deviceType: DeviceType }) {
  const isDesktop = deviceType === "desktop";

  return (
    <div className="bg-muted text-muted-foreground rounded-md border p-2 text-xs">
      <div>
        Device: <span className="font-mono">{deviceType}</span>
      </div>
      <div>
        Hover: <span className="font-mono">{isDesktop ? "true" : "false"}</span>
      </div>
      <div>
        Touch:{" "}
        <span className="font-mono">{!isDesktop ? "true" : "false"}</span>
      </div>
    </div>
  );
}

export function ConfigPanel({
  isCollapsed,
  onToggleCollapse,
}: ConfigPanelProps) {
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

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center py-3">
        <button
          onClick={onToggleCollapse}
          className={`${PANEL_TOGGLE_CLASSES} p-2`}
          aria-label="Expand sidebar"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="scrollbar-subtle flex h-full min-w-80 flex-col overflow-y-auto">
      <div className="flex items-center justify-end px-2 py-2">
        <button
          onClick={onToggleCollapse}
          className={`${PANEL_TOGGLE_CLASSES} p-1.5`}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["component", "display", "advanced"]}
      >
        <AccordionItem value="component">
          <AccordionTrigger className={SECTION_HEADER_CLASSES}>
            <span>Component</span>
          </AccordionTrigger>
          <AccordionContent className={SECTION_CONTENT_CLASSES}>
            <div className="space-y-3">
              <Select
                value={selectedComponent}
                onValueChange={setSelectedComponent}
              >
                <SelectTrigger className={SELECT_CLASSES}>
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

        <ConfigSection value="display" title="Display">
          <SettingRow label="Mode">
            <ButtonGroup>
              {DISPLAY_MODES.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={displayMode === id ? "secondary" : "outline"}
                  size="sm"
                  className={TOGGLE_BUTTON_CLASSES}
                  onClick={() => setDisplayMode(id)}
                >
                  <Icon className="text-yellow size-3" />
                  {label}
                </Button>
              ))}
            </ButtonGroup>
          </SettingRow>

          <SettingRow label="Device">
            <ButtonGroup>
              {DEVICE_TYPES.map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant={deviceType === id ? "secondary" : "outline"}
                  size="sm"
                  className={TOGGLE_BUTTON_CLASSES}
                  onClick={() => setDeviceType(id)}
                >
                  <Icon className="text-yellow size-3" />
                </Button>
              ))}
            </ButtonGroup>
          </SettingRow>

          <SettingRow label="Dark Theme" htmlFor="theme-toggle" className="h-9">
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </SettingRow>

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
        </ConfigSection>

        <ConfigSection value="advanced" title="Advanced">
          <div className="space-y-2">
            <Label htmlFor="max-height" className={SMALL_TEXT_CLASSES}>
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
                className={SMALL_TEXT_CLASSES}
              >
                px
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label className={SMALL_TEXT_CLASSES}>Safe Area Insets</Label>
            <div className="grid max-w-48 grid-cols-2 gap-2">
              {SAFE_AREA_INSETS.map(({ key, symbol, ariaLabel }) => (
                <InputGroup key={key} className="border-none">
                  <InputGroupAddon className={SMALL_TEXT_CLASSES}>
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
                    className={INPUT_CLASSES}
                  />
                </InputGroup>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className={SMALL_TEXT_CLASSES}>User Agent</Label>
            <UserAgentInfo deviceType={deviceType} />
          </div>
        </ConfigSection>
      </Accordion>
    </div>
  );
}
