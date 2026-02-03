/** @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, beforeAll } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { TimeSeries } from "@/components/tool-ui/time-series";

function renderTimeSeries(props: React.ComponentProps<typeof TimeSeries>) {
  const container = document.createElement("div");
  container.style.width = "600px";
  container.style.height = "320px";
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(TimeSeries, props));
  });

  return {
    container,
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;
  if (!("ResizeObserver" in globalThis)) {
    class ResizeObserverMock {
      private callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe() {
        this.callback(
          [
            {
              contentRect: {
                width: 600,
                height: 320,
              },
            },
          ] as unknown as ResizeObserverEntry[],
          this,
        );
      }
      disconnect() {}
      unobserve() {}
    }
    (globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserverMock }).ResizeObserver =
      ResizeObserverMock;
  }
});

describe("TimeSeries chart id", () => {
  it("uses a deterministic chart id based on component id", () => {
    const { container, unmount } = renderTimeSeries({
      id: "ts-test",
      title: "Latency",
      points: [
        { t: "2026-02-01T00:00:00.000Z", v: 320 },
        { t: "2026-02-02T00:00:00.000Z", v: 330 },
      ],
    });

    const chart = container.querySelector('[data-slot="chart"]');
    expect(chart).toBeTruthy();
    expect(chart?.getAttribute("data-chart")).toBe("chart-ts-test");

    unmount();
  });
});
