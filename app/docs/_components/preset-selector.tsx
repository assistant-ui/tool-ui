import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { ChartPresetName, chartPresetDescriptions } from "@/lib/presets/chart";
import {
  CodeBlockPresetName,
  codeBlockPresetDescriptions,
} from "@/lib/presets/code-block";
import { PresetName, presetDescriptions } from "@/lib/presets/data-table";
import {
  MediaCardPresetName,
  mediaCardPresetDescriptions,
} from "@/lib/presets/media-card";
import {
  OptionListPresetName,
  optionListPresetDescriptions,
} from "@/lib/presets/option-list";
import { PlanPresetName, planPresetDescriptions } from "@/lib/presets/plan";
import {
  TerminalPresetName,
  terminalPresetDescriptions,
} from "@/lib/presets/terminal";
import { cn } from "@/lib/ui/cn";

type ComponentPreset =
  | ChartPresetName
  | CodeBlockPresetName
  | MediaCardPresetName
  | OptionListPresetName
  | PlanPresetName
  | PresetName
  | TerminalPresetName;

type PresetDescriptions = Partial<Record<ComponentPreset, string>>;

const PRESET_REGISTRY: Record<string, PresetDescriptions> = {
  chart: chartPresetDescriptions,
  "code-block": codeBlockPresetDescriptions,
  "data-table": presetDescriptions,
  "media-card": mediaCardPresetDescriptions,
  "option-list": optionListPresetDescriptions,
  plan: planPresetDescriptions,
  terminal: terminalPresetDescriptions,
};

const DEFAULT_COMPONENT = "option-list";

function getPresetDescriptions(componentId: string): PresetDescriptions {
  return PRESET_REGISTRY[componentId] ?? PRESET_REGISTRY[DEFAULT_COMPONENT];
}

function formatPresetName(preset: string): string {
  return preset.replaceAll("-", " ").replaceAll("_", " ");
}

interface PresetSelectorProps {
  componentId: string;
  currentPreset: ComponentPreset;
  onSelectPreset: (preset: ComponentPreset) => void;
}

export function PresetSelector({
  componentId,
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  const descriptions = getPresetDescriptions(componentId);
  const presets = Object.keys(descriptions) as ComponentPreset[];

  return (
    <ItemGroup className="gap-1">
      {presets.map((preset) => (
        <PresetItem
          key={preset}
          preset={preset}
          description={descriptions[preset] ?? ""}
          isSelected={currentPreset === preset}
          onSelect={onSelectPreset}
        />
      ))}
    </ItemGroup>
  );
}

interface PresetItemProps {
  preset: ComponentPreset;
  description: string;
  isSelected: boolean;
  onSelect: (preset: ComponentPreset) => void;
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
          ? "bg-muted cursor-pointer border-transparent shadow-xs"
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
      className="bg-foreground absolute top-2.5 -left-4.5 h-0 w-1 -translate-y-1/2 transform-gpu rounded-full opacity-0 transition-[height,opacity,transform] delay-100 duration-200 ease-in-out data-[selected=true]:h-5 data-[selected=true]:opacity-100"
    />
  );
}
