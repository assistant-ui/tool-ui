"use client";

import { useCallback, useMemo, useState } from "react";
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
import { MediaCard } from "@/components/registry/media-card";
import {
  MediaCardPresetName,
  mediaCardPresets,
} from "@/lib/media-card-presets";
import { usePlayground } from "../playground-context";

type PlaygroundPreset = PresetName | SocialPostPresetName | MediaCardPresetName;

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = usePlayground();
  const [currentPreset, setCurrentPreset] = useState<PlaygroundPreset>(
    componentId === "social-post"
      ? "x"
      : componentId === "media-card"
        ? "image"
        : "stocks",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets.stocks.defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets.stocks.emptyMessage ?? "No data available",
  );
  const [mediaCardMaxWidth, setMediaCardMaxWidth] = useState<string>("420px");

  const handleSortChange = (next: {
    by?: string;
    direction?: "asc" | "desc";
  }) => {
    setSort(next);
  };

  const currentConfig = useMemo(
    () =>
      componentId === "data-table"
        ? presets[currentPreset as PresetName]
        : undefined,
    [componentId, currentPreset],
  );

  const currentSocialPostConfig = useMemo(
    () =>
      componentId === "social-post"
        ? socialPostPresets[currentPreset as SocialPostPresetName]
        : undefined,
    [componentId, currentPreset],
  );

  const currentMediaCardConfig = useMemo(
    () =>
      componentId === "media-card"
        ? mediaCardPresets[currentPreset as MediaCardPresetName]
        : undefined,
    [componentId, currentPreset],
  );

  const handleSelectPreset = useCallback(
    (preset: PlaygroundPreset) => {
      if (componentId === "data-table") {
        const nextConfig = presets[preset as PresetName];
        setCurrentPreset(preset);
        setSort(nextConfig.defaultSort ?? {});
        setEmptyMessage(nextConfig.emptyMessage ?? "No data available");
        setIsLoading(false);
      } else if (componentId === "social-post") {
        setCurrentPreset(preset);
        setIsLoading(false);
      } else if (componentId === "media-card") {
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
      <aside className="bg-background/40 shadow-crisp-edge flex h-full w-80 shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg">
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
          mediaCardMaxWidth={mediaCardMaxWidth}
          onMediaCardMaxWidthChange={setMediaCardMaxWidth}
        />
      </aside>
      <div className="flex flex-1 flex-col gap-2">
        <div className="bg-background shadow-crisp-edge flex-1 overflow-auto rounded-lg p-6">
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
            {componentId === "media-card" && currentMediaCardConfig && (
              <div className="flex justify-center">
                <MediaCard
                  {...currentMediaCardConfig.card}
                  isLoading={isLoading}
                  maxWidth={
                    mediaCardMaxWidth && mediaCardMaxWidth.trim().length > 0
                      ? mediaCardMaxWidth
                      : undefined
                  }
                  onAction={(actionId) => {
                    console.log("MediaCard action:", actionId);
                  }}
                  onNavigate={(href) => {
                    console.log("MediaCard navigate:", href);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-background shadow-crisp-edge hover:bg-muted flex-none overflow-clip rounded-lg">
          <CodePanel
            componentId={componentId}
            config={currentConfig}
            socialPostConfig={currentSocialPostConfig}
            mediaCardConfig={currentMediaCardConfig}
            mediaCardMaxWidth={mediaCardMaxWidth}
            sort={sort}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
}
