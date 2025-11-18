"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DecisionPrompt } from "@/components/tool-ui/decision-prompt";
import {
  DecisionPromptPresetName,
  decisionPromptPresets,
} from "@/lib/presets/decision-prompt";

export function DecisionPromptPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "multi-choice";
  const initialPreset: DecisionPromptPresetName =
    presetParam && presetParam in decisionPromptPresets
      ? (presetParam as DecisionPromptPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<DecisionPromptPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in decisionPromptPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as DecisionPromptPresetName);
      setSelectedAction(undefined);
      setSelectedActions([]);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = decisionPromptPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as DecisionPromptPresetName;
      setCurrentPreset(presetName);
      setSelectedAction(undefined);
      setSelectedActions([]);
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
