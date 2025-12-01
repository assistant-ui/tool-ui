"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { getSkyGradient, gradientToCSS } from "./gradient-config";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface SkyGradientProps {
  className?: string;
  children?: React.ReactNode;
}

export function SkyGradient({ className, children }: SkyGradientProps) {
  const { timeOfDay, widget } = useWeatherWidget();
  const gradientConfig = getSkyGradient(timeOfDay, widget.current.condition);
  const cssVars = gradientToCSS(gradientConfig);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        // Smooth transition between gradient states
        "transition-all duration-1000 ease-in-out",
        className,
      )}
      style={{
        ...cssVars,
        background: `linear-gradient(
          to top,
          var(--sky-horizon) 0%,
          var(--sky-mid) var(--sky-mid-position),
          var(--sky-zenith) 100%
        )`,
      }}
    >
      {/* Noise texture overlay for depth */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03]",
          "mix-blend-overlay",
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect for depth */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]",
        )}
      />

      {children}
    </div>
  );
}
