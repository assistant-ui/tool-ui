"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Plan } from "@/components/tool-ui/plan";
import { PlanPresetName, planPresets } from "@/lib/presets/plan";

export function PlanPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "comprehensive";
  const initialPreset: PlanPresetName =
    presetParam && presetParam in planPresets
      ? (presetParam as PlanPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<PlanPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in planPresets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as PlanPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = planPresets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as PlanPresetName;
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
          componentId="plan"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(_isLoadingState) => (
        <div className="w-full">
          <Plan {...currentConfig.plan} id="plan-preview" />
        </div>
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="plan"
          planConfig={currentConfig}
          mode="plain"
        />
      )}
    />
  );
}
