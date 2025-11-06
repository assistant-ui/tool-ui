"use client";

import * as React from "react";
import { cn } from "./_cn";

interface MediaCardProgressProps {
  className?: string;
}

export function MediaCardProgress({ className }: MediaCardProgressProps) {
  return (
    <div className={cn("flex w-full animate-pulse flex-col gap-3", className)}>
      <div className="flex items-center gap-3 text-xs">
        <div className="bg-muted h-6 w-6 rounded-full" />
        <div className="bg-muted h-3 w-28 rounded" />
      </div>
      <div className="bg-muted h-40 w-full rounded-lg" />
      <div className="bg-muted h-4 w-3/4 rounded" />
      <div className="flex gap-2">
        <div className="bg-muted h-8 w-20 rounded-full" />
        <div className="bg-muted h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}
