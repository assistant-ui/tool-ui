"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { PresetSelector } from "../../_components/preset-selector";
import { CodePanel } from "../../_components/code-panel";
import { CodeDiff } from "@/components/code-diff";
import type { CodeDiffViewMode } from "@/components/code-diff";
import {
  codeDiffPresets,
  type CodeDiffPresetName,
  buildStreamingStages,
  type CodeDiffStreamingStage,
} from "@/lib/code-diff-presets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function CodeDiffPreview({ withContainer = true }: { withContainer?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get("preset");
  const defaultPreset: CodeDiffPresetName = "workspace-sync";
  const initialPreset: CodeDiffPresetName =
    presetParam && presetParam in codeDiffPresets
      ? (presetParam as CodeDiffPresetName)
      : defaultPreset;

  const [currentPreset, setCurrentPreset] =
    useState<CodeDiffPresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);
  const currentConfig = codeDiffPresets[currentPreset];
  const streamingStages = useMemo<CodeDiffStreamingStage[]>(
    () => buildStreamingStages(currentConfig.diff),
    [currentConfig.diff],
  );

  const [variant, setVariant] = useState<"inline" | "full">(
    currentConfig.controls?.variant ?? "full",
  );
  const [viewMode, setViewMode] = useState<CodeDiffViewMode>(
    currentConfig.controls?.defaultViewMode ?? "unified",
  );
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [limitHeight, setLimitHeight] = useState(true);
  const [streamStage, setStreamStage] = useState(
    streamingStages.length ? streamingStages.length - 1 : 0,
  );

  useEffect(() => {
    const nextPreset = searchParams.get("preset");
    if (
      nextPreset &&
      nextPreset in codeDiffPresets &&
      nextPreset !== currentPreset
    ) {
      setCurrentPreset(nextPreset as CodeDiffPresetName);
      setIsLoading(false);
    }
  }, [currentPreset, searchParams]);

  useEffect(() => {
    setVariant(currentConfig.controls?.variant ?? "full");
    setViewMode(currentConfig.controls?.defaultViewMode ?? "unified");
    setShowLineNumbers(true);
    setWrapLines(false);
    setLimitHeight(true);
    setStreamStage(Math.max(streamingStages.length - 1, 0));
  }, [currentConfig, streamingStages]);

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      const presetName = preset as CodeDiffPresetName;
      setCurrentPreset(presetName);
      setIsLoading(false);

      const params = new URLSearchParams(searchParams.toString());
      params.set("preset", presetName);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const maxHeight = limitHeight ? "32rem" : undefined;

  const previewControls = useMemo(
    () => (
      <div className="space-y-6">
        <PresetSelector
          componentId="code-diff"
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
        <PreviewControls
          variant={variant}
          viewMode={viewMode}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          limitHeight={limitHeight}
          streamStage={streamStage}
          maxStreamStage={Math.max(streamingStages.length - 1, 0)}
          onVariantChange={setVariant}
          onViewModeChange={setViewMode}
          onShowLineNumbersChange={setShowLineNumbers}
          onWrapLinesChange={setWrapLines}
          onLimitHeightChange={setLimitHeight}
          onStreamStageChange={setStreamStage}
        />
      </div>
    ),
    [
      currentPreset,
      handleSelectPreset,
      variant,
      viewMode,
      showLineNumbers,
      wrapLines,
      limitHeight,
      streamStage,
      streamingStages.length,
    ],
  );

  const currentStage =
    streamingStages[streamStage] ?? streamingStages[streamingStages.length - 1];
  const streamedDiff = currentStage.snapshot;
  const streamingActive = currentStage.isStreaming;
  const effectiveIsStreaming = isLoading || streamingActive;

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      onLoadingChange={setIsLoading}
      presetSelector={previewControls}
      renderPreview={(_loading) => (
        <div className="not-prose mx-auto max-w-4xl">
          <CodeDiff
            {...streamedDiff}
            variant={variant}
            viewMode={viewMode}
            showLineNumbers={showLineNumbers}
            wrapLines={wrapLines}
            maxHeight={maxHeight}
            isStreaming={effectiveIsStreaming}
            onAction={async (event) => {
              console.log("CodeDiff action:", event);
              alert(
                `Action ${event.actionId} on ${event.scope} (${event.file?.path ?? "diff"})`,
              );
            }}
          />
        </div>
      )}
      renderCodePanel={(loading) => (
        <CodePanel
          className="h-full w-full"
          componentId="code-diff"
          codeDiffConfig={currentConfig}
          codeDiffControls={{
            variant,
            viewMode,
            showLineNumbers,
            wrapLines,
            maxHeight,
            isStreaming: effectiveIsStreaming,
          }}
          config={undefined}
          socialPostConfig={undefined}
          mediaCardConfig={undefined}
          decisionPromptConfig={undefined}
          mediaCardMaxWidth={undefined}
          sort={{}}
          isLoading={loading}
          emptyMessage=""
          mode="plain"
        />
      )}
    />
  );
}

interface PreviewControlsProps {
  variant: "inline" | "full";
  viewMode: CodeDiffViewMode;
  showLineNumbers: boolean;
  wrapLines: boolean;
  limitHeight: boolean;
  streamStage: number;
  maxStreamStage: number;
  onVariantChange: (variant: "inline" | "full") => void;
  onViewModeChange: (viewMode: CodeDiffViewMode) => void;
  onShowLineNumbersChange: (value: boolean) => void;
  onWrapLinesChange: (value: boolean) => void;
  onLimitHeightChange: (value: boolean) => void;
  onStreamStageChange: (value: number) => void;
}

function PreviewControls({
  variant,
  viewMode,
  showLineNumbers,
  wrapLines,
  limitHeight,
  streamStage,
  maxStreamStage,
  onVariantChange,
  onViewModeChange,
  onShowLineNumbersChange,
  onWrapLinesChange,
  onLimitHeightChange,
  onStreamStageChange,
}: PreviewControlsProps) {
  return (
    <div className="border-border/60 border-t pt-4">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        Component state
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">
            Streaming stage
          </Label>
          <div className="mt-2 flex flex-col gap-1">
            <input
              type="range"
              min={0}
              max={Math.max(maxStreamStage, 0)}
              value={streamStage}
              onChange={(event) =>
                onStreamStageChange(Number(event.target.value))
              }
              className="accent-primary h-1 w-full cursor-pointer appearance-none rounded-full bg-muted"
            />
            <span className="text-muted-foreground text-xs">
              Stage {Math.min(streamStage + 1, maxStreamStage + 1)} /{" "}
              {maxStreamStage + 1}
            </span>
          </div>
        </div>
        <ControlGroup label="Variant">
          {(["inline", "full"] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={variant === option ? "default" : "outline"}
              onClick={() => onVariantChange(option)}
            >
              {option === "inline" ? "Inline" : "Full"}
            </Button>
          ))}
        </ControlGroup>
        <ControlGroup label="View mode">
          {(["unified", "split"] as const).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={viewMode === option ? "default" : "outline"}
              onClick={() => onViewModeChange(option)}
            >
              {option === "unified" ? "Unified" : "Split"}
            </Button>
          ))}
        </ControlGroup>
        <ToggleRow
          label="Show line numbers"
          checked={showLineNumbers}
          onCheckedChange={onShowLineNumbersChange}
        />
        <ToggleRow
          label="Wrap long lines"
          checked={wrapLines}
          onCheckedChange={onWrapLinesChange}
        />
        <ToggleRow
          label="Limit height"
          checked={limitHeight}
          onCheckedChange={onLimitHeightChange}
        />
      </div>
    </div>
  );
}

function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
