// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test, vi } from "vitest";

import { WeatherDataOverlay as RuntimeWeatherDataOverlay } from "@/components/tool-ui/weather-widget/weather-data-overlay";
import { WeatherDataOverlay as AuthoringWeatherDataOverlay } from "@/lib/weather-authoring/weather-widget/weather-data-overlay";

function installCssSupportsStub() {
  vi.stubGlobal("CSS", {
    supports: vi.fn(() => true),
  } as unknown as typeof CSS);
}

function assertTemperatureA11y(
  Component: typeof AuthoringWeatherDataOverlay,
  unit: "fahrenheit" | "celsius",
) {
  const temperature = 72;
  const expectedUnit = unit === "celsius" ? "Celsius" : "Fahrenheit";

  const { container } = render(
    createElement(Component, {
      location: "San Francisco, CA",
      conditionCode: "clear",
      temperature,
      tempHigh: 78,
      tempLow: 65,
      forecast: [{ label: "Now", conditionCode: "clear", tempMin: 65, tempMax: 78 }],
      unit,
      reducedMotion: true,
    }),
  );

  const spans = Array.from(container.querySelectorAll("span"));
  const temperatureValue = spans.find((span) => span.textContent === "72");
  const temperatureUnit = spans.find((span) => span.textContent === "°F" || span.textContent === "°C");
  const temperatureAnnouncement = spans.find((span) =>
    span.textContent?.includes(`${temperature} degrees ${expectedUnit}`),
  );

  expect(temperatureAnnouncement).toBeDefined();
  expect(temperatureValue?.getAttribute("aria-hidden")).toBe("true");
  expect(temperatureUnit?.getAttribute("aria-hidden")).toBe("true");
}

describe("weather-data-overlay temperature accessibility contract", () => {
  test.each([
    ["authoring", AuthoringWeatherDataOverlay],
    ["runtime", RuntimeWeatherDataOverlay],
  ])("%s overlay provides contextual temperature announcement", (_name, Component) => {
    installCssSupportsStub();
    assertTemperatureA11y(Component, "fahrenheit");
    assertTemperatureA11y(Component, "celsius");
    vi.unstubAllGlobals();
  });
});
