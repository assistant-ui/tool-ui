"use client";

import { useCallback, useState } from "react";
import { ControlsPanel } from "../components/controls-panel";
import { CodePanel } from "../components/code-panel";
import { DataTable } from "@/components/registry/data-table";
import type { Action } from "@/components/registry/data-table";
import type { DataTableRowData, RowData } from "@/components/data-table";
import { PresetName, presets, SortState } from "@/lib/sample-data";
import { SocialPost } from "@/components/registry/social-post";
import {
  SocialPostPresetName,
  socialPostPresets,
} from "@/lib/social-post-presets";
import { usePlayground } from "../playground-context";

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = usePlayground();
  const [currentPreset, setCurrentPreset] = useState<
    PresetName | SocialPostPresetName
  >(componentId === "social-post" ? "x" : "stocks");
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

  const currentConfig =
    componentId === "data-table"
      ? presets[currentPreset as PresetName]
      : undefined;
  const currentSocialPostConfig =
    componentId === "social-post"
      ? socialPostPresets[currentPreset as SocialPostPresetName]
      : undefined;

  const handleSelectPreset = useCallback(
    (preset: PresetName | SocialPostPresetName) => {
      if (componentId === "data-table") {
        const nextConfig = presets[preset as PresetName];
        setCurrentPreset(preset);
        setSort(nextConfig.defaultSort ?? {});
        setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
        setIsLoading(false);
      } else if (componentId === "social-post") {
        setCurrentPreset(preset);
        setIsLoading(false);
      }
    },
    [componentId],
  );

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

  const viewportWidths = {
    mobile: "375px",
    tablet: "768px",
    desktop: "100%",
  } as const;

  return (
    <div className="mr-2 flex h-full min-h-0 w-full flex-1 gap-2 pr-2 pb-2">
      <aside className="bg-background/40 flex h-full w-80 shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg shadow-xs">
        <ControlsPanel
          componentId={componentId}
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
          isLoading={isLoading}
          onLoadingChange={setIsLoading}
          sort={sort}
          onSortChange={handleSortChange}
          emptyMessage={emptyMessage}
          onEmptyMessageChange={setEmptyMessage}
        />
      </aside>
      <div className="flex flex-1 flex-col gap-2 overflow-clip">
        <div className="bg-background flex-1 overflow-auto rounded-lg p-6 shadow-xs">
          <div
            className="mx-auto transition-[width]"
            style={{
              width: viewportWidths[viewport],
              maxWidth: "100%",
            }}
          >
            {componentId === "data-table" && currentConfig && (
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
            {componentId === "social-post" && currentSocialPostConfig && (
              <SocialPost
                {...currentSocialPostConfig.post}
                isLoading={isLoading}
                maxWidth="600px"
                onAction={(actionId) => {
                  console.log("Action:", actionId);
                  alert(`Action: ${actionId}`);
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-background hover:bg-muted flex-none overflow-hidden rounded-lg shadow-xs">
          <CodePanel
            componentId={componentId}
            config={currentConfig}
            socialPostConfig={currentSocialPostConfig}
            sort={sort}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
}
