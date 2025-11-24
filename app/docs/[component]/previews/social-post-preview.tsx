"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { SocialPost } from "@/components/tool-ui/social-post";
import {
  SocialPostPresetName,
  socialPostPresets,
} from "@/lib/presets/social-post";

export function SocialPostPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "x";
  const initialPreset: SocialPostPresetName =
    presetParam && presetParam in socialPostPresets
      ? (presetParam as SocialPostPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<SocialPostPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in socialPostPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as SocialPostPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = socialPostPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as SocialPostPresetName;
      setCurrentPreset(presetName);
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
            onPostAction={(actionId) => {
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
