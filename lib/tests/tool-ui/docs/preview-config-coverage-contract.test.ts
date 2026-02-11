import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
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

  test("social post previews are centered in wrapper containers", () => {
    const socialIds: ComponentId[] = ["instagram-post", "linkedin-post", "x-post"];

    for (const componentId of socialIds) {
      const config = getPreviewConfig(componentId);
      expect(config).toBeDefined();
      expect(config?.wrapper).toBeDefined();

      const wrapperMarkup = renderToStaticMarkup(
        React.createElement(config!.wrapper!, null, "preview"),
      );

      expect(wrapperMarkup).toContain("mx-auto");
    }
  });

  test("weather widget preview defaults to thunderstorm preset", () => {
    const config = getPreviewConfig("weather-widget");

    expect(config).toBeDefined();
    expect(config?.defaultPreset).toBe("thunderstorm");
  });
});
