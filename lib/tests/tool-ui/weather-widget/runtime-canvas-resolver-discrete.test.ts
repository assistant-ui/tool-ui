import { describe, expect, test } from "vitest";

import { createStudioTimestamp } from "@/lib/weather-authoring/weather-widget/effects/canvas-resolver-base";
import { resolveWeatherEffectsCanvasRuntimeProps } from "@/lib/weather-authoring/weather-widget/effects/canvas-resolver-runtime";
import { getNearestCheckpoint } from "@/lib/weather-authoring/weather-widget/effects/tuning";

describe("runtime weather canvas resolver discrete-state contract", () => {
  test("ignores dynamic weather drivers inside the same condition/checkpoint", () => {
    const timeOfDay = 0.62;
    const timestamp = createStudioTimestamp(timeOfDay, "2026-01-01T00:00:00Z");

    const mild = resolveWeatherEffectsCanvasRuntimeProps({
      conditionCode: "rain",
      timeOfDay,
      timestamp,
      windSpeed: 2,
      precipitationLevel: "light",
      visibility: 10,
    });

    const extreme = resolveWeatherEffectsCanvasRuntimeProps({
      conditionCode: "rain",
      timeOfDay,
      timestamp,
      windSpeed: 60,
      precipitationLevel: "heavy",
      visibility: 0.5,
    });

    expect(extreme).toEqual(mild);
  });

  test("returns the same scene for times that map to the same checkpoint", () => {
    const beforeNoon = 0.49;
    const afterNoon = 0.51;

    expect(getNearestCheckpoint(beforeNoon)).toBe(getNearestCheckpoint(afterNoon));

    const before = resolveWeatherEffectsCanvasRuntimeProps({
      conditionCode: "clear",
      timeOfDay: beforeNoon,
      timestamp: createStudioTimestamp(beforeNoon, "2026-01-01T00:00:00Z"),
    });

    const after = resolveWeatherEffectsCanvasRuntimeProps({
      conditionCode: "clear",
      timeOfDay: afterNoon,
      timestamp: createStudioTimestamp(afterNoon, "2026-01-01T00:00:00Z"),
    });

    expect(after).toEqual(before);
  });
});
