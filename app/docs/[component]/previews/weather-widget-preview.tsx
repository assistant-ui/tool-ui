"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { WeatherWidgetPresetSelector } from "../../_components/weather-widget-preset-selector";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import {
  WeatherWidgetPresetName,
  weatherWidgetPresets,
} from "@/lib/presets/weather-widget";

export function WeatherWidgetPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset: WeatherWidgetPresetName = "sunny-day";
  const initialPreset: WeatherWidgetPresetName =
    presetParam && presetParam in weatherWidgetPresets
      ? (presetParam as WeatherWidgetPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<WeatherWidgetPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in weatherWidgetPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as WeatherWidgetPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = weatherWidgetPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as WeatherWidgetPresetName;
      setCurrentPreset(presetName);
      setIsLoading(false);

      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", presetName);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <WeatherWidgetPresetSelector
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={() => (
        <div className="mx-auto" style={{ maxWidth: "480px" }}>
          <WeatherWidget
            {...currentConfig.widget}
            footerActions={currentConfig.footerActions}
            overrideTimeOfDay={currentConfig.overrideTimeOfDay}
            effectIntensity="normal"
            onFooterAction={(actionId) => {
              console.log("Weather widget action:", actionId);
              alert(`Action clicked: ${actionId}`);
            }}
          />
        </div>
      )}
      renderCodePanel={() => (
        <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
          Code panel coming soon
        </div>
      )}
    />
  );
}
