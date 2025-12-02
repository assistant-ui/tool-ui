"use client";

import { useShallow } from "zustand/react/shallow";
import {
  useWorkbenchStore,
  useSelectedComponent,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
} from "@/lib/workbench/store";
import { LOCALE_OPTIONS } from "@/lib/workbench/types";
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
  Box,
  Palette,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

export function ConfigPanel({ isCollapsed, onToggleCollapse }: { isCollapsed?: boolean; onToggleCollapse?: () => void }) {
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

  const handleComponentChange = (componentId: string) => {
    setSelectedComponent(componentId);
  };

  const clamp = (value: number, min: number, max: number) => {
    if (!Number.isFinite(value)) return min;
    if (value < min) return min;
    if (value > max) return max;
    return value;
  };

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
      <div className="flex items-center justify-end border-b px-2 py-2">
        <button
          onClick={onToggleCollapse}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <Accordion type="multiple" defaultValue={["component", "display", "advanced"]}>
        <AccordionItem value="component">
          <AccordionTrigger className="px-4">
            <div className="flex items-center gap-2">
              <Box className="size-4" />
              <span>Component</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
        <div className="space-y-3">
          <Select
            value={selectedComponent}
            onValueChange={handleComponentChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select component" />
            </SelectTrigger>
            <SelectContent>
              {workbenchComponents.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Import placeholder */}
          <Button variant="outline" size="sm" className="w-full gap-2" disabled>
            <Import className="size-4" />
            Import (coming soon)
          </Button>
        </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="display">
          <AccordionTrigger className="px-4">
            <div className="flex items-center gap-2">
              <Palette className="size-4" />
              <span>Display</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Display Mode</Label>
            <ButtonGroup className="w-full">
              <Button
                variant={displayMode === "inline" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDisplayMode("inline")}
              >
                <Square className="size-3" />
                Inline
              </Button>
              <Button
                variant={displayMode === "pip" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDisplayMode("pip")}
              >
                <PictureInPicture2 className="size-3" />
                PiP
              </Button>
              <Button
                variant={displayMode === "fullscreen" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDisplayMode("fullscreen")}
              >
                <Maximize2 className="size-3" />
                Full
              </Button>
            </ButtonGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Device</Label>
            <ButtonGroup className="w-full">
              <Button
                variant={deviceType === "desktop" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDeviceType("desktop")}
              >
                <Monitor className="size-3" />
                Desktop
              </Button>
              <Button
                variant={deviceType === "tablet" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDeviceType("tablet")}
              >
                <Tablet className="size-3" />
                Tablet
              </Button>
              <Button
                variant={deviceType === "mobile" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setDeviceType("mobile")}
              >
                <Smartphone className="size-3" />
                Mobile
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="text-xs">
              Dark Mode
            </Label>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Locale</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced">
          <AccordionTrigger className="px-4">
            <div className="flex items-center gap-2">
              <Settings className="size-4" />
              <span>Advanced</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-height" className="text-xs">
              maxHeight (px)
            </Label>
            <input
              id="max-height"
              type="number"
              value={maxHeight}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const clamped = clamp(raw, 100, 2000);
                setMaxHeight(clamped);
              }}
              className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              min={100}
              max={2000}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Safe Area Insets</Label>
            <div className="grid grid-cols-2 gap-2">
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>←</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="inset-left"
                  type="number"
                  value={safeAreaInsets.left}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = clamp(raw, 0, 100);
                    setSafeAreaInsets({ left: clamped });
                  }}
                  min={0}
                  max={100}
                  aria-label="Left inset"
                />
              </InputGroup>

              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>↑</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="inset-top"
                  type="number"
                  value={safeAreaInsets.top}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = clamp(raw, 0, 100);
                    setSafeAreaInsets({ top: clamped });
                  }}
                  min={0}
                  max={100}
                  aria-label="Top inset"
                />
              </InputGroup>

              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>→</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="inset-right"
                  type="number"
                  value={safeAreaInsets.right}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = clamp(raw, 0, 100);
                    setSafeAreaInsets({ right: clamped });
                  }}
                  min={0}
                  max={100}
                  aria-label="Right inset"
                />
              </InputGroup>

              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>↓</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="inset-bottom"
                  type="number"
                  value={safeAreaInsets.bottom}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const clamped = clamp(raw, 0, 100);
                    setSafeAreaInsets({ bottom: clamped });
                  }}
                  min={0}
                  max={100}
                  aria-label="Bottom inset"
                />
              </InputGroup>
            </div>
          </div>

          {/* User Agent (Read-only, computed from device) */}
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
