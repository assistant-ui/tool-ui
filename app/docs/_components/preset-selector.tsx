import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { ChartPresetName, chartPresetDescriptions } from "@/lib/presets/chart";
import { PresetName, presetDescriptions } from "@/lib/presets/data-table";
import {
  MediaCardPresetName,
  mediaCardPresetDescriptions,
} from "@/lib/presets/media-card";
import {
  OptionListPresetName,
  optionListPresetDescriptions,
} from "@/lib/presets/option-list";
import { cn } from "@/lib/ui/cn";

type ComponentPreset =
  | ChartPresetName
  | PresetName
  | MediaCardPresetName
  | OptionListPresetName;

interface PresetSelectorProps {
  componentId: string;
  currentPreset: ComponentPreset;
  onSelectPreset: (preset: ComponentPreset) => void;
}

const dataTablePresetNames: PresetName[] = [
  "stocks",
  "tasks",
  "resources",
  "actions",
];

const mediaCardPresetNames: MediaCardPresetName[] = [
  "link",
  "image",
  "video",
  "audio",
  "actions",
];

const optionListPresetNames: OptionListPresetName[] = [
  "export",
  "travel",
  "notifications",
  "receipt",
  "actions",
];

const chartPresetNames: ChartPresetName[] = ["revenue", "performance", "minimal"];

export function PresetSelector({
  componentId,
  currentPreset,
  onSelectPreset,
}: PresetSelectorProps) {
  const presetNames =
    componentId === "chart"
      ? chartPresetNames
      : componentId === "data-table"
        ? dataTablePresetNames
        : componentId === "media-card"
          ? mediaCardPresetNames
          : optionListPresetNames;

  const descriptions =
    componentId === "chart"
      ? chartPresetDescriptions
      : componentId === "data-table"
        ? presetDescriptions
        : componentId === "media-card"
          ? mediaCardPresetDescriptions
          : optionListPresetDescriptions;

  return (
    <ItemGroup className="gap-1">
      {presetNames.map((preset) => (
        <Item
          key={preset}
          variant="default"
          size="sm"
          data-selected={currentPreset === preset}
          className={cn(
            "group/item relative py-[2px] pb-[2px] lg:py-3!",
            currentPreset === preset
              ? "bg-muted cursor-pointer border-transparent shadow-xs"
              : "hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
          )}
          onClick={() => onSelectPreset(preset)}
        >
          <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.3,-0.55,0.27,1.55)] will-change-transform group-active/item:scale-[0.98] group-active/item:duration-100 group-active/item:ease-out">
            <div className="relative flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-0 lg:gap-1">
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
