"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface SunIconProps {
  className?: string;
  size?: number;
}

export function SunIcon({ className, size = 32 }: SunIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-amber-400", className)}
    >
      {/* Sun rays - rotating */}
      <g className="icon-sun-rays">
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 16 + Math.cos(angle) * 10;
          const y1 = 16 + Math.sin(angle) * 10;
          const x2 = 16 + Math.cos(angle) * 14;
          const y2 = 16 + Math.sin(angle) * 14;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={0.8}
            />
          );
        })}
      </g>

      {/* Sun core - pulsing */}
      <circle
        cx="16"
        cy="16"
        r="6"
        fill="currentColor"
        className="icon-sun-core"
      />
    </svg>
  );
}
