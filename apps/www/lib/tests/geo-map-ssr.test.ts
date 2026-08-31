import { describe, expect, it } from "vitest";

describe("geo-map SSR safety", () => {
  it("imports the facade without evaluating leaflet", async () => {
    expect(globalThis.window).toBeUndefined();
    await expect(import("@/components/tool-ui/geo-map")).resolves.toHaveProperty(
      "GeoMap",
    );
  });
});
