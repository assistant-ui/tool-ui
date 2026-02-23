import { describe, expect, it } from "vitest";

import { resolveGlassBackdropFilterStyles } from "@/lib/weather-authoring/weather-widget/effects";

describe("resolveGlassBackdropFilterStyles", () => {
  it("returns the SVG glass styles when backdrop-filter is present", () => {
    const glassStyles = {
      backdropFilter: "url(data:image/svg+xml,...) blur(10px)",
      WebkitBackdropFilter: "url(data:image/svg+xml,...) blur(10px)",
    } as const;

    expect(
      resolveGlassBackdropFilterStyles({ glassStyles, blurAmount: 30 }),
    ).toBe(glassStyles);
  });

  it("falls back to a simple blur when SVG glass isn't active yet", () => {
    const result = resolveGlassBackdropFilterStyles({
      glassStyles: {},
      blurAmount: 24,
    });

    expect(result).toEqual({
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
    });
  });
});
