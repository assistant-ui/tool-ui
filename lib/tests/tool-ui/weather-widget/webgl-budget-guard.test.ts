import { beforeEach, describe, expect, test } from "vitest";

import {
  __resetWeatherWebglCanvasBudgetForTests,
  getAllocatedWeatherWebglCanvasCount,
  releaseWeatherWebglBudgetSlotOnInitFailure,
  setMaxConcurrentWeatherWebglCanvases,
  tryAcquireWeatherWebglCanvasBudgetSlot,
} from "@/lib/weather-authoring/weather-widget/effects/weather-effects-canvas";

describe("weather-effects-canvas WebGL budget guard", () => {
  beforeEach(() => {
    __resetWeatherWebglCanvasBudgetForTests();
    setMaxConcurrentWeatherWebglCanvases(1);
  });

  test("releases an acquired slot when init fails after budget acquisition", () => {
    const canvas = {} as HTMLCanvasElement;

    expect(tryAcquireWeatherWebglCanvasBudgetSlot(canvas)).toBe(true);
    expect(getAllocatedWeatherWebglCanvasCount()).toBe(1);

    const nextSlotState = releaseWeatherWebglBudgetSlotOnInitFailure(
      canvas,
      true,
    );

    expect(nextSlotState).toBeNull();
    expect(getAllocatedWeatherWebglCanvasCount()).toBe(0);
  });
});
