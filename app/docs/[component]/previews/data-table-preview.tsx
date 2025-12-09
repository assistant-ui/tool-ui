"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DataTable } from "@/components/tool-ui/data-table";
import { DataTablePresetName, dataTablePresets, SortState } from "@/lib/presets/data-table";

export function DataTablePreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset = "stocks";
  const initialPreset: DataTablePresetName =
    presetParam && presetParam in dataTablePresets
      ? (presetParam as DataTablePresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] = useState<DataTablePresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(
    dataTablePresets[initialPreset].data.defaultSort ?? {},
  );
  const [emptyMessage, setEmptyMessage] = useState(
    dataTablePresets[initialPreset].data.emptyMessage ?? "No data available",
  );

  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (
      presetParam &&
      presetParam in dataTablePresets &&
      presetParam !== currentPreset
    ) {
      const nextData = dataTablePresets[presetParam as DataTablePresetName].data;
      setCurrentPreset(presetParam as DataTablePresetName);
      setSort(nextData.defaultSort ?? {});
      setEmptyMessage(nextData.emptyMessage ?? "No data available");
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentData = dataTablePresets[currentPreset].data;

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as DataTablePresetName;
      const nextData = dataTablePresets[presetName].data;
      setCurrentPreset(presetName);
      setSort(nextData.defaultSort ?? {});
      setEmptyMessage(nextData.emptyMessage ?? "No data available");
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
          componentId="data-table"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      renderPreview={(loading) => (
        <DataTable
          {...currentData}
          sort={sort}
          onSortChange={setSort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          responseActions={currentData.responseActions}
          onResponseAction={(actionId) => {
            console.log("Response action:", actionId);
          }}
        />
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="data-table"
          config={currentData}
          sort={sort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          mode="plain"
        />
      )}
    />
  );
}
