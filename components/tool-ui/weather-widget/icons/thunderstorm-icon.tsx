"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface ThunderstormIconProps {
  className?: string;
  size?: number;
}

export function ThunderstormIcon({ className, size = 32 }: ThunderstormIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      {/* Dark cloud */}
      <path
        d="M8 16C5.79 16 4 14.21 4 12C4 9.79 5.79 8 8 8C8.34 8 8.67 8.04 8.99 8.11C9.94 5.68 12.28 4 15 4C18.31 4 21 6.69 21 10C21 10.17 21 10.34 20.98 10.5C23.78 10.97 26 13.24 26 16H8Z"
        fill="#64748B"
      />

      {/* Lightning bolt - flashing */}
      <path
        d="M16 17L13 23H16L14 28L20 21H16L18 17H16Z"
        fill="#FCD34D"
        className="icon-lightning"
      />

      {/* Rain drops */}
      <g className="text-blue-400">
        <line
          x1="9"
          y1="20"
          x2="9"
          y2="23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="icon-rain-drop"
        />
        <line
          x1="23"
          y1="19"
          x2="23"
          y2="22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="icon-rain-drop"
        />
      </g>
    </svg>
  );
}
