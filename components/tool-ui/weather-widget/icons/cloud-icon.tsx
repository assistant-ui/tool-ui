"use client";

import * as React from "react";
import { cn } from "../_cn";
import "./icon-styles.css";

export interface CloudIconProps {
  className?: string;
  size?: number;
  variant?: "light" | "dark";
}

export function CloudIcon({
  className,
  size = 32,
  variant = "light",
}: CloudIconProps) {
  const color = variant === "dark" ? "text-slate-500" : "text-slate-300";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(color, "icon-cloud", className)}
    >
      <path
        d="M8 20C5.79 20 4 18.21 4 16C4 13.79 5.79 12 8 12C8.34 12 8.67 12.04 8.99 12.11C9.94 9.68 12.28 8 15 8C18.31 8 21 10.69 21 14C21 14.17 21 14.34 20.98 14.5C23.78 14.97 26 17.24 26 20H8Z"
        fill="currentColor"
      />
    </svg>
  );
}
