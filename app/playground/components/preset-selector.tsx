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
              ? "bg-muted cursor-pointer"
              : "hover:border-border cursor-pointer"
          }
          onClick={() => onSelectPreset(preset)}
        >
          <ItemContent className="transform-gpu transition-transform duration-150 ease-out will-change-transform active:scale-[0.98]">
            <div className="flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-1">
                <ItemTitle className="capitalize">
                  {preset.replace("-", " ")}
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {presetDescriptions[preset]}
                </ItemDescription>
              </div>
            </div>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
