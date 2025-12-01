"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  WeatherWidgetPresetName,
  weatherWidgetPresetDescriptions,
} from "@/lib/presets/weather-widget";
import { cn } from "@/lib/ui/cn";

interface WeatherWidgetPresetSelectorProps {
  currentPreset: WeatherWidgetPresetName;
  onSelectPreset: (preset: WeatherWidgetPresetName) => void;
}

const weatherWidgetPresetNames: WeatherWidgetPresetName[] = [
  "sunny-day",
  "rainy-afternoon",
  "snowy-night",
  "stormy-dusk",
  "cloudy-dawn",
  "with-actions",
];

export function WeatherWidgetPresetSelector({
  currentPreset,
  onSelectPreset,
}: WeatherWidgetPresetSelectorProps) {
  return (
    <ItemGroup className="gap-1">
      {weatherWidgetPresetNames.map((preset) => (
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
                    {preset.replace(/-/g, " ")}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {weatherWidgetPresetDescriptions[preset]}
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
