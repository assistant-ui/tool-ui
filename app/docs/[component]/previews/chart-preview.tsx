"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { Chart } from "@/components/tool-ui/chart";
import { ChartPresetName, presets } from "@/lib/presets/chart";

export function ChartPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "revenue";
  const initialPreset: ChartPresetName =
    presetParam && presetParam in presets
      ? (presetParam as ChartPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<ChartPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in presets &&
      presetParam !== currentPreset
    ) {
      setCurrentPreset(presetParam as ChartPresetName);
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = presets[currentPreset];

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as ChartPresetName;
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
          componentId="chart"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={() => (
        <Chart surfaceId={`chart-${currentPreset}`} {...currentConfig} />
      )}
      renderCodePanel={() => (
        <CodePanel
          className="h-full w-full"
          componentId="chart"
          chartConfig={currentConfig}
          mode="plain"
        />
      )}
    />
  );
}
