"use client";

import { useRef, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { OptionList } from "@/components/tool-ui/option-list";
import { type OptionListPresetName, optionListPresets } from "@/lib/presets/option-list";
import { usePresetParam } from "@/hooks/use-preset-param";

export function OptionListPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const { currentPreset, setPreset } = usePresetParam<OptionListPresetName>({
    presets: optionListPresets,
    defaultPreset: "export",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<string[] | string | null>(null);

  const prevPresetRef = useRef(currentPreset);
  if (prevPresetRef.current !== currentPreset) {
    prevPresetRef.current = currentPreset;
    setSelection(null);
  }

  const currentData = optionListPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as OptionListPresetName);
    setSelection(null);
    setIsLoading(false);
  };

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      presetSelector={
        <PresetSelector
          componentId="option-list"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(_isLoading) => (
        <OptionList
          {...currentData}
          id="option-list-preview"
          value={selection}
          onChange={setSelection}
          onConfirm={(sel) => {
            console.log("OptionList confirmed:", sel);
            alert(`Selection confirmed: ${JSON.stringify(sel)}`);
          }}
        />
      )}
      renderCodePanel={(_isLoading) => (
        <CodePanel
          className="h-full w-full"
          componentId="option-list"
          optionListPreset={currentPreset}
          optionListSelection={selection}
          mode="plain"
        />
      )}
    />
  );
}
