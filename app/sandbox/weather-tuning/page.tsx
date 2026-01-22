"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTuningState } from "./hooks/use-tuning-state";
import { TimeBar } from "./components/time-bar";
import { ConditionMatrix } from "./components/condition-matrix";
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

      if (key === "ArrowLeft" || key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = selectedCondition
          ? WEATHER_CONDITIONS.indexOf(selectedCondition)
          : -1;

        let newIndex: number;
        if (key === "ArrowLeft") {
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-900 to-black">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sandbox"
              className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-300"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Weather Tuning Studio
              </h1>
              <p className="text-sm text-zinc-500">
                Progress: {state.signedOffCount}/13 conditions signed off
              </p>
            </div>
          </div>
          <ExportPanel overrides={state.overrides} signedOff={state.signedOff} />
        </div>
      </header>

      <div className="border-b border-zinc-800 px-6 py-3">
        <TimeBar
          value={state.globalTimeOfDay}
          onChange={state.setGlobalTimeOfDay}
        />
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <div className="shrink-0 pb-4">
          <ConditionMatrix
            selectedCondition={state.selectedCondition}
            signedOff={state.signedOff}
            checkpoints={state.checkpoints}
            getOverrideCount={state.getOverrideCount}
            onSelectCondition={state.setSelectedCondition}
          />
        </div>

        {state.selectedCondition && selectedParams && selectedBaseParams && (
          <div className="min-h-0 flex-1">
            {state.compareMode !== "off" ? (
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
                onToggleWidgetOverlay={() => state.setShowWidgetOverlay(!state.showWidgetOverlay)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
