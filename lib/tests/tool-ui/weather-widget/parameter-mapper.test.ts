import { describe, expect, test } from "vitest";

import {
  configToRainProps,
  configToSnowProps,
  getMoonPhase,
  getSceneBrightness,
  timeOfDayToSunAltitude,
  mapWeatherToEffects,
} from "@/lib/weather-authoring/weather-widget/effects/parameter-mapper";

describe("weather-widget parameter-mapper", () => {
  test("haze floors against scaled cloud darkness", () => {
    const config = mapWeatherToEffects({
      conditionCode: "thunderstorm",
      visibility: 10,
      timestamp: "2025-01-01T12:00:00Z",
    });

    // thunderstorm preset cloud.darkness = 0.7 → haze floor = 0.7 * 0.3 = 0.21
    expect(config.atmosphere.haze).toBeCloseTo(0.21, 6);
  });

  test("getSceneBrightness is clamped to [0, 1]", () => {
    const middayClear = getSceneBrightness("2025-01-01T12:00:00Z", "clear");
    const midnightStorm = getSceneBrightness(
      "2025-01-01T00:00:00Z",
      "thunderstorm",
    );

    for (const value of [middayClear, midnightStorm]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  test("rain angle mapping converts degrees to radians-ish", () => {
    const config = mapWeatherToEffects({
      conditionCode: "thunderstorm",
      timestamp: "2025-01-01T12:00:00Z",
    });

    const rain = configToRainProps(config);
    expect(rain).not.toBeNull();
    expect(rain?.fallingAngle).toBeCloseTo(15 * 0.02, 6);
  });

  test("hail condition includes snow layer so mixed precip is visible", () => {
    const config = mapWeatherToEffects({
      conditionCode: "hail",
      timestamp: "2025-01-01T12:00:00Z",
    });

    const snow = configToSnowProps(config);
    expect(snow).not.toBeNull();
    expect(snow?.intensity ?? 0).toBeGreaterThan(0);
  });

  test("explicit timeOfDay drives atmosphere day/night state even when timestamp differs", () => {
    const config = mapWeatherToEffects({
      conditionCode: "clear",
      // Noon timestamp conflicts with explicit midnight timeOfDay.
      timestamp: "2025-01-01T12:00:00Z",
      timeOfDay: 0,
    });

    expect(config.celestial?.timeOfDay).toBe(0);
    expect(config.atmosphere.sunAltitude).toBeCloseTo(
      timeOfDayToSunAltitude(0),
      6,
    );
    expect(config.atmosphere.starVisibility).toBeGreaterThan(0);
  });

  test("getMoonPhase stays in [0, 1] for pre-2000 timestamps", () => {
    const phase = getMoonPhase("1999-01-01T12:00:00Z");

    expect(phase).toBeGreaterThanOrEqual(0);
    expect(phase).toBeLessThanOrEqual(1);
  });
});
