import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { PresetSelector } from "./preset-selector";
import { PresetName } from "@/lib/sample-data";

interface ControlsPanelProps {
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  sort: { by?: string; direction?: "asc" | "desc" };
  onSortChange: (next: { by?: string; direction?: "asc" | "desc" }) => void;
  emptyMessage: string;
  onEmptyMessageChange: (message: string) => void;
  onClose?: () => void;
}

export function ControlsPanel({
  currentPreset,
  onSelectPreset,
  isLoading,
  onLoadingChange,
  sort,
  onSortChange,
  emptyMessage,
  onEmptyMessageChange,
  onClose,
}: ControlsPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {onClose && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Controls</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            title="Close controls"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Tabs defaultValue="presets" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
        </TabsList>

      <TabsContent value="presets" className="flex flex-col gap-4">
        <PresetSelector
          currentPreset={currentPreset}
          onSelectPreset={onSelectPreset}
        />
      </TabsContent>

      <TabsContent value="config" className="flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="empty-message">Empty Message</Label>
              <Input
                id="empty-message"
                value={emptyMessage}
                onChange={(e) => onEmptyMessageChange(e.target.value)}
                placeholder="No data available"
              />
              <p className="text-xs text-muted-foreground">
                Message displayed when table has no rows
              </p>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="state" className="flex flex-col gap-4">
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="loading-state">Loading State</Label>
              <Switch
                id="loading-state"
                checked={isLoading}
                onCheckedChange={onLoadingChange}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Toggle skeleton loading state
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sort-by">Sort Column</Label>
              <Input
                id="sort-by"
                value={sort.by || ""}
                onChange={(e) => onSortChange({ by: e.target.value || undefined, direction: sort.direction })}
                placeholder="Column key (e.g., price)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sort-direction">Sort Direction</Label>
              <select
                id="sort-direction"
                value={sort.direction || ""}
                onChange={(e) => onSortChange({ by: sort.by, direction: (e.target.value as "asc" | "desc") || undefined })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None</option>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
    </div>
  );
}
