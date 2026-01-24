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
  fillOpacity = 0.09,
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

  const animationDelay = style?.animationDelay ?? "0ms";

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
          <polygon
            points={areaPointsString}
            fill={`url(#${gradientId})`}
            className="animate-in fade-in duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] fill-mode-both"
            style={{ animationDelay }}
          />
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
      <polyline
        points={linePointsString}
        fill="none"
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="0.36 0.64"
        strokeDashoffset={1}
        strokeOpacity={0}
        className="animate-[sparkline-glint-slow_0.8s_ease-out_forwards]"
        style={{ animationDelay }}
      />
      <polyline
        points={linePointsString}
        fill="none"
        stroke={color}
        strokeWidth={0.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="0.24 0.76"
        strokeDashoffset={1}
        strokeOpacity={0}
        className="animate-[sparkline-glint_0.8s_ease-out_forwards]"
        style={{ animationDelay }}
      />
      <style>{`
        @keyframes sparkline-glint {
          0% { stroke-dashoffset: 1; stroke-opacity: 0; }
          20% { stroke-opacity: 0.9; }
          100% { stroke-dashoffset: -1; stroke-opacity: 0; }
        }
        @keyframes sparkline-glint-slow {
          0% { stroke-dashoffset: 1; stroke-opacity: 0; }
          20% { stroke-opacity: 0.2; }
          100% { stroke-dashoffset: -1; stroke-opacity: 0; }
        }
      `}</style>
    </svg>
  );
}
