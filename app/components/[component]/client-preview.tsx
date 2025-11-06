"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ControlsPanel } from "../components/controls-panel";
import { CodePanel } from "../components/code-panel";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Code, Eye } from "lucide-react";

type ComponentPreset =
  | PresetName
  | SocialPostPresetName
  | MediaCardPresetName
  | DecisionPromptPresetName;

const PREVIEW_MIN_SIZE = 30;
const PREVIEW_MAX_SIZE = 85;

export function ClientPreview({ componentId }: { componentId: string }) {
  const { viewport } = useComponents();
  const [currentPreset, setCurrentPreset] = useState<ComponentPreset>(
    componentId === "social-post"
      ? "x"
      : componentId === "media-card"
        ? "link"
        : componentId === "decision-prompt"
          ? "multi-choice"
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
  const horizontalPanelGroupRef = useRef<
    import("react-resizable-panels").ImperativePanelGroupHandle | null
  >(null);
  const isSyncingHorizontalLayout = useRef(false);

  const handleSortChange = (next: {
    by?: string;
    direction?: "asc" | "desc";
  }) => {
    setSort(next);
  };

  const handleHorizontalLayout = useCallback((sizes: number[]) => {
    if (!horizontalPanelGroupRef.current) return;
    if (isSyncingHorizontalLayout.current) {
      isSyncingHorizontalLayout.current = false;
      return;
    }

    const [left, center, right] = sizes;
    const clampedCenter = Math.min(
      PREVIEW_MAX_SIZE,
      Math.max(PREVIEW_MIN_SIZE, center),
    );
    const spacing = Math.max(0, (100 - clampedCenter) / 2);
    const epsilon = 0.5;

    const isSymmetric =
      Math.abs(left - spacing) < epsilon &&
      Math.abs(right - spacing) < epsilon &&
      Math.abs(center - clampedCenter) < epsilon;

    if (!isSymmetric) {
      isSyncingHorizontalLayout.current = true;
      horizontalPanelGroupRef.current.setLayout([
        spacing,
        clampedCenter,
        spacing,
      ]);
    }
  }, []);

  // Update panel layout when viewport changes
  useEffect(() => {
    if (!horizontalPanelGroupRef.current) return;

    const viewportSizes = {
      mobile: 50, // 50% for mobile (375px equivalent)
      desktop: 85, // 85% for desktop (full width)
    };

    const targetSize = viewportSizes[viewport];
    const spacing = Math.max(0, (100 - targetSize) / 2);

    isSyncingHorizontalLayout.current = true;
    horizontalPanelGroupRef.current.setLayout([spacing, targetSize, spacing]);
  }, [viewport]);

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

  const [activeTab, setActiveTab] = useState("ui");

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-clip rounded-tl-lg border-t border-l">
      <aside className="bg-background scrollbar-subtle flex h-full w-72 shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r">
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header with status and tabs */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="preview-loading" className="text-sm">
              Loading
            </Label>
            <Switch
              id="preview-loading"
              checked={isLoading}
              onCheckedChange={setIsLoading}
            />
          </div>
          <ButtonGroup>
            <Button
              variant={activeTab === "ui" ? "secondary" : "outline"}
              size="icon-sm"
              onClick={() => setActiveTab("ui")}
              title="UI view"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={activeTab === "code" ? "secondary" : "outline"}
              size="icon-sm"
              onClick={() => setActiveTab("code")}
              title="Code view"
            >
              <Code className="h-4 w-4" />
            </Button>
          </ButtonGroup>
        </div>

        {/* Resizable preview area */}
        <div className="scrollbar-subtle relative flex flex-1 items-center justify-center overflow-auto p-6">
          {activeTab === "ui" && (
            <div
              className="bg-dot-grid pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
              aria-hidden="true"
            />
          )}
          {activeTab === "ui" ? (
            <div className="relative h-fit w-full">
              <PanelGroup
                ref={horizontalPanelGroupRef}
                direction="horizontal"
                autoSaveId={`component-preview-h-${componentId}`}
                onLayout={handleHorizontalLayout}
              >
                <Panel defaultSize={7.5} minSize={0} />

                <PanelResizeHandle className="group relative w-4">
                  <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
                </PanelResizeHandle>

                <Panel
                  defaultSize={85}
                  minSize={PREVIEW_MIN_SIZE}
                  maxSize={PREVIEW_MAX_SIZE}
                >
                  <div className="bg-background border-border scrollbar-subtle relative overflow-hidden border-2 border-dashed transition-all">
                    <div className="relative m-0 flex flex-col p-6">
                      <div className="w-full">
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
                        {componentId === "social-post" &&
                          currentSocialPostConfig && (
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
                        {componentId === "media-card" &&
                          currentMediaCardConfig && (
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
                            <div className="w-full max-w-md">
                              <DecisionPrompt
                                {...currentDecisionPromptConfig.prompt}
                                selectedAction={decisionPromptSelectedAction}
                                selectedActions={decisionPromptSelectedActions}
                                onAction={async (actionId) => {
                                  console.log(
                                    "Decision prompt action:",
                                    actionId,
                                  );

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
                          )}
                      </div>
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="group relative w-4">
                  <div className="absolute top-1/2 left-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300 opacity-40 transition-all group-hover:bg-gray-400 group-hover:opacity-100 group-data-resize-handle-active:bg-gray-500 group-data-resize-handle-active:opacity-100 dark:bg-gray-600 dark:group-hover:bg-gray-500 dark:group-data-resize-handle-active:bg-gray-400" />
                </PanelResizeHandle>

                <Panel defaultSize={7.5} minSize={0} />
              </PanelGroup>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <CodePanel
                className="h-full w-full"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
