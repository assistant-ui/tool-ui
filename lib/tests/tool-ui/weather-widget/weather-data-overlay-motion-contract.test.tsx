import { act, fireEvent, render, waitFor } from "@testing-library/react";
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

  test("coalesces rapid pointer movement updates into one animation frame", async () => {
    const rafCallbacks: Array<FrameRequestCallback | null> = [];
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      rafCallbacks.push(callback);
      return rafCallbacks.length;
    });
    const cancelAnimationFrameMock = vi.fn((id: number) => {
      const index = id - 1;
      if (index >= 0 && index < rafCallbacks.length) {
        rafCallbacks[index] = null;
      }
    });

    vi.stubGlobal(
      "requestAnimationFrame",
      requestAnimationFrameMock as typeof requestAnimationFrame,
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      cancelAnimationFrameMock as typeof cancelAnimationFrame,
    );

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
    fireEvent.mouseMove(overlayRoot, { clientX: 100, clientY: 100 });

    // No synchronous state update while pointer events are being coalesced.
    expect(getEdgeGlowOpacity(container)).toBe(0);
    expect(requestAnimationFrameMock).toHaveBeenCalledTimes(1);

    act(() => {
      rafCallbacks[0]?.(16);
    });

    await waitFor(() => {
      const opacity = getEdgeGlowOpacity(container);
      expect(opacity).toBeGreaterThan(0);
      // Uses the latest pointer event (100,100), not the first (20,20).
      expect(opacity).toBeLessThan(0.2);
    });
  });
});
