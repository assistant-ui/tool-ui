"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useTuningState } from "./hooks/use-tuning-state";
import { TimeDial } from "./components/time-dial";
import { ConditionSidebar } from "./components/condition-sidebar";
import { DetailEditor } from "./components/detail-editor";
import { ExportPanel } from "./components/export-panel";
import { ViewModeToggle, type ViewMode } from "./components/view-mode-toggle";
import { ParameterMatrixView } from "./components/parameter-matrix-view";
import { TIME_CHECKPOINT_ORDER } from "./lib/constants";
import { WEATHER_CONDITIONS } from "../weather-compositor/presets";
import type { TimeCheckpoint } from "./types";

export default function WeatherTuningPage() {
  const state = useTuningState();
  const [viewMode, setViewMode] = useState<ViewMode>("condition");
  const {
    selectedCondition,
    setSelectedCondition,
    goToCheckpoint,
  } = state;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key;

      if (key === "ArrowUp" || key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = selectedCondition
          ? WEATHER_CONDITIONS.indexOf(selectedCondition)
          : -1;

        let newIndex: number;
        if (key === "ArrowUp") {
          newIndex =
            currentIndex <= 0
              ? WEATHER_CONDITIONS.length - 1
              : currentIndex - 1;
        } else {
          newIndex =
            currentIndex >= WEATHER_CONDITIONS.length - 1
              ? 0
              : currentIndex + 1;
        }

        setSelectedCondition(WEATHER_CONDITIONS[newIndex]);
        return;
      }

      if (!selectedCondition) return;

      if (key >= "1" && key <= "4") {
        e.preventDefault();
        const index = parseInt(key) - 1;
        const checkpoint = TIME_CHECKPOINT_ORDER[index];
        if (checkpoint) {
          goToCheckpoint(selectedCondition, checkpoint);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedCondition,
    setSelectedCondition,
    goToCheckpoint,
  ]);

  const selectedParams = state.selectedCondition
    ? state.getParamsForCondition(state.selectedCondition)
    : null;

  const selectedBaseParams = state.selectedCondition
    ? state.getBaseParams(state.selectedCondition)
    : null;

  const progressPercent = Math.round((state.signedOffCount / 13) * 100);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      <header className="relative z-10 flex items-center justify-between border-b border-border/50 px-5 py-2">
        <div className="flex items-center gap-4">
          <Link
            href="/sandbox"
            className="group flex items-center gap-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Exit</span>
          </Link>

          <div className="h-4 w-px bg-border/50" />

          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-foreground/80">
              Weather Tuning Studio
            </h1>
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-foreground/20 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground/60">
                {state.signedOffCount}/13
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <ExportPanel checkpointOverrides={state.checkpointOverrides} signedOff={state.signedOff} />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        {viewMode === "condition" && (
          <ConditionSidebar
            selectedCondition={state.selectedCondition}
            signedOff={state.signedOff}
            checkpoints={state.checkpoints}
            getOverrideCount={state.getOverrideCount}
            onSelectCondition={state.setSelectedCondition}
          />
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {viewMode === "condition" && (
            <div className="flex items-center justify-center border-b border-border/40 px-6 py-3">
              <TimeDial
                value={state.globalTimeOfDay}
                isPreviewing={state.isPreviewing}
                activeEditCheckpoint={state.activeEditCheckpoint}
                onScrub={state.scrubTime}
                onCheckpointClick={(checkpoint: TimeCheckpoint) => {
                  if (state.selectedCondition) {
                    state.goToCheckpoint(state.selectedCondition, checkpoint);
                  }
                }}
                onExitPreview={state.exitPreview}
              />
            </div>
          )}

          {viewMode === "parameter" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <ParameterMatrixView tuningState={state} />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-hidden p-6">
            {state.selectedCondition && selectedParams && selectedBaseParams ? (
              <DetailEditor
                condition={state.selectedCondition}
                params={selectedParams}
                baseParams={selectedBaseParams}
                checkpoints={state.getConditionCheckpoints(
                  state.selectedCondition
                )}
                activeEditCheckpoint={state.activeEditCheckpoint}
                isPreviewing={state.isPreviewing}
                isSignedOff={state.signedOff.has(state.selectedCondition)}
                expandedGroups={state.expandedGroups}
                currentTime={state.globalTimeOfDay}
                showWidgetOverlay={state.showWidgetOverlay}
                glassParams={state.glassParams}
                onParamsChange={(params) =>
                  state.updateParams(state.selectedCondition!, params)
                }
                onToggleGroup={state.toggleGroup}
                onReset={() => state.resetCondition(state.selectedCondition!)}
                onSignOff={() => state.toggleSignOff(state.selectedCondition!)}
                onCheckpointClick={(checkpoint) =>
                  state.goToCheckpoint(state.selectedCondition!, checkpoint)
                }
                onToggleWidgetOverlay={() =>
                  state.setShowWidgetOverlay(!state.showWidgetOverlay)
                }
                onGlassParamsChange={state.setGlassParams}
                onCopyLayer={(targetCondition, layerKey) =>
                  state.copyLayerFromCondition(
                    state.selectedCondition!,
                    targetCondition,
                    layerKey
                  )
                }
                onCopyLayerToAll={(layerKey) =>
                  state.copyLayerToAllConditions(
                    state.selectedCondition!,
                    layerKey
                  )
                }
                onCopyCheckpoint={(targetCheckpoints) =>
                  state.copyCheckpointToCheckpoints(
                    state.selectedCondition!,
                    state.activeEditCheckpoint,
                    targetCheckpoints
                  )
                }
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted">
                    <Download className="size-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a condition from the sidebar to begin tuning
                  </p>
                </div>
              </div>
            )}
          </div>
          )}
        </main>
      </div>
    </div>
  );
}
