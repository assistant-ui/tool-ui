import { describe, expect, it } from "vitest";

import { PARAMETER_GROUPS } from "@/app/sandbox/weather-tuning/components/parameter-definitions";
import { SNOW_FALL_SPEED_MAX } from "@/app/sandbox/weather-tuning/lib/constants";

describe("snow fall-speed tuning range", () => {
  it("exposes extended max fall speed for sleet/hail tuning", () => {
    const snowGroup = PARAMETER_GROUPS.find((group) => group.layer === "snow");
    expect(snowGroup).toBeDefined();

    const fallSpeed = snowGroup?.params.find(
      (param) => param.key === "fallSpeed",
    );
    expect(fallSpeed).toBeDefined();
    expect(fallSpeed?.max).toBe(SNOW_FALL_SPEED_MAX);
    expect(SNOW_FALL_SPEED_MAX).toBeGreaterThan(3);
  });
});
