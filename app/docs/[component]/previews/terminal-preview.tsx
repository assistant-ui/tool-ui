"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Terminal } from "@/components/tool-ui/terminal";
import {
  type TerminalPresetName,
  terminalPresets,
} from "@/lib/presets/terminal";
import { usePresetParam } from "@/hooks/use-preset-param";

export function TerminalPreview() {
  const { currentPreset, setPreset } = usePresetParam<TerminalPresetName>({
    presets: terminalPresets,
    defaultPreset: "success",
  });

  const [isLoading, setIsLoading] = useState(false);

  const currentData = terminalPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as TerminalPresetName);
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
          componentId="terminal"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(isLoadingState) => (
        <Terminal
          {...currentData}
          id="terminal-preview"
          onResponseAction={handleResponseAction}
          isLoading={isLoadingState}
        />
      )}
      renderCodePanel={(loading, onCodeChange) => (
        <CodePanel
          className="h-full w-full"
          componentId="terminal"
          terminalPreset={currentPreset}
          isLoading={loading}
          mode="plain"
          onCodeChange={onCodeChange}
        />
      )}
    />
  );
}
