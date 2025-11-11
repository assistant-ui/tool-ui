"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { SocialPost } from "@/components/social-post";
import {
  SocialPostPresetName,
  socialPostPresets,
} from "@/lib/social-post-presets";

export function SocialPostPreview({ withContainer = true }: { withContainer?: boolean }) {
  const [currentPreset, setCurrentPreset] = useState<SocialPostPresetName>("x");
  const [isLoading, setIsLoading] = useState(false);

  const currentConfig = socialPostPresets[currentPreset];

  const handleSelectPreset = useCallback((preset: unknown) => {
    setCurrentPreset(preset as SocialPostPresetName);
    setIsLoading(false);
  }, []);

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={
        <PresetSelector
          componentId="social-post"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <div className="mx-auto" style={{ maxWidth: "600px" }}>
          <SocialPost
            {...currentConfig.post}
            isLoading={loading}
            onAction={(actionId) => {
              console.log("Action:", actionId);
              alert(`Action: ${actionId}`);
            }}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="social-post"
          config={undefined}
          socialPostConfig={currentConfig}
          mediaCardConfig={undefined}
          decisionPromptConfig={undefined}
          decisionPromptSelectedAction={undefined}
          decisionPromptSelectedActions={[]}
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
