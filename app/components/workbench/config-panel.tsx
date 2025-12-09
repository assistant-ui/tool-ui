"use client";

import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
} from "@/lib/workbench/store";
import {
  LOCALE_OPTIONS,
  type DisplayMode,
  type DeviceType,
} from "@/lib/workbench/types";
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
import { SafeAreaInsetsControl } from "./safe-area-insets-control";
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
import {
  INPUT_GROUP_CLASSES,
  INPUT_CLASSES,
  ADDON_CLASSES,
  LABEL_CLASSES,
  SELECT_CLASSES,
  TOGGLE_BUTTON_CLASSES,
  TOGGLE_BUTTON_ACTIVE_CLASSES,
  PANEL_TOGGLE_CLASSES,
} from "./styles";

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

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
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

export function ConfigPanel({
  isCollapsed,
  onToggleCollapse,
}: ConfigPanelProps) {
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();

  const {
    locale,
    maxHeight,
    safeAreaInsets,
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
    <div className="flex h-full min-w-80 flex-col">
      <div className="scrollbar-subtle flex-1 space-y-2 overflow-y-auto px-4">
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

        {displayMode === "inline" && (
          <SettingRow label="Inline max height" htmlFor="max-height">
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

        <SettingRow label="Safe area">
          <SafeAreaInsetsControl
            value={safeAreaInsets}
            onChange={setSafeAreaInsets}
          />
        </SettingRow>

        <SettingRow label="Dark theme" htmlFor="theme-toggle">
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
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
      </div>

      <div className="flex items-center justify-end px-2 py-2">
        <button
          onClick={onToggleCollapse}
          className={`${PANEL_TOGGLE_CLASSES} p-1.5`}
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>
    </div>
  );
}
