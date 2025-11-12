"use client";

import { useCallback, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get preset from URL or use default
  const presetParam = searchParams.get("preset");
  const defaultPreset = "stocks";
  const initialPreset: PresetName =
    presetParam && presetParam in presets ? (presetParam as PresetName) : defaultPreset;

  const [currentPreset, setCurrentPreset] = useState<PresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets[initialPreset].defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets[initialPreset].emptyMessage ?? "No data available",
  );

  // Sync state when URL changes
  useEffect(() => {
    const presetParam = searchParams.get("preset");
    if (presetParam && presetParam in presets && presetParam !== currentPreset) {
      const nextConfig = presets[presetParam as PresetName];
      setCurrentPreset(presetParam as PresetName);
      setSort(nextConfig.defaultSort ?? {});
      setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
      setIsLoading(false);
    }
  }, [searchParams, currentPreset]);

  const currentConfig = presets[currentPreset];

  const handleSelectPreset = useCallback((preset: unknown) => {
    const presetName = preset as PresetName;
    const nextConfig = presets[presetName];
    setCurrentPreset(presetName);
    setSort(nextConfig.defaultSort ?? {});
    setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
    setIsLoading(false);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", presetName);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

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
