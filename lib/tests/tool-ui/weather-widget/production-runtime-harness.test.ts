import { describe, expect, test } from "vitest";

import { createProductionHarnessRuntimeInput } from "@/app/sandbox/weather-widget-production/runtime-input";
import { resolveWeatherEffectsCanvasRuntimeProps as resolveBaseCanvasProps } from "@/lib/weather-authoring/weather-widget/effects/canvas-resolver-runtime";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "@/lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated";
import { resolveWeatherEffectsCanvasRuntimeProps as resolveRuntimeDefaults } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-props";

describe("weather-widget production runtime harness", () => {
  test("snaps diagnostics input to the same checkpoint used by production", () => {
    const input = createProductionHarnessRuntimeInput({
      conditionCode: "overcast",
      windSpeed: 3.3,
      precipitationLevel: "none",
      visibility: 10000,
      timeOfDay: 0.37,
      timestamp: "2026-02-18T08:53:00.000Z",
    });

    expect(input.timeOfDay).toBe(0.25);
  });

  test("overcast noon uses stronger tuned post effects than untuned base", () => {
    const input = createProductionHarnessRuntimeInput({
      conditionCode: "overcast" as const,
      windSpeed: 3.3,
      precipitationLevel: "none" as const,
      visibility: 10000,
      timeOfDay: 0.5,
      timestamp: "2026-02-18T12:00:00.000Z",
    });

    const untuned = resolveRuntimeDefaults(resolveBaseCanvasProps(input));
    const tuned = resolveRuntimeDefaults(
      resolveBaseCanvasProps({
        ...input,
        tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
      }),
    );

    expect(tuned.post.godRayIntensity).toBeGreaterThan(
      untuned.post.godRayIntensity,
    );
    expect(tuned.post.godRayIntensity).toBeGreaterThan(0);
    expect(tuned.cloud.ambientDarkness).toBeLessThan(
      untuned.cloud.ambientDarkness,
    );
  });

  test("overcast tuned god rays are checkpoint-shaped and restrained", () => {
    const buildTuned = (timeOfDay: number) =>
      resolveRuntimeDefaults(
        resolveBaseCanvasProps({
          ...createProductionHarnessRuntimeInput({
            conditionCode: "overcast",
            windSpeed: 3.3,
            precipitationLevel: "none",
            visibility: 10000,
            timeOfDay,
            timestamp: "2026-02-18T12:00:00.000Z",
          }),
          tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
        }),
      );

    const dawn = buildTuned(0.25).post.godRayIntensity;
    const noon = buildTuned(0.5).post.godRayIntensity;
    const dusk = buildTuned(0.75).post.godRayIntensity;
    const midnight = buildTuned(0).post.godRayIntensity;

    expect(dawn).toBeGreaterThan(noon);
    expect(dusk).toBeGreaterThan(noon);
    expect(midnight).toBeLessThanOrEqual(noon);
    expect(dawn).toBeLessThanOrEqual(0.4);
    expect(noon).toBeLessThanOrEqual(0.2);
    expect(dusk).toBeLessThanOrEqual(0.4);
    expect(midnight).toBeLessThanOrEqual(0.05);
  });
});
