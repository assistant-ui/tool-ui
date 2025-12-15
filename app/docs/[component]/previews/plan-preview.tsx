"use client";

import { useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Plan } from "@/components/tool-ui/plan";
import { type PlanPresetName, planPresets } from "@/lib/presets/plan";
import { usePresetParam } from "@/hooks/use-preset-param";

export function PlanPreview() {
  const { currentPreset, setPreset } = usePresetParam<PlanPresetName>({
    presets: planPresets,
    defaultPreset: "comprehensive",
  });

  const [isLoading, setIsLoading] = useState(false);

  const currentData = planPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as PlanPresetName);
    setIsLoading(false);
  };

  return (
    <ComponentPreviewShell
      isLoading={isLoading}
      presetSelector={
        <PresetSelector
          componentId="plan"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(_isLoading) => <Plan {...currentData} id="plan-preview" />}
      renderCodePanel={(_isLoading, onCodeChange) => (
        <CodePanel
          className="h-full w-full"
          componentId="plan"
          planPreset={currentPreset}
          mode="plain"
          onCodeChange={onCodeChange}
        />
      )}
    />
  );
}
