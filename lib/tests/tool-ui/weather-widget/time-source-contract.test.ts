import { describe, expect, test } from "vitest";

import {
  resolveWeatherTime,
  snapTimeOfDayToNearestCheckpoint,
} from "@/lib/weather-authoring/weather-widget/time";

describe("weather-widget time precedence", () => {
  test("prefers time.timeBucket over localTimeOfDay and updatedAt", () => {
    const resolved = resolveWeatherTime({
      time: {
        timeBucket: 2,
        localTimeOfDay: 0.9,
      },
      updatedAt: "2026-01-01T23:59:00Z",
    });

    expect(resolved.source).toBe("timeBucket");
    expect(resolved.timeOfDay).toBeCloseTo((2 + 0.5) / 12, 6);
  });

  test("uses time.localTimeOfDay when no timeBucket is provided", () => {
    const resolved = resolveWeatherTime({
      time: {
        localTimeOfDay: 0.37,
      },
      updatedAt: "2026-01-01T23:59:00Z",
    });

    expect(resolved.source).toBe("localTimeOfDay");
    expect(resolved.timeOfDay).toBeCloseTo(0.37, 6);
  });

  test("falls back to updatedAt when time is missing", () => {
    const resolved = resolveWeatherTime({
      updatedAt: "2026-01-01T18:00:00Z",
    });

    expect(resolved.source).toBe("updatedAt");
    expect(resolved.timeOfDay).toBeCloseTo(0.75, 6);
  });

  test("defaults to noon when no time is available", () => {
    const resolved = resolveWeatherTime({});

    expect(resolved.source).toBe("defaultNoon");
    expect(resolved.timeOfDay).toBe(0.5);
  });

  test("snaps continuous time to nearest checkpoint center", () => {
    expect(snapTimeOfDayToNearestCheckpoint(0.25)).toBe(0.25);
    expect(snapTimeOfDayToNearestCheckpoint(0.37)).toBe(0.25);
    expect(snapTimeOfDayToNearestCheckpoint(0.38)).toBe(0.5);
    expect(snapTimeOfDayToNearestCheckpoint(0.74)).toBe(0.75);
    expect(snapTimeOfDayToNearestCheckpoint(0.99)).toBe(0);
  });
});
