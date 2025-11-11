"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { DataTable } from "@/components/data-table";
import type {
  Action,
  DataTableRowData,
  RowData,
} from "@/components/data-table";
import { PresetName, presets, SortState } from "@/lib/sample-data";

export function DataTablePreview({ withContainer = true }: { withContainer?: boolean }) {
  const [currentPreset, setCurrentPreset] = useState<PresetName>("stocks");
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets.stocks.defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets.stocks.emptyMessage ?? "No data available",
  );

  const currentConfig = presets[currentPreset];

  const handleSelectPreset = useCallback((preset: unknown) => {
    const nextConfig = presets[preset as PresetName];
    setCurrentPreset(preset as PresetName);
    setSort(nextConfig.defaultSort ?? {});
    setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
    setIsLoading(false);
  }, []);

  const handleBeforeAction = useCallback(
    async ({
      action,
      row,
    }: {
      action: Action;
      row: DataTableRowData | RowData;
    }) => {
      if (action.requiresConfirmation) {
        const candidateKeys = [currentConfig?.rowIdKey, "title", "name"]
          .filter(Boolean)
          .map(String);
        const labelCandidate = candidateKeys
          .map((key) => (row as Record<string, unknown>)[key])
          .find((value): value is string => typeof value === "string");
        const label = labelCandidate ?? "this item";

        return window.confirm(
          `Proceed with ${action.label.toLowerCase()} for ${label}?`,
        );
      }

      return true;
    },
    [currentConfig?.rowIdKey],
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
          {...currentConfig}
          sort={sort}
          onSortChange={setSort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          onBeforeAction={handleBeforeAction}
          onAction={(actionId, row) => {
            console.log("Action:", actionId, "Row:", row);
            alert(`Action: ${actionId}\nRow: ${JSON.stringify(row, null, 2)}`);
          }}
        />
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="data-table"
          config={currentConfig}
          socialPostConfig={undefined}
          mediaCardConfig={undefined}
          decisionPromptConfig={undefined}
          decisionPromptSelectedAction={undefined}
          decisionPromptSelectedActions={[]}
          mediaCardMaxWidth={undefined}
          sort={sort}
          isLoading={loading}
          emptyMessage={emptyMessage}
          mode="plain"
        />
      )}
    />
  );
}
