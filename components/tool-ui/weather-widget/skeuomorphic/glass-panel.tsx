"use client";

import * as React from "react";
import { cn } from "../_cn";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface GlassPanelProps {
  className?: string;
  children?: React.ReactNode;
  /** Blur intensity */
  blur?: "sm" | "md" | "lg" | "xl";
  /** Background opacity level */
  opacity?: "light" | "medium" | "heavy";
  /** Whether to show inner glow highlight */
  showHighlight?: boolean;
  /** Border radius variant */
  rounded?: "lg" | "xl" | "2xl" | "3xl";
}

export function GlassPanel({
  className,
  children,
  blur = "xl",
  opacity = "medium",
  showHighlight = true,
  rounded = "2xl",
}: GlassPanelProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const opacityClasses = {
    light: "bg-white/5 dark:bg-black/10",
    medium: "bg-white/10 dark:bg-black/20",
    heavy: "bg-white/20 dark:bg-black/30",
  };

  const roundedClasses = {
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        roundedClasses[rounded],
        blurClasses[blur],
        opacityClasses[opacity],
        "backdrop-saturate-150",

        // Border with subtle glow
        "border border-white/20 dark:border-white/10",

        // Multi-layer shadow for depth
        "shadow-[0_8px_32px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.15)]",

        className,
      )}
    >
      {/* Top edge highlight - simulates light catching the edge */}
      {showHighlight && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            "bg-gradient-to-r from-transparent via-white/40 to-transparent",
          )}
        />
      )}

      {/* Subtle inner shadow for depth */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          roundedClasses[rounded],
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.05)]",
        )}
      />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
