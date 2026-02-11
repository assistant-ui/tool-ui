import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HeaderPreviewTabs } from "@/app/docs/_components/header-preview-tabs";
import type { ComponentId } from "@/lib/docs/preview-config";

describe("header preview tabs runtime contract", () => {
  test("unsupported component ids do not crash rendering", () => {
    const unsupportedComponentId = "instagram-post" as unknown as ComponentId;

    expect(() =>
      renderToString(
        React.createElement(HeaderPreviewTabs, {
          componentId: unsupportedComponentId,
        }),
      ),
    ).not.toThrow();
  });
});
