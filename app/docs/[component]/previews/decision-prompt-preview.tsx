"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DecisionPrompt } from "@/components/decision-prompt";
import {
  DecisionPromptPresetName,
  decisionPromptPresets,
} from "@/lib/decision-prompt-presets";

export function DecisionPromptPreview() {
  const [currentPreset, setCurrentPreset] =
    useState<DecisionPromptPresetName>("multi-choice");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const currentConfig = decisionPromptPresets[currentPreset];

  const handleSelectPreset = useCallback((preset: unknown) => {
    setCurrentPreset(preset as DecisionPromptPresetName);
    setSelectedAction(undefined);
    setSelectedActions([]);
    setIsLoading(false);
  }, []);

  return (
    <ComponentPreviewShell
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="decision-prompt"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(_loading) => (
        <div className="mx-auto w-full max-w-md">
          <DecisionPrompt
            {...currentConfig.prompt}
            selectedAction={selectedAction}
            selectedActions={selectedActions}
            onAction={async (actionId) => {
              console.log("Decision prompt action:", actionId);

              // Simulate async for "install" or "send" actions
              if (actionId === "install" || actionId === "send") {
                await new Promise((resolve) => setTimeout(resolve, 1500));
              }

              setSelectedAction(actionId);
            }}
            onMultiAction={async (actionIds) => {
              console.log("Decision prompt multi-action:", actionIds);

              await new Promise((resolve) => setTimeout(resolve, 1500));

              setSelectedActions(actionIds);
            }}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="decision-prompt"
          config={undefined}
          socialPostConfig={undefined}
          mediaCardConfig={undefined}
          decisionPromptConfig={currentConfig}
          decisionPromptSelectedAction={selectedAction}
          decisionPromptSelectedActions={selectedActions}
          mediaCardMaxWidth={undefined}
          sort={{}}
          isLoading={loading}
          emptyMessage=""
          mode="plain"
        />
      )}
    />
  );
}
