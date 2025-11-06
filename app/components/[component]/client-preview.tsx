"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useComponents } from "../components-context";

type ComponentPreset = PresetName | SocialPostPresetName | MediaCardPresetName;

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = useComponents();
  const [currentPreset, setCurrentPreset] = useState<ComponentPreset>(
    componentId === "social-post"
      ? "x"
      : componentId === "media-card"
        ? "link"
        : "stocks",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets.stocks.defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets.stocks.emptyMessage ?? "No data available",
  );
  const [mediaCardMaxWidth, setMediaCardMaxWidth] = useState<string>("420px");
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewOverflowing, setIsPreviewOverflowing] = useState(false);

  useEffect(() => {
    const container = previewContainerRef.current;
    const content = previewContentRef.current;
    if (!container || !content || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateOverflowState = () => {
      const verticalOverflow = content.scrollHeight > container.clientHeight + 1;
      const horizontalOverflow = content.scrollWidth > container.clientWidth + 1;
      setIsPreviewOverflowing(verticalOverflow || horizontalOverflow);
    };

    updateOverflowState();

    const observer = new ResizeObserver(() => {
      updateOverflowState();
    });

    observer.observe(container);
    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [viewport, componentId, currentPreset, isLoading, sort, emptyMessage, mediaCardMaxWidth]);

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
    (preset: ComponentPreset) => {
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
      <aside className="bg-background/40 shadow-crisp-edge scrollbar-subtle flex h-full w-80 shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg">
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
        <div
          ref={previewContainerRef}
          className={`bg-background shadow-crisp-edge scrollbar-subtle flex min-h-0 flex-1 justify-center overflow-auto rounded-lg p-6 ${isPreviewOverflowing ? "items-start" : "items-center"}`}
        >
          <div
            ref={previewContentRef}
            className="mx-auto min-w-0 transition-[width]"
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
