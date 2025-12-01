"use client";

import * as React from "react";
import { cn } from "../_cn";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmbossedTextProps {
  children: React.ReactNode;
  className?: string;
  /** Text style variant */
  variant?: "raised" | "inset";
  /** Size preset */
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** HTML element to render */
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmbossedText({
  children,
  className,
  variant = "raised",
  size = "md",
  as: Component = "span",
}: EmbossedTextProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
  };

  // Raised text: lighter color with dark shadow below
  // Creates the illusion of text popping out
  const raisedClasses = cn(
    "text-white/95",
    "[text-shadow:0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
  );

  // Inset text: darker color with light highlight above
  // Creates the illusion of text pressed into the surface
  const insetClasses = cn(
    "text-white/40",
    "[text-shadow:0_1px_0_rgba(255,255,255,0.15),0_-1px_1px_rgba(0,0,0,0.2)]",
  );

  return (
    <Component
      className={cn(
        sizeClasses[size],
        "font-medium",
        variant === "raised" ? raisedClasses : insetClasses,
        className,
      )}
    >
      {children}
    </Component>
  );
}

// ---------------------------------------------------------------------------
// Specialized Temperature Display
// ---------------------------------------------------------------------------

export interface TemperatureTextProps {
  value: number;
  unit?: "celsius" | "fahrenheit";
  className?: string;
  showDegree?: boolean;
}

export function TemperatureText({
  value,
  unit = "fahrenheit",
  className,
  showDegree = true,
}: TemperatureTextProps) {
  const unitSymbol = unit === "celsius" ? "C" : "F";
  const roundedValue = Math.round(value);

  return (
    <span
      className={cn(
        "inline-flex items-baseline",
        "text-white",
        "[text-shadow:0_2px_8px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <span className="text-6xl font-light tabular-nums tracking-tight">
        {roundedValue}
      </span>
      {showDegree && (
        <span className="ml-0.5 text-3xl font-light text-white/70">
          {"\u00B0"}
          {unitSymbol}
        </span>
      )}
    </span>
  );
}
