"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../preset-selector";
import { CodePanel } from "../code-panel";
import { CodeBlock } from "@/components/tool-ui/code-block";
import { type CodeBlockPresetName, codeBlockPresets } from "@/lib/presets/code-block";
import { usePresetParam } from "@/hooks/use-preset-param";

export function CodeBlockPreview() {
  const { currentPreset, setPreset } = usePresetParam<CodeBlockPresetName>({
    presets: codeBlockPresets,
    defaultPreset: "typescript",
  });

  const [isLoading, setIsLoading] = useState(false);

  const currentData = codeBlockPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as CodeBlockPresetName);
    setIsLoading(false);
  };

  const handleResponseAction = useCallback(async (actionId: string) => {
    console.log("Response action:", actionId);
  }, []);

  return (
    <ComponentPreviewShell
      isLoading={isLoading}
      presetSelector={
        <PresetSelector
          componentId="code-block"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(isLoadingState) => (
        <CodeBlock
          {...currentData}
          id="code-block-preview"
          onResponseAction={handleResponseAction}
          isLoading={isLoadingState}
        />
      )}
      renderCodePanel={(loading, onCodeChange) => (
        <CodePanel
          className="h-full w-full"
          componentId="code-block"
          codeBlockPreset={currentPreset}
          isLoading={loading}
          mode="plain"
          onCodeChange={onCodeChange}
        />
      )}
    />
  );
}
