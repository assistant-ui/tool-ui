import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { WeatherWidget } from "@/lib/weather-authoring/weather-widget";

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

describe("weather-widget layout containment", () => {
  test("keeps size containment off the outer wrapper to avoid collapsing height", () => {
    const html = renderToStaticMarkup(
      createElement(WeatherWidget, {
        version: "3.1",
        id: "weather-1",
        location: { name: "San Francisco, CA" },
        units: { temperature: "fahrenheit" },
        current: {
          temperature: 72,
          tempMin: 65,
          tempMax: 78,
          conditionCode: "snow",
        },
        forecast: [
          { label: "Now", tempMin: 65, tempMax: 78, conditionCode: "snow" },
          { label: "Tue", tempMin: 64, tempMax: 77, conditionCode: "snow" },
          { label: "Wed", tempMin: 62, tempMax: 75, conditionCode: "snow" },
          { label: "Thu", tempMin: 60, tempMax: 73, conditionCode: "snow" },
          { label: "Fri", tempMin: 63, tempMax: 76, conditionCode: "snow" },
        ],
        time: { timeBucket: 4 },
      }),
    );

    const wrapperClass = getClassForDataSlot(html, "weather-widget");
    const cardClass = getClassForDataSlot(html, "card");

    expect(wrapperClass).toContain("isolate");
    expect(wrapperClass).not.toContain("[container-type:size]");
    expect(cardClass).toContain("@container/weather");
    expect(cardClass).toContain("[container-type:size]");
    expect(html).not.toContain(" jsx=");
  });
});
