"use client";

import { useState } from "react";
import { RainCanvas } from "./rain-canvas";

export default function RainEffectSandbox() {
  // Glass drops (existing effect)
  const [glassIntensity, setGlassIntensity] = useState(0.5);

  // Falling rain (new layer)
  const [fallingIntensity, setFallingIntensity] = useState(0.6);
  const [fallingSpeed, setFallingSpeed] = useState(1.0);
  const [fallingAngle, setFallingAngle] = useState(0.1);
  const [fallingStreakLength, setFallingStreakLength] = useState(1.0);
  const [fallingLayers, setFallingLayers] = useState(4);
  const [fallingRefraction, setFallingRefraction] = useState(0.4);
  const [fallingWaviness, setFallingWaviness] = useState(1.0);
  const [fallingThicknessVar, setFallingThicknessVar] = useState(1.0);

  // General
  const [zoom, setZoom] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="relative min-h-screen bg-black">
      <RainCanvas
        className="absolute inset-0"
        glassIntensity={glassIntensity}
        fallingIntensity={fallingIntensity}
        fallingSpeed={fallingSpeed}
        fallingAngle={fallingAngle}
        fallingStreakLength={fallingStreakLength}
        fallingLayers={fallingLayers}
        fallingRefraction={fallingRefraction}
        fallingWaviness={fallingWaviness}
        fallingThicknessVar={fallingThicknessVar}
        zoom={zoom}
        debug={showDebug}
      />

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="mx-auto max-w-2xl rounded-lg bg-black/70 p-4 backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-medium text-white/80">
            Rain Effect Controls
          </h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                Falling Rain
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Intensity: {fallingIntensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={fallingIntensity}
                    onChange={(e) => setFallingIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Speed: {fallingSpeed.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={fallingSpeed}
                    onChange={(e) => setFallingSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Wind Angle: {fallingAngle.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={fallingAngle}
                    onChange={(e) => setFallingAngle(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Streak Length: {fallingStreakLength.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={fallingStreakLength}
                    onChange={(e) => setFallingStreakLength(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Refraction: {fallingRefraction.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={fallingRefraction}
                    onChange={(e) => setFallingRefraction(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Waviness: {fallingWaviness.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={fallingWaviness}
                    onChange={(e) => setFallingWaviness(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Thickness Var: {fallingThicknessVar.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={fallingThicknessVar}
                    onChange={(e) => setFallingThicknessVar(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Depth Layers: {fallingLayers}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={fallingLayers}
                    onChange={(e) => setFallingLayers(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wide">
                Glass Drops
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/60">
                    Intensity: {glassIntensity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={glassIntensity}
                    onChange={(e) => setGlassIntensity(parseFloat(e.target.value))}
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

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="debug"
                    checked={showDebug}
                    onChange={(e) => setShowDebug(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="debug" className="text-xs text-white/60">
                    Show debug
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                const params = {
                  glassIntensity,
                  fallingIntensity,
                  fallingSpeed,
                  fallingAngle,
                  fallingStreakLength,
                  fallingLayers,
                  fallingRefraction,
                  fallingWaviness,
                  fallingThicknessVar,
                  zoom,
                };
                const text = JSON.stringify(params, null, 2);
                navigator.clipboard.writeText(text);
                alert("Parameters copied to clipboard!");
              }}
              className="w-full rounded bg-white/10 px-3 py-2 text-xs text-white/80 hover:bg-white/20 transition-colors"
            >
              Copy Parameters to Clipboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
