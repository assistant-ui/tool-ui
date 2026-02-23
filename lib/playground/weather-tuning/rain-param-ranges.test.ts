import { describe, expect, it } from "vitest";

import { PARAMETER_GROUPS } from "@/app/sandbox/weather-tuning/components/parameter-definitions";
import { RAIN_PARAM_LIMITS } from "@/app/sandbox/weather-tuning/lib/constants";

describe("rain parameter ranges", () => {
  it("uses widened rain limits for all rain params", () => {
    const rainGroup = PARAMETER_GROUPS.find((group) => group.layer === "rain");
    expect(rainGroup).toBeDefined();

    const byKey = new Map(rainGroup?.params.map((param) => [param.key, param]));

    expect(byKey.get("glassIntensity")?.max).toBe(
      RAIN_PARAM_LIMITS.glassIntensity.max,
    );
    expect(byKey.get("zoom")?.max).toBe(RAIN_PARAM_LIMITS.zoom.max);
    expect(byKey.get("fallingIntensity")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingIntensity.max,
    );
    expect(byKey.get("fallingSpeed")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingSpeed.max,
    );
    expect(byKey.get("fallingAngle")?.min).toBe(
      RAIN_PARAM_LIMITS.fallingAngle.min,
    );
    expect(byKey.get("fallingAngle")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingAngle.max,
    );
    expect(byKey.get("fallingStreakLength")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingStreakLength.max,
    );
    expect(byKey.get("fallingLayers")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingLayers.max,
    );
    expect(byKey.get("fallingRefraction")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingRefraction.max,
    );
    expect(byKey.get("fallingWaviness")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingWaviness.max,
    );
    expect(byKey.get("fallingThicknessVar")?.max).toBe(
      RAIN_PARAM_LIMITS.fallingThicknessVar.max,
    );
  });

  it("provides substantially more headroom than legacy caps", () => {
    expect(RAIN_PARAM_LIMITS.glassIntensity.max).toBeGreaterThan(1);
    expect(RAIN_PARAM_LIMITS.zoom.max).toBeGreaterThan(2);
    expect(RAIN_PARAM_LIMITS.fallingIntensity.max).toBeGreaterThan(1);
    expect(RAIN_PARAM_LIMITS.fallingSpeed.max).toBeGreaterThan(3);
    expect(RAIN_PARAM_LIMITS.fallingStreakLength.max).toBeGreaterThan(2);
    expect(RAIN_PARAM_LIMITS.fallingLayers.max).toBeGreaterThan(6);
    expect(RAIN_PARAM_LIMITS.fallingRefraction.max).toBeGreaterThan(1);
    expect(RAIN_PARAM_LIMITS.fallingWaviness.max).toBeGreaterThan(1);
    expect(RAIN_PARAM_LIMITS.fallingThicknessVar.max).toBeGreaterThan(1);
  });
});
