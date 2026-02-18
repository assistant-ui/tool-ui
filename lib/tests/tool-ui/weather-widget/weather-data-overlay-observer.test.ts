// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { observeCardDimensions } from "@/lib/weather-authoring/weather-widget/weather-data-overlay";
import { WeatherDataOverlay } from "@/lib/weather-authoring/weather-widget/weather-data-overlay";

function installCssSupportsStub() {
  vi.stubGlobal("CSS", {
    supports: vi.fn(() => true),
  } as unknown as typeof CSS);
}

describe("weather-data-overlay resize observer guard", () => {
  beforeEach(() => {
    installCssSupportsStub();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns a safe no-op cleanup when ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);

    const cleanup = observeCardDimensions({} as HTMLDivElement, vi.fn());

    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  test("observes and disconnects when ResizeObserver exists", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();

    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observe(target);
      }
      disconnect() {
        disconnect();
      }
    }

    vi.stubGlobal(
      "ResizeObserver",
      MockResizeObserver as unknown as typeof ResizeObserver,
    );

    const element = {} as HTMLDivElement;
    const cleanup = observeCardDimensions(element, vi.fn());

    expect(observe).toHaveBeenCalledWith(element);
    cleanup();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  test("attaches observer when forecast strip mounts after initial render", async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();

    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observe(target);
      }
      disconnect() {
        disconnect();
      }
    }

    vi.stubGlobal(
      "ResizeObserver",
      MockResizeObserver as unknown as typeof ResizeObserver,
    );

    const baseProps = {
      location: "San Francisco, CA",
      conditionCode: "clear" as const,
      temperature: 72,
      tempHigh: 78,
      tempLow: 65,
      reducedMotion: true,
    };

    const { rerender } = render(
      createElement(WeatherDataOverlay, { ...baseProps, forecast: [] }),
    );

    expect(observe).toHaveBeenCalledTimes(0);

    rerender(
      createElement(WeatherDataOverlay, {
        ...baseProps,
        forecast: [{ label: "Now", conditionCode: "clear", tempMin: 65, tempMax: 78 }],
      }),
    );

    await waitFor(() => {
      expect(observe).toHaveBeenCalledTimes(1);
    });
  });
});
