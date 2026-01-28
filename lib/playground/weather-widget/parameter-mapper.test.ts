import { describe, expect, test } from "vitest";

import {
  configToRainProps,
  getSceneBrightness,
  mapWeatherToEffects,
} from "@/components/tool-ui/weather-widget/effects/parameter-mapper";

describe("weather-widget parameter-mapper", () => {
  test("haze floors against scaled cloud darkness", () => {
    const config = mapWeatherToEffects({
      condition: "thunderstorm",
      visibility: 10,
      timestamp: "2025-01-01T12:00:00Z",
    });

    // thunderstorm preset cloud.darkness = 0.7 → haze floor = 0.7 * 0.3 = 0.21
    expect(config.atmosphere.haze).toBeCloseTo(0.21, 6);
  });

  test("getSceneBrightness is clamped to [0, 1]", () => {
    const middayClear = getSceneBrightness("2025-01-01T12:00:00Z", "clear");
    const midnightStorm = getSceneBrightness("2025-01-01T00:00:00Z", "thunderstorm");

    for (const value of [middayClear, midnightStorm]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test("rain angle mapping converts degrees to radians-ish", () => {
    const config = mapWeatherToEffects({
      condition: "thunderstorm",
      timestamp: "2025-01-01T12:00:00Z",
    });

    const rain = configToRainProps(config);
    expect(rain).not.toBeNull();
    expect(rain?.fallingAngle).toBeCloseTo(15 * 0.02, 6);
  });
});

