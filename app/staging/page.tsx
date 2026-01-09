"use client";

import { Suspense } from "react";
import { StagingToolbar } from "./_components/staging-toolbar";
import { StagingCanvas } from "./_components/staging-canvas";
import { StagingShowcase } from "./_components/staging-showcase";
import { useStagingState } from "./_components/use-staging-state";
import { useKeyboardShortcuts } from "./_components/use-keyboard-shortcuts";

function StagingContent() {
  const { componentId, presetName, debugLevel, isLoading, viewMode } = useStagingState();
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen flex-col">
      <StagingToolbar />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
        {viewMode === "static" ? (
          <StagingCanvas
            componentId={componentId}
            presetName={presetName}
            debugLevel={debugLevel}
            isLoading={isLoading}
          />
        ) : (
          <StagingShowcase
            componentId={componentId}
            presetName={presetName}
            debugLevel={debugLevel}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}

export default function StagingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      }
    >
      <StagingContent />
    </Suspense>
  );
}
