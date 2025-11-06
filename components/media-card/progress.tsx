"use client";

import * as React from "react";
import { cn } from "./_cn";

interface MediaCardProgressProps {
  className?: string;
}

export function MediaCardProgress({ className }: MediaCardProgressProps) {
  return (
    <div className={cn("flex w-full flex-col gap-3 animate-pulse", className)}>
      <div className="flex items-center gap-3 text-xs">
        <div className="h-6 w-6 rounded-full bg-muted" />
        <div className="h-3 w-28 rounded bg-muted" />
      </div>
      <div className="h-40 w-full rounded-lg bg-muted" />
      <div className="h-4 w-3/4 rounded bg-muted" />
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-full bg-muted" />
        <div className="h-8 w-16 rounded-full bg-muted" />
      </div>
    </div>
  );
}
