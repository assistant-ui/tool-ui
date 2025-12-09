"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";

export interface MorphingChevronProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children"> {
  "data-state"?: "open" | "closed";
}

const PATH_CLOSED = "M 6 9 L 12 15 L 18 9";
const PATH_OPEN = "M 6 15 L 12 9 L 18 15";

export function MorphingChevron({
  className,
  "data-state": state = "closed",
  ...props
}: MorphingChevronProps) {
  const isOpen = state === "open";
  const pathD = isOpen ? PATH_OPEN : PATH_CLOSED;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-state={state}
      className={cn(className)}
      {...props}
    >
      <path
        d={pathD}
        className="motion-safe:transition-[d] motion-safe:duration-200 motion-safe:ease-out"
        style={{ d: `path("${pathD}")` }}
      />
    </svg>
  );
}
