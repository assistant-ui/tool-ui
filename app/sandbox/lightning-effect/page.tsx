"use client";

import { useState, useCallback } from "react";
import { LightningCanvas } from "./lightning-canvas";

export default function LightningEffectSandbox() {
  // Lightning bolt parameters
  const [branchDensity, setBranchDensity] = useState(0.5);
  const [displacement, setDisplacement] = useState(0.15);
  const [glowIntensity, setGlowIntensity] = useState(1.0);
  const [flashDuration, setFlashDuration] = useState(150);
  const [sceneIllumination, setSceneIllumination] = useState(0.8);
  const [afterglowPersistence, setAfterglowPersistence] = useState(4.0);

  // Manual trigger
  const [triggerCount, setTriggerCount] = useState(0);
  const triggerStrike = useCallback(() => {
    setTriggerCount((c) => c + 1);
  }, []);

  // Auto mode
  const [autoMode, setAutoMode] = useState(true);
  const [autoInterval, setAutoInterval] = useState(8);

  // Debug
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="relative min-h-screen bg-black">
      <LightningCanvas
        className="absolute inset-0"
        branchDensity={branchDensity}
        displacement={displacement}
        glowIntensity={glowIntensity}
        flashDuration={flashDuration}
        sceneIllumination={sceneIllumination}
        afterglowPersistence={afterglowPersistence}
        triggerCount={triggerCount}
        autoMode={autoMode}
        autoInterval={autoInterval}
        debug={showDebug}
      />

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="mx-auto max-w-2xl rounded-lg bg-black/70 p-4 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-medium text-white/80">
            Lightning Effect Controls
          </h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                Bolt Shape
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Branch Density: {branchDensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={branchDensity}
                    onChange={(e) => setBranchDensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Displacement: {displacement.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.4"
                    step="0.01"
                    value={displacement}
                    onChange={(e) => setDisplacement(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Glow Intensity: {glowIntensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                Timing & Illumination
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Flash Duration: {flashDuration}ms
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={flashDuration}
                    onChange={(e) => setFlashDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Scene Illumination: {sceneIllumination.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sceneIllumination}
                    onChange={(e) => setSceneIllumination(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Afterglow Persistence: {afterglowPersistence.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={afterglowPersistence}
                    onChange={(e) => setAfterglowPersistence(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Auto Interval: {autoInterval}s
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={autoInterval}
                    onChange={(e) => setAutoInterval(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoMode"
                      checked={autoMode}
                      onChange={(e) => setAutoMode(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="autoMode" className="text-xs text-white/60">
                      Auto
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="debug"
                      checked={showDebug}
                      onChange={(e) => setShowDebug(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="debug" className="text-xs text-white/60">
                      Debug
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
            <button
              onClick={triggerStrike}
              className="flex-1 rounded bg-white/20 px-3 py-2 text-xs text-white/90 hover:bg-white/30 transition-colors font-medium"
            >
              ⚡ Trigger Lightning
            </button>
            <button
              onClick={() => {
                const params = {
                  branchDensity,
                  displacement,
                  glowIntensity,
                  flashDuration,
                  sceneIllumination,
                  autoInterval,
                };
                navigator.clipboard.writeText(JSON.stringify(params, null, 2));
                alert("Parameters copied to clipboard!");
              }}
              className="rounded bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/20 transition-colors"
            >
              Copy Params
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
