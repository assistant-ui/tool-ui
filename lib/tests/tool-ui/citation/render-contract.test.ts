import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CitationList } from "@/components/tool-ui/citation";

function getClassForDataSlot(html: string, dataSlot: string): string {
  const tagMatch = html.match(new RegExp(`<[^>]*data-slot="${dataSlot}"[^>]*>`));
  if (!tagMatch) {
    throw new Error(`Could not find class for data-slot="${dataSlot}"`);
  }
  const classMatch = tagMatch[0].match(/class="([^"]+)"/);
  if (!classMatch) {
    throw new Error(`Could not find class for data-slot="${dataSlot}"`);
  }
  return classMatch[1];
}

describe("citation-list render contract", () => {
  test("creates an isolated stacking context for stacked citations", () => {
    const html = renderToStaticMarkup(
      React.createElement(CitationList, {
        id: "citation-list-stacked-isolate-contract",
        variant: "stacked",
        citations: [
          {
            id: "citation-1",
            href: "https://example.com/one",
            title: "Citation One",
            domain: "example.com",
          },
          {
            id: "citation-2",
            href: "https://example.com/two",
            title: "Citation Two",
            domain: "example.com",
          },
        ],
      }),
    );

    const rootClass = getClassForDataSlot(html, "citation-list");
    expect(rootClass).toContain("isolate");
  });
});
