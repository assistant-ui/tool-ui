/** @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, beforeAll } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { InsightCard } from "@/components/tool-ui/insight-card";

function renderInsightCard(props: React.ComponentProps<typeof InsightCard>) {
  const container = document.createElement("div");
  container.style.width = "600px";
  container.style.height = "320px";
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(InsightCard, props));
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

    (globalThis as typeof globalThis & {
      ResizeObserver?: typeof ResizeObserverMock;
    }).ResizeObserver = ResizeObserverMock;
  }
});

describe("InsightCard action", () => {
  it("renders an action button from action prop", () => {
    const { container, unmount } = renderInsightCard({
      id: "insight-test",
      title: "Stale Work Alert",
      summary: "No commits in 10 days.",
      action: { id: "draft-pr", label: "Draft fix PR" },
    });

    const button = container.querySelector("button");
    expect(button?.textContent ?? "").toContain("Draft fix PR");
    expect(
      container.querySelector('[data-slot="insight-card"]'),
    ).toBeTruthy();

    unmount();
  });
});
