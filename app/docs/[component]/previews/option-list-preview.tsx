"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { OptionList, type OptionListSelection } from "@/components/tool-ui/option-list";
import {
  OptionListPresetName,
  optionListPresets,
} from "@/lib/presets/option-list";
import { cn } from "@/lib/utils";

export function OptionListPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset: OptionListPresetName = "export";
  const initialPreset: OptionListPresetName =
    presetParam && presetParam in optionListPresets
      ? (presetParam as OptionListPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<OptionListPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<OptionListSelection>(null);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in optionListPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as OptionListPresetName);
      setSelection(null);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = optionListPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as OptionListPresetName;
      setCurrentPreset(presetName);
      setSelection(null);
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
          componentId="option-list"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <div
          className={cn(
            "mx-auto w-full max-w-md",
            loading && "pointer-events-none opacity-60",
          )}
        >
          <OptionList
            key={currentPreset}
            {...currentConfig.optionList}
            onConfirm={async (value) => {
              console.log("Option list selection:", value);
              setSelection(value);
            }}
            onCancel={() => setSelection(null)}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="option-list"
          config={undefined}
          socialPostConfig={undefined}
          mediaCardConfig={undefined}
          optionListConfig={currentConfig}
          optionListSelection={selection}
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
