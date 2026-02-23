import { describe, expect, it } from "vitest";

import { mapToolUiOverridesToCompositor } from "@/app/sandbox/weather-tuning/lib/tool-ui-import";

describe("mapToolUiOverridesToCompositor", () => {
  it("maps rain.glassZoom -> rain.zoom", () => {
    const result = mapToolUiOverridesToCompositor({
      rain: { glassZoom: 1.25 },
    });
    expect(result.rain).toEqual({ zoom: 1.25 });
  });

  it("maps interactions -> compositor groups", () => {
    const result = mapToolUiOverridesToCompositor({
      interactions: {
        rainRefractionStrength: 0.42,
        lightningSceneIllumination: 0.77,
      },
    });
    expect(result.rain).toEqual({ fallingRefraction: 0.42 });
    expect(result.lightning).toEqual({ sceneIllumination: 0.77 });
  });
});
