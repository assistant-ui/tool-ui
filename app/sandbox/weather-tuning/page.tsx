"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useTuningState } from "./hooks/use-tuning-state";
import { TimeDial } from "./components/time-dial";
import { ConditionSidebar } from "./components/condition-sidebar";
import { DetailEditor } from "./components/detail-editor";
import { ComparisonView } from "./components/comparison-view";
import { ExportPanel } from "./components/export-panel";
import { TIME_CHECKPOINT_ORDER } from "./lib/constants";
import { WEATHER_CONDITIONS } from "../weather-compositor/presets";

export default function WeatherTuningPage() {
  const state = useTuningState();
  const {
    selectedCondition,
    setSelectedCondition,
    goToCheckpoint,
    compareMode,
    setCompareMode,
  } = state;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const key = e.key;

      if (key === "Escape" && compareMode !== "off") {
        setCompareMode("off");
        return;
      }

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
    compareMode,
    setCompareMode,
  ]);

  const selectedParams = state.selectedCondition
    ? state.getParamsForCondition(state.selectedCondition)
    : null;

  const selectedBaseParams = state.selectedCondition
    ? state.getBaseParams(state.selectedCondition)
    : null;

  const compareTargetParams = state.compareTarget
    ? state.getParamsForCondition(state.compareTarget)
    : null;

  const handleCompare = () => {
    if (state.compareMode === "off") {
      state.setCompareMode("ab");
    } else {
      state.setCompareMode("off");
    }
  };

  const handleToggleCompareMode = () => {
    state.setCompareMode(state.compareMode === "ab" ? "side-by-side" : "ab");
  };

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

        <ExportPanel checkpointOverrides={state.checkpointOverrides} signedOff={state.signedOff} />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <ConditionSidebar
          selectedCondition={state.selectedCondition}
          signedOff={state.signedOff}
          checkpoints={state.checkpoints}
          getOverrideCount={state.getOverrideCount}
          onSelectCondition={state.setSelectedCondition}
        />

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-center border-b border-border/40 px-6 py-3">
            <TimeDial
              value={state.globalTimeOfDay}
              onChange={state.setGlobalTimeOfDay}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-hidden p-6">
            {state.selectedCondition && selectedParams && selectedBaseParams ? (
              state.compareMode !== "off" ? (
                <ComparisonView
                  condition={state.selectedCondition}
                  params={selectedParams}
                  baseParams={selectedBaseParams}
                  compareMode={state.compareMode}
                  compareTarget={state.compareTarget}
                  compareTargetParams={compareTargetParams}
                  onClose={() => {
                    state.setCompareMode("off");
                    state.setCompareTarget(null);
                  }}
                  onToggleMode={handleToggleCompareMode}
                  onSelectCompareTarget={state.setCompareTarget}
                />
              ) : (
                <DetailEditor
                  condition={state.selectedCondition}
                  params={selectedParams}
                  baseParams={selectedBaseParams}
                  checkpoints={state.getConditionCheckpoints(
                    state.selectedCondition
                  )}
                  activeEditCheckpoint={state.activeEditCheckpoint}
                  isSignedOff={state.signedOff.has(state.selectedCondition)}
                  expandedGroups={state.expandedGroups}
                  currentTime={state.globalTimeOfDay}
                  showWidgetOverlay={state.showWidgetOverlay}
                  onParamsChange={(params) =>
                    state.updateParams(state.selectedCondition!, params)
                  }
                  onToggleGroup={state.toggleGroup}
                  onReset={() => state.resetCondition(state.selectedCondition!)}
                  onSignOff={() => state.toggleSignOff(state.selectedCondition!)}
                  onCheckpointClick={(checkpoint) =>
                    state.goToCheckpoint(state.selectedCondition!, checkpoint)
                  }
                  onCompare={handleCompare}
                  onToggleWidgetOverlay={() =>
                    state.setShowWidgetOverlay(!state.showWidgetOverlay)
                  }
                  onCopyLayer={(sourceCondition, layerKey) =>
                    state.copyLayerFromCondition(
                      sourceCondition,
                      state.selectedCondition!,
                      layerKey
                    )
                  }
                />
              )
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
        </main>
      </div>
    </div>
  );
}
