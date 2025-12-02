"use client";

import { useState, useEffect } from "react";
import {
  useWorkbenchStore,
  useSelectedComponent,
  useDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
  useToolInput,
  useToolOutput,
} from "@/lib/workbench/store";
import { LOCALE_OPTIONS } from "@/lib/workbench/types";
import { workbenchComponents, getComponent } from "@/lib/workbench/component-registry";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Square,
  PictureInPicture2,
  Import,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronDown className="text-muted-foreground size-4" />
        ) : (
          <ChevronRight className="text-muted-foreground size-4" />
        )}
      </button>
      {isOpen && <div className="space-y-4 px-4 pb-4">{children}</div>}
    </div>
  );
}

function JsonEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Sync text state when value prop changes (e.g., switching components)
  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  const handleChange = (newText: string) => {
    setText(newText);
    try {
      const parsed = JSON.parse(newText);
      setError(null);
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="font-mono text-xs"
        rows={6}
      />
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}

export function ConfigPanel() {
  const selectedComponent = useSelectedComponent();
  const displayMode = useDisplayMode();
  const theme = useWorkbenchTheme();
  const deviceType = useDeviceType();
  const toolInput = useToolInput();
  const toolOutput = useToolOutput();

  const store = useWorkbenchStore();

  // Handle component selection with default props
  const handleComponentChange = (componentId: string) => {
    const component = getComponent(componentId);
    if (component) {
      store.setToolInput(component.defaultProps);
      store.setToolOutput({});
    }
    store.setSelectedComponent(componentId);
  };

  return (
    <div className="scrollbar-subtle flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-semibold">Workbench</h2>
        <p className="text-muted-foreground text-xs">Test Tool UI components</p>
      </div>

      {/* Component Selection */}
      <CollapsibleSection title="Component">
        <div className="space-y-3">
          <Select value={selectedComponent} onValueChange={handleComponentChange}>
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
      </CollapsibleSection>

      {/* Display Settings */}
      <CollapsibleSection title="Display">
        <div className="space-y-4">
          {/* Display Mode */}
          <div className="space-y-2">
            <Label className="text-xs">Display Mode</Label>
            <ButtonGroup className="w-full">
              <Button
                variant={displayMode === "inline" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDisplayMode("inline")}
              >
                <Square className="size-3" />
                Inline
              </Button>
              <Button
                variant={displayMode === "pip" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDisplayMode("pip")}
              >
                <PictureInPicture2 className="size-3" />
                PiP
              </Button>
              <Button
                variant={displayMode === "fullscreen" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDisplayMode("fullscreen")}
              >
                <Maximize2 className="size-3" />
                Full
              </Button>
            </ButtonGroup>
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <Label className="text-xs">Device</Label>
            <ButtonGroup className="w-full">
              <Button
                variant={deviceType === "desktop" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDeviceType("desktop")}
              >
                <Monitor className="size-3" />
                Desktop
              </Button>
              <Button
                variant={deviceType === "tablet" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDeviceType("tablet")}
              >
                <Tablet className="size-3" />
                Tablet
              </Button>
              <Button
                variant={deviceType === "mobile" ? "secondary" : "outline"}
                size="sm"
                className="flex-1 gap-1"
                onClick={() => store.setDeviceType("mobile")}
              >
                <Smartphone className="size-3" />
                Mobile
              </Button>
            </ButtonGroup>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle" className="text-xs">
              Dark Mode
            </Label>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={(checked) => store.setTheme(checked ? "dark" : "light")}
            />
          </div>

          {/* Locale */}
          <div className="space-y-2">
            <Label className="text-xs">Locale</Label>
            <Select value={store.locale} onValueChange={store.setLocale}>
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
      </CollapsibleSection>

      {/* Tool Data */}
      <CollapsibleSection title="Tool Data">
        <div className="space-y-4">
          <JsonEditor
            label="toolInput"
            value={toolInput}
            onChange={store.setToolInput}
          />
          <JsonEditor
            label="toolOutput"
            value={toolOutput}
            onChange={store.setToolOutput}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
