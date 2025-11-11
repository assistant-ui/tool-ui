"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { MediaCard } from "@/components/media-card";
import {
  MediaCardPresetName,
  mediaCardPresets,
} from "@/lib/media-card-presets";

export function MediaCardPreview({ withContainer = true }: { withContainer?: boolean }) {
  const [currentPreset, setCurrentPreset] =
    useState<MediaCardPresetName>("link");
  const [isLoading, setIsLoading] = useState(false);
  const currentConfig = mediaCardPresets[currentPreset];

  const handleSelectPreset = useCallback((preset: unknown) => {
    setCurrentPreset(preset as MediaCardPresetName);
    setIsLoading(false);
  }, []);

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="media-card"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <div className="mx-auto" style={{ maxWidth: "420px" }}>
          <MediaCard
            {...currentConfig.card}
            isLoading={loading}
            onAction={(actionId) => {
              console.log("MediaCard action:", actionId);
            }}
            onNavigate={(href) => {
              console.log("MediaCard navigate:", href);
            }}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="media-card"
          config={undefined}
          socialPostConfig={undefined}
          mediaCardConfig={currentConfig}
          decisionPromptConfig={undefined}
          decisionPromptSelectedAction={undefined}
          decisionPromptSelectedActions={[]}
          mediaCardMaxWidth="420px"
          sort={{}}
          isLoading={loading}
          emptyMessage=""
          mode="plain"
        />
      )}
    />
  );
}
