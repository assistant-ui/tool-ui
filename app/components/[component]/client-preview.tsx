"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ControlsPanel } from "../components/controls-panel";
import { CodePanel } from "../components/code-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LinearBlur } from "@/components/ui/linear-blur";
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
import { DecisionPrompt } from "@/components/registry/decision-prompt";
import {
  DecisionPromptPresetName,
  decisionPromptPresets,
} from "@/lib/decision-prompt-presets";
import { useComponents } from "../components-context";

type ComponentPreset =
  | PresetName
  | SocialPostPresetName
  | MediaCardPresetName
  | DecisionPromptPresetName;

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = useComponents();
  const [currentPreset, setCurrentPreset] = useState<ComponentPreset>(
    componentId === "social-post"
      ? "x"
      : componentId === "media-card"
        ? "link"
        : componentId === "decision-prompt"
          ? "binary"
          : "stocks",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<SortState>(presets.stocks.defaultSort ?? {});
  const [emptyMessage, setEmptyMessage] = useState(
    presets.stocks.emptyMessage ?? "No data available",
  );
  const [mediaCardMaxWidth, setMediaCardMaxWidth] = useState<string>("420px");
  const [decisionPromptSelectedAction, setDecisionPromptSelectedAction] =
    useState<string | undefined>();
  const [decisionPromptSelectedActions, setDecisionPromptSelectedActions] =
    useState<string[]>([]);
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
      const verticalOverflow =
        content.scrollHeight > container.clientHeight + 1;
      const horizontalOverflow =
        content.scrollWidth > container.clientWidth + 1;
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
  }, [
    viewport,
    componentId,
    currentPreset,
    isLoading,
    sort,
    emptyMessage,
    mediaCardMaxWidth,
  ]);

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

  const currentDecisionPromptConfig = useMemo(
    () =>
      componentId === "decision-prompt"
        ? decisionPromptPresets[currentPreset as DecisionPromptPresetName]
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
      } else if (componentId === "decision-prompt") {
        setCurrentPreset(preset);
        setDecisionPromptSelectedAction(undefined);
        setDecisionPromptSelectedActions([]);
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
    desktop: "100%",
  } as const;

  return (
    <div className="mr-2 flex h-full min-h-0 w-full flex-1 gap-2 pr-2 pb-2">
      <aside className="bg-background/40 shadow-crisp-edge scrollbar-subtle flex h-full w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto rounded-lg">
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
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div
          ref={previewContainerRef}
          className="bg-background shadow-crisp-edge scrollbar-subtle flex min-h-0 flex-1 overflow-hidden rounded-lg"
        >
          <Tabs
            defaultValue="ui"
            className="flex min-h-0 w-full flex-1 flex-col overflow-auto"
          >
            <div className="sticky top-0 z-20">
              <LinearBlur
                side="top"
                tint="var(--background)"
                className="pointer-events-none absolute top-0 right-0 left-0 z-0 h-28"
                strength={30}
                steps={6}
              />
              <div className="relative mx-auto">
                <div className="flex items-center justify-center px-2 pt-4 pb-3">
                  <TabsList className="bg-primary/5 z-10 gap-2 rounded-lg p-1 backdrop-blur-3xl">
                    <TabsTrigger
                      value="ui"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      User Interface
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Code
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

            <TabsContent
              value="ui"
              className="scrollbar-subtle relative flex min-h-0 flex-1 flex-col p-6"
            >
              <div className="sticky top-2 z-10 flex w-full justify-end pr-2">
                <div className="bg-background/80 shadow-crisp-edge flex items-center gap-2 rounded-md border px-2 py-1">
                  <Label htmlFor="preview-loading" className="text-xs">
                    Loading
                  </Label>
                  <Switch
                    id="preview-loading"
                    checked={isLoading}
                    onCheckedChange={setIsLoading}
                  />
                </div>
              </div>
              <div
                className={`relative flex flex-1 ${isPreviewOverflowing ? "items-start justify-center" : "justify-center"}`}
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
                          mediaCardMaxWidth &&
                          mediaCardMaxWidth.trim().length > 0
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
                  {componentId === "decision-prompt" &&
                    currentDecisionPromptConfig && (
                      <div className="flex justify-center">
                        <div className="w-full max-w-md">
                          <DecisionPrompt
                            {...currentDecisionPromptConfig.prompt}
                            selectedAction={decisionPromptSelectedAction}
                            selectedActions={decisionPromptSelectedActions}
                            onAction={async (actionId) => {
                              console.log("Decision prompt action:", actionId);

                              // Simulate async for "install" or "send" actions
                              if (
                                actionId === "install" ||
                                actionId === "send"
                              ) {
                                await new Promise((resolve) =>
                                  setTimeout(resolve, 1500),
                                );
                              }

                              setDecisionPromptSelectedAction(actionId);
                            }}
                            onMultiAction={async (actionIds) => {
                              console.log(
                                "Decision prompt multi-action:",
                                actionIds,
                              );

                              await new Promise((resolve) =>
                                setTimeout(resolve, 1500),
                              );

                              setDecisionPromptSelectedActions(actionIds);
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code">
              <CodePanel
                className="w-full"
                componentId={componentId}
                config={currentConfig}
                socialPostConfig={currentSocialPostConfig}
                mediaCardConfig={currentMediaCardConfig}
                decisionPromptConfig={currentDecisionPromptConfig}
                decisionPromptSelectedAction={decisionPromptSelectedAction}
                decisionPromptSelectedActions={decisionPromptSelectedActions}
                mediaCardMaxWidth={mediaCardMaxWidth}
                sort={sort}
                isLoading={isLoading}
                emptyMessage={emptyMessage}
                mode="plain"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
