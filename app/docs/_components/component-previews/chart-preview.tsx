"use client";

import { useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../preset-selector";
import { CodePanel } from "../code-panel";
import { Chart } from "@/components/tool-ui/chart";
import { type ChartPresetName, chartPresets } from "@/lib/presets/chart";
import { usePresetParam } from "@/hooks/use-preset-param";

export function ChartPreview() {
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
      isLoading={isLoading}
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
      renderCodePanel={(_isLoading, onCodeChange) => (
        <CodePanel
          className="h-full w-full"
          componentId="chart"
          chartPreset={currentPreset}
          mode="plain"
          onCodeChange={onCodeChange}
        />
      )}
    />
  );
}
