"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface SnowIconProps {
  className?: string;
  size?: number;
}

export function SnowIcon({ className, size = 32 }: SnowIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-slate-400", className)}
    >
      {/* Cloud base */}
      <path
        d="M8 16C5.79 16 4 14.21 4 12C4 9.79 5.79 8 8 8C8.34 8 8.67 8.04 8.99 8.11C9.94 5.68 12.28 4 15 4C18.31 4 21 6.69 21 10C21 10.17 21 10.34 20.98 10.5C23.78 10.97 26 13.24 26 16H8Z"
        fill="currentColor"
        opacity={0.9}
      />

      {/* Snowflakes - animated */}
      <g className="text-white">
        {/* Snowflake 1 */}
        <g className="icon-snow-flake" transform="translate(8, 19)">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </g>

        {/* Snowflake 2 */}
        <g className="icon-snow-flake" transform="translate(15, 18)">
          <circle cx="2" cy="2" r="2.5" fill="currentColor" />
        </g>

        {/* Snowflake 3 */}
        <g className="icon-snow-flake" transform="translate(21, 19)">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        </g>
      </g>
    </svg>
  );
}
