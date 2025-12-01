"use client";

import * as React from "react";
import { cn } from "../_cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TactileCardProps {
  children: React.ReactNode;
  className?: string;
  /** Visual style variant */
  variant?: "raised" | "inset" | "flat";
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Border radius */
  rounded?: "md" | "lg" | "xl";
  /** Interactive hover state */
  interactive?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TactileCard({
  children,
  className,
  variant = "inset",
  padding = "md",
  rounded = "xl",
  interactive = false,
}: TactileCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  const roundedClasses = {
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
  };

  // Raised: appears to pop out with shadow below
  const raisedClasses = cn(
    "bg-gradient-to-b from-white/15 to-white/5",
    "border border-white/20",
    "shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)]",
  );

  // Inset: appears pressed into the surface
  const insetClasses = cn(
    "bg-black/10 dark:bg-white/5",
    "border border-white/5",
    "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15),inset_0_-1px_0_rgba(255,255,255,0.05)]",
  );

  // Flat: minimal depth, just a subtle background
  const flatClasses = cn(
    "bg-white/5",
    "border border-white/10",
  );

  const variantClasses = {
    raised: raisedClasses,
    inset: insetClasses,
    flat: flatClasses,
  };

  return (
    <div
      className={cn(
        roundedClasses[rounded],
        paddingClasses[padding],
        variantClasses[variant],
        interactive && [
          "cursor-pointer",
          "transition-all duration-150",
          "hover:bg-white/10 hover:border-white/15",
          "active:scale-[0.98]",
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Badge - Small pill for displaying metrics
// ---------------------------------------------------------------------------

export interface StatBadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatBadge({ label, value, icon, className }: StatBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        "rounded-full",
        "bg-black/15",
        "border border-white/10",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      {icon && (
        <span className="text-white/60">{icon}</span>
      )}
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-medium text-white/80">{value}</span>
    </div>
  );
}
