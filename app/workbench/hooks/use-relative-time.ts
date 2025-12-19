"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/app/workbench/components/activity-utils";

export function useRelativeTime(timestamp: Date): string {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const age = Date.now() - timestamp.getTime();

    // Update frequency based on age:
    // - Under 1 minute: every second
    // - Under 1 hour: every 30 seconds
    // - Otherwise: every minute
    let interval: number;
    if (age < 60_000) {
      interval = 1000;
    } else if (age < 3_600_000) {
      interval = 30_000;
    } else {
      interval = 60_000;
    }

    const timer = setInterval(() => {
      forceUpdate((n) => n + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [timestamp]);

  return formatRelativeTime(timestamp);
}
