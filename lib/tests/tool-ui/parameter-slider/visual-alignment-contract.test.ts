import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ParameterSlider } from "@/components/tool-ui/parameter-slider";

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

describe("parameter-slider visual alignment contract", () => {
  test("creates an isolated stacking context at the root container", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-isolate-contract",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 42,
          },
        ],
      }),
    );

    const rootClass = getClassForDataSlot(html, "parameter-slider");
    expect(rootClass).toContain("isolate");
  });

  test("keeps fill edge in the same inset coordinate system as the thumb", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-alignment-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: -100,
            max: 100,
            value: 75,
          },
        ],
      }),
    );

    expect(html).toContain(
      "clip-path:inset(0 calc(100% - calc(87.5% + -4.5px)) 0 calc(50% + 0px))",
    );
    expect(html).toContain("white calc(87.5% + -4.5px)");
  });

  test("does not leave a fill gap at the track border for non-crossing sliders", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-gap-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 50,
          },
        ],
      }),
    );

    expect(html).toContain(
      "clip-path:inset(0 calc(100% - calc(50% + 0px)) 0 0)",
    );
  });

  test("snaps non-crossing fill to exact borders at terminal values", () => {
    const minHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-min-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 0,
          },
        ],
      }),
    );
    const maxHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-max-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 100,
          },
        ],
      }),
    );

    // Min: no visible fill strip at the left edge.
    expect(minHtml).toContain("clip-path:inset(0 100% 0 0)");
    // Max: no visible gap at the right edge.
    expect(maxHtml).toContain("clip-path:inset(0 0 0 0)");
  });

  test("snaps cross-zero fill to exact borders at terminal values (audio-eq path)", () => {
    const minHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-audio-eq-min",
        sliders: [
          {
            id: "bass",
            label: "Bass",
            min: -12,
            max: 12,
            value: -12,
            fillClassName: "bg-fuchsia-500/30 dark:bg-fuchsia-400/35",
          },
        ],
      }),
    );
    const maxHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-audio-eq-max",
        sliders: [
          {
            id: "treble",
            label: "Treble",
            min: -12,
            max: 12,
            value: 12,
            fillClassName: "bg-violet-500/30 dark:bg-violet-400/35",
          },
        ],
      }),
    );

    // At minimum: left segment should start flush at left border.
    expect(minHtml).toContain(
      "clip-path:inset(0 calc(100% - calc(50% + 0px)) 0 0)",
    );
    // At maximum: right segment should end flush at right border.
    expect(maxHtml).toContain("clip-path:inset(0 0 0 calc(50% + 0px))");
  });

  test("renders labels and values without text shadows", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-no-text-shadow-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 42,
          },
        ],
      }),
    );

    expect(html).not.toContain("[text-shadow:");
    expect(html).not.toContain("text-shadow:");
  });

  test("uses tuned CSS transitions for fill and thumb movement smoothing", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-css-easing-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 42,
          },
        ],
      }),
    );

    expect(html).toContain("transition-[clip-path] duration-90");
    expect(html).toContain(
      "[&amp;&gt;span]:transition-[left,transform] [&amp;&gt;span]:duration-90",
    );
    expect(html).toContain("ease-[cubic-bezier(0.22,1,0.36,1)]");
    expect(html).not.toContain("duration-180");
  });
});
