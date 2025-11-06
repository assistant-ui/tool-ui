import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinearBlur } from "@/components/ui/linear-blur";
import { PresetSelector } from "./preset-selector";
import { PresetName } from "@/lib/sample-data";
import { SocialPostPresetName } from "@/lib/social-post-presets";
import { MediaCardPresetName } from "@/lib/media-card-presets";

interface ControlsPanelProps {
  componentId: string;
  currentPreset: PresetName | SocialPostPresetName | MediaCardPresetName;
  onSelectPreset: (
    preset: PresetName | SocialPostPresetName | MediaCardPresetName,
  ) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  sort: { by?: string; direction?: "asc" | "desc" };
  onSortChange: (next: { by?: string; direction?: "asc" | "desc" }) => void;
  emptyMessage: string;
  onEmptyMessageChange: (message: string) => void;
  mediaCardMaxWidth?: string;
  onMediaCardMaxWidthChange?: (value: string) => void;
}

export function ControlsPanel({
  componentId,
  currentPreset,
  onSelectPreset,
  isLoading,
  onLoadingChange,
  sort,
  onSortChange,
  emptyMessage,
  onEmptyMessageChange,
  mediaCardMaxWidth,
  onMediaCardMaxWidthChange,
}: ControlsPanelProps) {
  const isDataTable = componentId === "data-table";
  const isSocialPost = componentId === "social-post";
  const isMediaCard = componentId === "media-card";

  return (
    <div className="flex h-full flex-col">
      <Tabs defaultValue="presets" className="flex min-h-0 flex-1 flex-col">
        <div className="sticky top-0 z-20">
          <div className="relative">
            <LinearBlur
              side="top"
              tint="hsl(var(--background) / 0.6)"
              className="absolute inset-0 h-[150%]"
              strength={100}
              steps={6}
            />

            <div className="relative flex items-center justify-center pt-2 pb-4">
              <TabsList className="flex gap-2 rounded-lg bg-transparent text-sm font-light">
                <TabsTrigger
                  value="presets"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Presets
                </TabsTrigger>
                <TabsTrigger
                  value="config"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Config
                </TabsTrigger>
                <TabsTrigger
                  value="state"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  State
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="presets" className="flex flex-col gap-4 px-3 pb-24">
          <PresetSelector
            componentId={componentId}
            currentPreset={currentPreset}
            onSelectPreset={onSelectPreset}
          />
        </TabsContent>

        <TabsContent
          value="config"
          className="m-0 flex flex-col gap-3 px-2 pb-24"
        >
          {isDataTable && (
            <ItemGroup>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Empty state</ItemTitle>
                  <ItemDescription>
                    Message displayed when the table has no rows.
                  </ItemDescription>
                  <div className="mt-3 flex flex-col gap-2">
                    <Label htmlFor="empty-message" className="text-xs">
                      Empty message
                    </Label>
                    <Input
                      id="empty-message"
                      value={emptyMessage}
                      onChange={(event) =>
                        onEmptyMessageChange(event.target.value)
                      }
                      placeholder="No data available"
                    />
                  </div>
                </ItemContent>
              </Item>
            </ItemGroup>
          )}

          {isSocialPost && (
            <ItemGroup>
              <Item variant="outline">
                <ItemContent>
                  <ItemDescription className="text-muted-foreground text-sm">
                    No additional configuration options for social posts.
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          )}

          {isMediaCard && (
            <ItemGroup>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Layout</ItemTitle>
                  <ItemDescription>
                    Optionally clamp the card width to suit chat bubbles.
                  </ItemDescription>
                  <div className="mt-3 grid gap-1.5">
                    <Label htmlFor="media-card-max-width" className="text-xs">
                      Max width
                    </Label>
                    <Input
                      id="media-card-max-width"
                      value={mediaCardMaxWidth ?? ""}
                      onChange={(event) =>
                        onMediaCardMaxWidthChange?.(event.target.value)
                      }
                      placeholder="e.g. 420px (leave empty for auto)"
                    />
                  </div>
                </ItemContent>
              </Item>
            </ItemGroup>
          )}
        </TabsContent>

        <TabsContent
          value="state"
          className="m-0 flex flex-col gap-3 px-2 pb-24"
        >
          <ItemGroup className="gap-3">
            <Item variant="outline">
              <ItemContent>
                <div
                  className="flex cursor-pointer items-center justify-between gap-4"
                  onClick={() => onLoadingChange(!isLoading)}
                >
                  <Label
                    htmlFor="loading-state"
                    className="cursor-pointer text-sm"
                  >
                    Show loading
                  </Label>
                  <Switch
                    id="loading-state"
                    checked={isLoading}
                    onCheckedChange={onLoadingChange}
                  />
                </div>
              </ItemContent>
            </Item>

            {isDataTable && (
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Sort options</ItemTitle>
                  <ItemDescription>
                    Control the initial sorting applied to the table.
                  </ItemDescription>
                  <div className="mt-3 grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="sort-by" className="text-xs">
                        Sort column
                      </Label>
                      <Input
                        id="sort-by"
                        value={sort.by || ""}
                        onChange={(event) =>
                          onSortChange({
                            by: event.target.value || undefined,
                            direction: sort.direction,
                          })
                        }
                        placeholder="Column key (e.g., price)"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="sort-direction" className="text-xs">
                        Sort direction
                      </Label>
                      <select
                        id="sort-direction"
                        value={sort.direction || ""}
                        onChange={(event) =>
                          onSortChange({
                            by: sort.by,
                            direction:
                              (event.target.value as "asc" | "desc") ||
                              undefined,
                          })
                        }
                        className="border-input bg-background focus-visible:ring-ring focus-visible:ring-offset-background flex h-9 w-full items-center rounded-md border px-3 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">None</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>
                </ItemContent>
              </Item>
            )}
          </ItemGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}
