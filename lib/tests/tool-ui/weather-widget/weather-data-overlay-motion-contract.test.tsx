import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { WeatherDataOverlay } from "@/lib/weather-authoring/weather-widget/weather-data-overlay";

function getEdgeGlowOpacity(container: HTMLElement): number {
  const glowElements = container.querySelectorAll(
    ".transition-opacity.duration-300.ease-out",
  );
  if (glowElements.length === 0) {
    throw new Error("Expected glow elements to be rendered");
  }
  return Number.parseFloat((glowElements[0] as HTMLElement).style.opacity || "0");
}

function installCssSupportsStub() {
  vi.stubGlobal("CSS", {
    supports: vi.fn(() => true),
  } as unknown as typeof CSS);
}

describe("weather-data-overlay reduced motion contract", () => {
  beforeEach(() => {
    installCssSupportsStub();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("pointer glow responds to mouse movement when reducedMotion is disabled", async () => {
    const { container } = render(
      <WeatherDataOverlay
        location="San Francisco, CA"
        conditionCode="clear"
        temperature={72}
        tempHigh={78}
        tempLow={65}
        forecast={[{ label: "Now", conditionCode: "clear", tempMin: 65, tempMax: 78 }]}
        reducedMotion={false}
      />,
    );

    const overlayRoot = container.firstElementChild as HTMLElement;
    expect(getEdgeGlowOpacity(container)).toBe(0);

    fireEvent.mouseMove(overlayRoot, { clientX: 20, clientY: 20 });

    await waitFor(() => {
      expect(getEdgeGlowOpacity(container)).toBeGreaterThan(0);
    });
  });

  test("pointer glow stays disabled when reducedMotion is enabled", async () => {
    const { container } = render(
      <WeatherDataOverlay
        location="San Francisco, CA"
        conditionCode="clear"
        temperature={72}
        tempHigh={78}
        tempLow={65}
        forecast={[{ label: "Now", conditionCode: "clear", tempMin: 65, tempMax: 78 }]}
        reducedMotion
      />,
    );

    const overlayRoot = container.firstElementChild as HTMLElement;
    expect(getEdgeGlowOpacity(container)).toBe(0);

    fireEvent.mouseMove(overlayRoot, { clientX: 20, clientY: 20 });

    await waitFor(() => {
      expect(getEdgeGlowOpacity(container)).toBe(0);
    });
  });
});
