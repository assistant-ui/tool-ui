"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { OptionList } from "@/components/tool-ui/option-list";
import {
  OptionListPresetName,
  optionListPresets,
} from "@/lib/presets/option-list";

export function OptionListPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "export";
  const initialPreset: OptionListPresetName =
    presetParam && presetParam in optionListPresets
      ? (presetParam as OptionListPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<OptionListPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [selection, setSelection] = useState<string[] | string | null>(null);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in optionListPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as OptionListPresetName);
      setIsLoading(false);
      setSelection(null);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = optionListPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as OptionListPresetName;
      setCurrentPreset(presetName);
      setIsLoading(false);
      setSelection(null);

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
      renderPreview={() => (
        <div className="mx-auto" style={{ maxWidth: "420px" }}>
          <OptionList
            {...currentConfig.optionList}
            surfaceId="option-list-preview"
            value={selection}
            onChange={setSelection}
            onConfirm={(sel) => {
              console.log("OptionList confirmed:", sel);
              alert(`Selection confirmed: ${JSON.stringify(sel)}`);
            }}
          />
        </div>
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="option-list"
          optionListConfig={currentConfig}
          optionListSelection={selection}
          mode="plain"
        />
      )}
    />
  );
}
