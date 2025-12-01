"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface PartlyCloudyIconProps {
  className?: string;
  size?: number;
}

export function PartlyCloudyIcon({ className, size = 32 }: PartlyCloudyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      {/* Sun behind - with rotation */}
      <g transform="translate(18, 4)">
        <g className="icon-sun-rays">
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 * Math.PI) / 180;
            const x1 = 6 + Math.cos(angle) * 5;
            const y1 = 6 + Math.sin(angle) * 5;
            const x2 = 6 + Math.cos(angle) * 8;
            const y2 = 6 + Math.sin(angle) * 8;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FBBF24"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })}
        </g>
        <circle cx="6" cy="6" r="4" fill="#FBBF24" className="icon-sun-core" />
      </g>

      {/* Cloud in front - drifting */}
      <g className="icon-cloud">
        <path
          d="M6 22C3.79 22 2 20.21 2 18C2 15.79 3.79 14 6 14C6.34 14 6.67 14.04 6.99 14.11C7.94 11.68 10.28 10 13 10C16.31 10 19 12.69 19 16C19 16.17 19 16.34 18.98 16.5C21.78 16.97 24 19.24 24 22H6Z"
          fill="#CBD5E1"
        />
      </g>
    </svg>
  );
}
