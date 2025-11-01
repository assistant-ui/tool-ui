import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresetSelector } from "./preset-selector";
import { PresetName } from "@/lib/sample-data";

interface ControlsPanelProps {
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortChange: (sortBy?: string, direction?: "asc" | "desc") => void;
  emptyMessage: string;
  onEmptyMessageChange: (message: string) => void;
}

export function ControlsPanel({
  currentPreset,
  onSelectPreset,
  isLoading,
  onLoadingChange,
  sortBy,
  sortDirection,
  onSortChange,
  emptyMessage,
  onEmptyMessageChange,
}: ControlsPanelProps) {
  return (
    <Tabs defaultValue="presets" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="presets">Presets</TabsTrigger>
        <TabsTrigger value="config">Config</TabsTrigger>
        <TabsTrigger value="state">State</TabsTrigger>
      </TabsList>

      <TabsContent value="presets" className="space-y-4">
        <PresetSelector
          currentPreset={currentPreset}
          onSelectPreset={onSelectPreset}
        />
      </TabsContent>

      <TabsContent value="config" className="space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
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

      <TabsContent value="state" className="space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort Column</Label>
              <Input
                id="sort-by"
                value={sortBy || ""}
                onChange={(e) =>
                  onSortChange(e.target.value || undefined, sortDirection)
                }
                placeholder="Column key (e.g., price)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-direction">Sort Direction</Label>
              <select
                id="sort-direction"
                value={sortDirection || ""}
                onChange={(e) =>
                  onSortChange(
                    sortBy,
                    (e.target.value as "asc" | "desc") || undefined,
                  )
                }
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
  );
}
