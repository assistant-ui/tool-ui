import { describe, expect, test } from "vitest";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { getPreviewConfig, type ComponentId } from "@/lib/docs/preview-config";

describe("preview config coverage contract", () => {
  test("every documented component has preview/code config support", () => {
    const missingPreviewConfigs = componentsRegistry
      .map((component) => component.id)
      .filter((componentId) => !getPreviewConfig(componentId as ComponentId));

    expect(missingPreviewConfigs).toEqual([]);
  });
});
