"use client";

import { useEffect, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DataTable } from "@/components/tool-ui/data-table";
import { type DataTablePresetName, dataTablePresets, type SortState } from "@/lib/presets/data-table";
import { usePresetParam } from "@/hooks/use-preset-param";

export function DataTablePreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const { currentPreset, setPreset } = usePresetParam<DataTablePresetName>({
    presets: dataTablePresets,
    defaultPreset: "stocks",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(
    dataTablePresets[currentPreset].data.defaultSort ?? {},
  );
  const [emptyMessage, setEmptyMessage] = useState(
    dataTablePresets[currentPreset].data.emptyMessage ?? "No data available",
  );

  useEffect(() => {
    const data = dataTablePresets[currentPreset].data;
    setSort(data.defaultSort ?? {});
    setEmptyMessage(data.emptyMessage ?? "No data available");
  }, [currentPreset]);

  const currentData = dataTablePresets[currentPreset].data;

  const handleSelectPreset = (preset: unknown) => {
    setPreset(preset as DataTablePresetName);
    setIsLoading(false);
  };

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
