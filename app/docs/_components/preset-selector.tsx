import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { type ComponentId, previewConfigs } from "@/lib/docs/preview-config";
import { cn } from "@/lib/ui/cn";

function formatPresetName(preset: string): string {
  return preset.replaceAll("-", " ").replaceAll("_", " ");
}

interface PresetSelectorProps {
  componentId: ComponentId;
  currentPreset: string;
  onSelectPreset: (preset: string) => void;
}

export function PresetSelector({
  componentId,
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  const config = previewConfigs[componentId];
  const presets = config.presets;
  const presetNames = Object.keys(presets);

  return (
    <ItemGroup className="gap-1">
      {presetNames.map((name) => (
        <PresetItem
          key={name}
          preset={name}
          description={presets[name].description}
          isSelected={currentPreset === name}
          onSelect={onSelectPreset}
        />
      ))}
    </ItemGroup>
  );
}

interface PresetItemProps {
  preset: string;
  description: string;
  isSelected: boolean;
  onSelect: (preset: string) => void;
}

function PresetItem({
  preset,
  description,
  isSelected,
  onSelect,
}: PresetItemProps) {
  return (
    <Item
      variant="default"
      size="sm"
      data-selected={isSelected}
      className={cn(
        "group/item relative py-[2px] pb-[2px] lg:py-3!",
        isSelected
          ? "bg-muted cursor-pointer border-transparent"
          : "hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
      )}
      onClick={() => onSelect(preset)}
    >
      <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.3,-0.55,0.27,1.55)] will-change-transform select-none group-active/item:scale-[0.98] group-active/item:duration-100 group-active/item:ease-out">
        <div className="relative flex items-start justify-between">
          <div className="flex flex-1 flex-col gap-0 lg:gap-1">
            <ItemTitle className="flex w-full items-center justify-between capitalize">
              <span className="text-foreground">
                {formatPresetName(preset)}
              </span>
            </ItemTitle>
            <ItemDescription className="text-sm font-light">
              {description}
            </ItemDescription>
          </div>
        </div>
        <SelectionIndicator isSelected={isSelected} />
      </ItemContent>
    </Item>
  );
}

interface SelectionIndicatorProps {
  isSelected: boolean;
}

function SelectionIndicator({ isSelected }: SelectionIndicatorProps) {
  return (
    <span
      aria-hidden="true"
      data-selected={isSelected}
      className="bg-foreground absolute top-2.5 -left-4.5 h-0 w-1 -translate-y-1/2 transform-gpu rounded-full opacity-0 transition-[height,opacity,transform] delay-100 duration-200 ease-in-out data-[selected=true]:h-5 data-[selected=true]:opacity-100"
    />
  );
}
