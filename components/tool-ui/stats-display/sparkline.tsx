"use client";

import type { CSSProperties } from "react";
import { useId } from "react";
import { cn } from "./_adapter";

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  showFill?: boolean;
  fillOpacity?: number;
}

export function Sparkline({
  data,
  color = "currentColor",
  width = 64,
  height = 24,
  className,
  style,
  showFill = false,
  fillOpacity = 0.8,
}: SparklineProps) {
  const gradientId = useId();

  if (data.length < 2) {
    return null;
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const padding = 0;
  const usableWidth = width;
  const usableHeight = height;

  const linePoints = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * usableWidth;
    const y = padding + usableHeight - ((value - minVal) / range) * usableHeight;
    return { x, y };
  });

  const linePointsString = linePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPointsString = [
    `${padding},${height}`,
    ...linePoints.map((p) => `${p.x},${p.y}`),
    `${width - padding},${height}`,
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={cn("h-full w-full shrink-0", className)}
      style={style}
      preserveAspectRatio="none"
    >
      {showFill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={areaPointsString} fill={`url(#${gradientId})`} />
        </>
      )}
      <polyline
        points={linePointsString}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.15}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
