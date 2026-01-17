"use client";

import { useState } from "react";
import { RainCanvas } from "./rain-canvas";

export default function RainEffectSandbox() {
  const [intensity, setIntensity] = useState(0.5);
  const [zoom, setZoom] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="relative min-h-screen bg-black">
      <RainCanvas
        className="absolute inset-0"
        intensity={intensity}
        zoom={zoom}
        debug={showDebug}
      />

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="mx-auto max-w-md rounded-lg bg-black/70 p-4 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-medium text-white/80">
            Rain Effect Controls
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">
                Intensity: {intensity.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">
                Zoom: {zoom.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
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
                Show debug grid
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
