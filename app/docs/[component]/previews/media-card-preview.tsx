"use client";

import { useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { MediaCard } from "@/components/tool-ui/media-card";
import { type MediaCardPresetName, mediaCardPresets } from "@/lib/presets/media-card";
import { usePresetParam } from "@/hooks/use-preset-param";

export function MediaCardPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const { currentPreset, setPreset } = usePresetParam<MediaCardPresetName>({
    presets: mediaCardPresets,
    defaultPreset: "image",
  });

  const [isLoading, setIsLoading] = useState(false);

  const { card, responseActions } = mediaCardPresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as MediaCardPresetName);
    setIsLoading(false);
  };

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      supportsLoading
      presetSelector={
        <PresetSelector
          componentId="media-card"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <div className="mx-auto w-full max-w-[500px]">
          <MediaCard
            {...card}
            isLoading={loading}
            responseActions={responseActions}
            onAction={(actionId) => {
              console.log("MediaCard action:", actionId);
            }}
            onNavigate={(href) => {
              console.log("MediaCard navigate:", href);
            }}
            onResponseAction={(actionId) => {
              console.log("MediaCard response action:", actionId);
            }}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="media-card"
          mediaCardPreset={currentPreset}
          mediaCardMaxWidth="28rem"
          isLoading={loading}
          mode="plain"
        />
      )}
    />
  );
}
