import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { WeatherWidget } from "@/lib/weather-authoring/weather-widget/weather-widget";

const effectCompositorProps: Array<Record<string, unknown>> = [];
const weatherDataOverlayProps: Array<Record<string, unknown>> = [];

vi.mock("@/lib/weather-authoring/weather-widget/effects/effect-compositor", () => ({
  EffectCompositor: (props: Record<string, unknown>) => {
    effectCompositorProps.push(props);
    return <div data-testid="effect-compositor" />;
  },
}));

vi.mock("@/lib/weather-authoring/weather-widget/weather-data-overlay", () => ({
  WeatherDataOverlay: (props: Record<string, unknown>) => {
    weatherDataOverlayProps.push(props);
    return <div data-testid="weather-data-overlay" />;
  },
}));

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    matches: initialMatches,
    addEventListener: vi.fn(
      (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listeners.add(callback);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listeners.delete(callback);
      },
    ),
    addListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
      listeners.add(callback);
    }),
    removeListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
      listeners.delete(callback);
    }),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQueryList));

  return {
    setMatches(next: boolean) {
      (mediaQueryList as { matches: boolean }).matches = next;
      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}

function installCssSupportsStub() {
  vi.stubGlobal("CSS", {
    supports: vi.fn(() => true),
  } as unknown as typeof CSS);
}

describe("weather-widget reduced motion contract", () => {
  beforeEach(() => {
    installCssSupportsStub();
  });

  afterEach(() => {
    effectCompositorProps.length = 0;
    weatherDataOverlayProps.length = 0;
    vi.unstubAllGlobals();
  });

  test("reacts to prefers-reduced-motion changes after mount", async () => {
    const media = installMatchMedia(false);

    const { queryByTestId } = render(
      <WeatherWidget
        version="3.1"
        id="weather-1"
        location={{ name: "San Francisco, CA" }}
        units={{ temperature: "fahrenheit" }}
        current={{
          conditionCode: "clear",
          temperature: 72,
          tempMin: 65,
          tempMax: 78,
        }}
        forecast={[
          {
            label: "Now",
            conditionCode: "clear",
            tempMin: 65,
            tempMax: 78,
          },
        ]}
        time={{ timeBucket: 6 }}
      />,
    );

    expect(queryByTestId("effect-compositor")).not.toBeNull();

    act(() => {
      media.setMatches(true);
    });

    await waitFor(() => {
      expect(queryByTestId("effect-compositor")).toBeNull();
    });
  });

  test("preserves continuous custom celestial time-of-day when provided", async () => {
    render(
      <WeatherWidget
        version="3.1"
        id="weather-custom-time"
        location={{ name: "San Francisco, CA" }}
        units={{ temperature: "fahrenheit" }}
        current={{
          conditionCode: "clear",
          temperature: 72,
          tempMin: 65,
          tempMax: 78,
        }}
        forecast={[
          {
            label: "Now",
            conditionCode: "clear",
            tempMin: 65,
            tempMax: 78,
          },
        ]}
        time={{ localTimeOfDay: 0.12 }}
        customEffectProps={{
          celestial: {
            timeOfDay: 0.37,
            moonPhase: 0.5,
            starDensity: 0.25,
            celestialX: 0.5,
            celestialY: 0.4,
            sunSize: 0.15,
            moonSize: 0.12,
            sunGlowIntensity: 0.6,
            sunGlowSize: 0.25,
            sunRayCount: 8,
            sunRayLength: 0.25,
            sunRayIntensity: 0.5,
            moonGlowIntensity: 0.3,
            moonGlowSize: 0.2,
          },
        }}
      />,
    );

    await waitFor(() => {
      const overlayTime = weatherDataOverlayProps.at(-1)?.timeOfDay;
      const compositorTime = effectCompositorProps.at(-1)?.timeOfDay;
      expect(overlayTime).toBe(0.37);
      expect(compositorTime).toBe(0.37);
    });
  });

  test("snaps non-custom weather time to nearest checkpoint", async () => {
    render(
      <WeatherWidget
        version="3.1"
        id="weather-snapped-time"
        location={{ name: "San Francisco, CA" }}
        units={{ temperature: "fahrenheit" }}
        current={{
          conditionCode: "clear",
          temperature: 72,
          tempMin: 65,
          tempMax: 78,
        }}
        forecast={[
          {
            label: "Now",
            conditionCode: "clear",
            tempMin: 65,
            tempMax: 78,
          },
        ]}
        time={{ localTimeOfDay: 0.37 }}
      />,
    );

    await waitFor(() => {
      const overlayTime = weatherDataOverlayProps.at(-1)?.timeOfDay;
      const compositorTime = effectCompositorProps.at(-1)?.timeOfDay;
      expect(overlayTime).toBe(0.25);
      expect(compositorTime).toBe(0.25);
    });
  });
});
