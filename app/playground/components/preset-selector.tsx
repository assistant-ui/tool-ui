import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { PresetName, presetDescriptions } from "@/lib/sample-data";

interface PresetSelectorProps {
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
}

const presetNames: PresetName[] = [
  "stocks",
  "tasks",
  "metrics",
  "resources",
  "layout",
  "localized",
  "large",
  "empty",
];

export function PresetSelector({
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  return (
    <ItemGroup className="gap-1">
      {presetNames.map((preset) => (
        <Item
          key={preset}
          variant="default"
          size="sm"
          className={
            currentPreset === preset
              ? "bg-background dark:bg-muted cursor-pointer"
              : "hover:border-border cursor-pointer"
          }
          onClick={() => onSelectPreset(preset)}
        >
          <ItemContent className="transform-gpu transition-transform duration-150 ease-out will-change-transform active:scale-[0.98]">
            <div className="relative flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-1">
                <ItemTitle className="flex w-full items-center justify-between capitalize">
                  <span className="text-foreground">
                    {preset.replace("-", " ")}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {presetDescriptions[preset]}
                </ItemDescription>
              </div>
              {currentPreset === preset ? (
                <span className="text-muted-foreground dark:text-foreground bg-foreground absolute top-0 -left-4 h-5 w-1 rounded-full"></span>
              ) : null}
            </div>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
