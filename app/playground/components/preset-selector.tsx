import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { PresetName, presetDescriptions } from "@/lib/sample-data";
import { SocialPostPresetName, socialPostPresetDescriptions } from "@/lib/social-post-presets";
import { cn } from "@/lib/utils";

interface PresetSelectorProps {
  componentId: string;
  currentPreset: PresetName | SocialPostPresetName;
  onSelectPreset: (preset: PresetName | SocialPostPresetName) => void;
}

const dataTablePresetNames: PresetName[] = [
  "stocks",
  "tasks",
  "metrics",
  "resources",
  "layout",
  "localized",
  "large",
  "empty",
];

const socialPostPresetNames: SocialPostPresetName[] = [
  "x",
  "instagram",
  "tiktok",
  "linkedin",
];

export function PresetSelector({
  componentId,
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  const presetNames = componentId === "data-table" ? dataTablePresetNames : socialPostPresetNames;
  const descriptions = componentId === "data-table" ? presetDescriptions : socialPostPresetDescriptions;

  return (
    <ItemGroup className="gap-1">
      {presetNames.map((preset) => (
        <Item
          key={preset}
          variant="default"
          size="sm"
          data-selected={currentPreset === preset}
          className={cn(
            "group/item relative",
            currentPreset === preset
              ? "bg-background dark:bg-muted cursor-pointer border-transparent shadow-xs"
              : "hover:border-border hover:bg-background/20 active:bg-background/40 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
          )}
          onClick={() => onSelectPreset(preset)}
        >
          <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] will-change-transform group-active/item:scale-[0.98] group-active/item:duration-150 group-active/item:ease-out">
            <div className="relative flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-1">
                <ItemTitle className="flex w-full items-center justify-between capitalize">
                  <span className="text-foreground">
                    {preset.replace("-", " ").replace("_", " ")}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {descriptions[preset as keyof typeof descriptions]}
                </ItemDescription>
              </div>
            </div>
            <span
              aria-hidden="true"
              data-selected={currentPreset === preset}
              className="bg-foreground absolute top-2.5 -left-4.5 h-0 w-1 -translate-y-1/2 transform-gpu rounded-full opacity-0 transition-[height,opacity,transform] delay-100 duration-200 ease-in-out data-[selected=true]:h-5 data-[selected=true]:opacity-100"
            />
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
