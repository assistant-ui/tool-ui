"use client";

import { useCallback, useState } from "react";
import { ControlsPanel } from "../components/controls-panel";
import { CodePanel } from "../components/code-panel";
import { DataTable } from "@/components/registry/data-table";
import type { Action } from "@/components/registry/data-table";
import type { DataTableRowData, RowData } from "@/components/data-table";
import { PresetName, presets, SortState } from "@/lib/sample-data";
import { usePlayground } from "../playground-context";

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = usePlayground();
  const [currentPreset, setCurrentPreset] = useState<PresetName>("stocks");
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets.stocks.defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets.stocks.emptyMessage ?? "No data available",
  );

  const handleSortChange = (next: {
    by?: string;
    direction?: "asc" | "desc";
  }) => {
    setSort(next);
  };

  const currentConfig = presets[currentPreset];

  const handleSelectPreset = useCallback((preset: PresetName) => {
    const nextConfig = presets[preset];
    setCurrentPreset(preset);
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
        const candidateKeys = [currentConfig.rowIdKey, "title", "name"]
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
    [currentConfig.rowIdKey],
  );

  const viewportWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  } as const;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 gap-2">
      <div className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="bg-background flex-1 overflow-auto rounded-lg p-6">
          <div
            className="mx-auto transition-[width]"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
            }}
          >
            {componentId === "data-table" && (
              <DataTable
                {...currentConfig}
                sort={sort}
                onSortChange={setSort}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
                onBeforeAction={handleBeforeAction}
                onAction={(actionId, row) => {
                  console.log("Action:", actionId, "Row:", row);
                  alert(
                    `Action: ${actionId}\nRow: ${JSON.stringify(row, null, 2)}`,
                  );
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-background hover:bg-muted mb-4 flex-none overflow-clip rounded-lg">
          <CodePanel
            config={currentConfig}
            sort={sort}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>

      <aside className="bg-background flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-lg">
        <div className="min-h-0 flex-1 overflow-auto p-6">
          <ControlsPanel
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
            sort={sort}
            onSortChange={handleSortChange}
            emptyMessage={emptyMessage}
            onEmptyMessageChange={setEmptyMessage}
          />
        </div>
      </aside>
    </div>
  );
}
