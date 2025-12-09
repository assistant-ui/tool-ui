"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { MediaCard } from "@/components/tool-ui/media-card";
import {
  MediaCardPresetName,
  mediaCardPresets,
} from "@/lib/presets/media-card";

export function MediaCardPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "image";
  const initialPreset: MediaCardPresetName =
    presetParam && presetParam in mediaCardPresets
      ? (presetParam as MediaCardPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<MediaCardPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in mediaCardPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as MediaCardPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = mediaCardPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as MediaCardPresetName;
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
          componentId="media-card"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <div className="w-full max-w-[420px]">
          <MediaCard
            {...currentConfig.card}
            isLoading={loading}
            responseActions={currentConfig.responseActions}
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
          mediaCardConfig={currentConfig}
          mediaCardMaxWidth="420px"
          isLoading={loading}
          mode="plain"
        />
      )}
    />
  );
}
