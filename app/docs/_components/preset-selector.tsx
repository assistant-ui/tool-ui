import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { chartPresets } from "@/lib/presets/chart";
import { citationPresets } from "@/lib/presets/citation";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { dataTablePresets } from "@/lib/presets/data-table";
import { imagePresets } from "@/lib/presets/image";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
import { videoPresets } from "@/lib/presets/video";
import { audioPresets } from "@/lib/presets/audio";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { itemCarouselPresets } from "@/lib/presets/item-carousel";
import { optionListPresets } from "@/lib/presets/option-list";
import { orderSummaryPresets } from "@/lib/presets/order-summary";
import { planPresets } from "@/lib/presets/plan";
import { terminalPresets } from "@/lib/presets/terminal";
import type { Preset } from "@/lib/presets/types";
import { cn } from "@/lib/ui/cn";

type PresetMap = Record<string, Preset<unknown>>;

const PRESET_REGISTRY: Record<string, PresetMap> = {
  "approval-card": approvalCardPresets,
  chart: chartPresets,
  citation: citationPresets,
  "code-block": codeBlockPresets,
  "data-table": dataTablePresets,
  image: imagePresets,
  "image-gallery": imageGalleryPresets,
  video: videoPresets,
  audio: audioPresets,
  "link-preview": linkPreviewPresets,
  "item-carousel": itemCarouselPresets,
  "option-list": optionListPresets,
  "order-summary": orderSummaryPresets,
  plan: planPresets,
  terminal: terminalPresets,
};

const DEFAULT_COMPONENT = "chart";

function getPresets(componentId: string): PresetMap {
  return PRESET_REGISTRY[componentId] ?? PRESET_REGISTRY[DEFAULT_COMPONENT];
}

function formatPresetName(preset: string): string {
  return preset.replaceAll("-", " ").replaceAll("_", " ");
}

interface PresetSelectorProps {
  componentId: string;
  currentPreset: string;
  onSelectPreset: (preset: string) => void;
}

export function PresetSelector({
  componentId,
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  const presets = getPresets(componentId);
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
          ? "bg-primary/5 cursor-pointer border-transparent shadow-xs"
          : "hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
      )}
      onClick={() => onSelect(preset)}
    >
      <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.3,-0.55,0.27,1.55)] will-change-transform group-active/item:scale-[0.98] group-active/item:duration-100 group-active/item:ease-out">
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
      className="bg-foreground absolute top-2.5 -left-4.5 h-5 w-1 origin-center -translate-y-1/2 scale-y-0 transform-gpu rounded-full opacity-0 transition-[opacity,transform] delay-100 duration-200 ease-out data-[selected=true]:scale-y-100 data-[selected=true]:opacity-100"
    />
  );
}
