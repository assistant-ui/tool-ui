"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { EFFECT_INTENSITY_CONFIG } from "../types";
import "./weather-effects.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CloudConfig {
  id: number;
  y: number;
  delay: number;
  scale: number;
}

interface CloudPuffConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Cloud Shape Component
// ---------------------------------------------------------------------------

function CloudShape({
  scale,
  isDark,
}: {
  scale: number;
  isDark: boolean;
}) {
  // Generate a fluffy cloud from overlapping ellipses
  const puffs: CloudPuffConfig[] = [
    { x: 0, y: 20, width: 60, height: 45 },
    { x: 35, y: 10, width: 70, height: 55 },
    { x: 80, y: 15, width: 55, height: 50 },
    { x: 50, y: 0, width: 50, height: 40 },
    { x: 110, y: 25, width: 45, height: 40 },
  ];

  return (
    <div
      className={cn("cloud-shape", isDark && "cloud--dark")}
      style={{
        transform: `scale(${scale})`,
        width: "160px",
        height: "70px",
      }}
    >
      {puffs.map((puff, i) => (
        <div
          key={i}
          className="cloud-puff"
          style={{
            left: `${puff.x}px`,
            top: `${puff.y}px`,
            width: `${puff.width}px`,
            height: `${puff.height}px`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cloud Layer Component
// ---------------------------------------------------------------------------

interface CloudLayerProps {
  layer: "back" | "mid" | "front";
  clouds: CloudConfig[];
  isDark: boolean;
}

function CloudLayer({ layer, clouds, isDark }: CloudLayerProps) {
  return (
    <div className={cn("cloud-layer", `cloud-layer--${layer}`)}>
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className={cn("cloud", isDark && "cloud--dark")}
          style={{
            "--cloud-y": `${cloud.y}%`,
            "--cloud-delay": `${cloud.delay}s`,
          } as React.CSSProperties}
        >
          <CloudShape scale={cloud.scale} isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateClouds(count: number, layer: "back" | "mid" | "front"): CloudConfig[] {
  const yRanges = {
    back: { min: 5, max: 25 },
    mid: { min: 15, max: 40 },
    front: { min: 25, max: 50 },
  };

  const scaleRanges = {
    back: { min: 0.5, max: 0.7 },
    mid: { min: 0.7, max: 0.9 },
    front: { min: 0.9, max: 1.2 },
  };

  const range = yRanges[layer];
  const scaleRange = scaleRanges[layer];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    y: range.min + Math.random() * (range.max - range.min),
    delay: Math.random() * 30,
    scale: scaleRange.min + Math.random() * (scaleRange.max - scaleRange.min),
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface CloudsEffectProps {
  className?: string;
  isDark?: boolean;
}

export function CloudsEffect({ className, isDark = false }: CloudsEffectProps) {
  const { effectIntensity } = useWeatherWidget();

  const config = EFFECT_INTENSITY_CONFIG[effectIntensity];
  const baseCount = config.cloudCount;
  const opacity = config.opacity;

  const layers = React.useMemo(() => {
    return {
      back: generateClouds(Math.ceil(baseCount * 0.3), "back"),
      mid: generateClouds(Math.ceil(baseCount * 0.4), "mid"),
      front: generateClouds(Math.ceil(baseCount * 0.3), "front"),
    };
  }, [baseCount]);

  if (effectIntensity === "none") {
    return null;
  }

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <CloudLayer layer="back" clouds={layers.back} isDark={isDark} />
      <CloudLayer layer="mid" clouds={layers.mid} isDark={isDark} />
      <CloudLayer layer="front" clouds={layers.front} isDark={isDark} />
    </div>
  );
}
