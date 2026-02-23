import { describe, expect, test } from "vitest";

import { getRawBaseParamsForCondition } from "@/app/sandbox/weather-compositor/presets";
import { PARAMETER_GROUPS } from "@/app/sandbox/weather-tuning/components/parameter-definitions";

function getNumericKeys(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => typeof v === "number")
    .map(([k]) => k);
}

describe("tuning studio parameter definitions", () => {
  test("covers all numeric params exposed by compositor presets (excluding timeOfDay)", () => {
    const base = getRawBaseParamsForCondition(
      "clear",
      new Date().toISOString(),
    );

    const definedByLayer = new Map<string, Set<string>>();
    for (const group of PARAMETER_GROUPS) {
      const set = definedByLayer.get(group.layer) ?? new Set<string>();
      for (const p of group.params) set.add(p.key);
      definedByLayer.set(group.layer, set);
    }

    const layers: Array<keyof typeof base> = [
      "celestial",
      "cloud",
      "rain",
      "lightning",
      "snow",
      "glass",
      "post",
    ];

    const missing: Record<string, string[]> = {};

    for (const layer of layers) {
      const numericKeys = getNumericKeys(base[layer]).filter(
        (k) => !(layer === "celestial" && k === "timeOfDay"),
      );
      const defined = definedByLayer.get(layer) ?? new Set<string>();
      const layerMissing = numericKeys.filter((k) => !defined.has(k)).sort();
      if (layerMissing.length > 0) missing[layer] = layerMissing;
    }

    expect(missing).toEqual({});
  });
});
