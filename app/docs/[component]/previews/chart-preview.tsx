"use client";

import { useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Chart } from "@/components/tool-ui/chart";
import { type ChartPresetName, chartPresets } from "@/lib/presets/chart";
import { usePresetParam } from "@/hooks/use-preset-param";

export function ChartPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const { currentPreset, setPreset } = usePresetParam<ChartPresetName>({
    presets: chartPresets,
    defaultPreset: "revenue",
  });

  const [isLoading, setIsLoading] = useState(false);

  const currentData = chartPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as ChartPresetName);
    setIsLoading(false);
  };

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="chart"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(_isLoading) => (
        <Chart id={`chart-${currentPreset}`} {...currentData} />
      )}
      renderCodePanel={(_isLoading) => (
        <CodePanel
          className="h-full w-full"
          componentId="chart"
          chartPreset={currentPreset}
          mode="plain"
        />
      )}
    />
  );
}
