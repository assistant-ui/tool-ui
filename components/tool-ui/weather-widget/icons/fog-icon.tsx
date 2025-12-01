"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface FogIconProps {
  className?: string;
  size?: number;
}

export function FogIcon({ className, size = 32 }: FogIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-slate-400", className)}
    >
      {/* Small cloud at top */}
      <path
        d="M10 12C8.34 12 7 10.66 7 9C7 7.34 8.34 6 10 6C10.23 6 10.45 6.03 10.66 6.08C11.3 4.83 12.62 4 14.14 4C16.29 4 18.04 5.75 18.04 7.9C18.04 8.02 18.04 8.14 18.02 8.25C19.87 8.58 21.31 10.14 21.31 12H10Z"
        fill="currentColor"
        opacity={0.7}
      />

      {/* Fog lines - drifting */}
      <line
        x1="4"
        y1="17"
        x2="28"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="icon-fog-line"
        opacity={0.8}
      />
      <line
        x1="6"
        y1="21"
        x2="26"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="icon-fog-line"
        opacity={0.6}
      />
      <line
        x1="8"
        y1="25"
        x2="24"
        y2="25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="icon-fog-line"
        opacity={0.4}
      />
    </svg>
  );
}
