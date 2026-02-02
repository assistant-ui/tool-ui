/** @vitest-environment jsdom */

import React from "react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { ActivityFeed } from "@/components/tool-ui/activity-feed";
import type { ActivityGroup } from "@/components/tool-ui/activity-feed";

function buildItem(id: string, overrides?: Partial<ActivityGroup["items"][number]>) {
  return {
    id,
    type: "commit" as const,
    title: `Commit ${id}`,
    timestamp: "2024-01-01T00:00:00.000Z",
    actor: { name: "Ada Lovelace" },
    ...overrides,
  };
}

function renderActivityFeed(props: React.ComponentProps<typeof ActivityFeed>) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(React.createElement(ActivityFeed, props));
  });

  return {
    container,
    rerender(nextProps: React.ComponentProps<typeof ActivityFeed>) {
      act(() => {
        root.render(React.createElement(ActivityFeed, nextProps));
      });
    },
    unmount() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
});

beforeAll(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;
});

describe("ActivityFeed updateBehavior", () => {
  it("shows a new-items badge and clears it on click", () => {
    vi.useFakeTimers();

    const groupsA: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1")] },
    ];
    const groupsB: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1"), buildItem("2")] },
    ];

    const { container, rerender, unmount } = renderActivityFeed({
      id: "activity-feed-test",
      groups: groupsA,
      updateBehavior: "badge",
    });

    expect(container.querySelector('[data-slot="activity-feed-new-badge"]')).toBeNull();

    rerender({
      id: "activity-feed-test",
      groups: groupsB,
      updateBehavior: "badge",
    });

    const badge = container.querySelector(
      '[data-slot="activity-feed-new-badge"]',
    ) as HTMLElement | null;
    expect(badge).toBeTruthy();
    expect(badge?.textContent ?? "").toContain("1 new");

    act(() => {
      badge?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.querySelector('[data-slot="activity-feed-new-badge"]')).toBeNull();

    unmount();
  });

  it("highlights new items then clears the highlight", () => {
    vi.useFakeTimers();

    const groupsA: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1")] },
    ];
    const groupsB: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1"), buildItem("2")] },
    ];

    const { container, rerender, unmount } = renderActivityFeed({
      id: "activity-feed-test",
      groups: groupsA,
      updateBehavior: "highlight",
    });

    rerender({
      id: "activity-feed-test",
      groups: groupsB,
      updateBehavior: "highlight",
    });

    expect(container.querySelectorAll('[data-new="true"]').length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(container.querySelectorAll('[data-new="true"]').length).toBe(0);

    unmount();
  });
});

describe("ActivityFeed stale state", () => {
  it("shows stale badge after staleAfter elapses", () => {
    vi.useFakeTimers();

    const groups: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1")] },
    ];

    const { container, unmount } = renderActivityFeed({
      id: "activity-feed-test",
      groups,
      updateBehavior: "silent",
      refreshInterval: 10_000,
      staleAfter: 1_000,
    });

    expect(container.querySelector('[data-slot="activity-feed-stale"]')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1_050);
    });

    expect(container.querySelector('[data-slot="activity-feed-stale"]')).toBeTruthy();

    unmount();
  });
});

describe("ActivityFeed maxItems", () => {
  it("caps total items across all groups", () => {
    const groups: ActivityGroup[] = [
      { label: "Today", items: [buildItem("1"), buildItem("2")] },
      { label: "Yesterday", items: [buildItem("3")] },
    ];

    const { container, unmount } = renderActivityFeed({
      id: "activity-feed-test",
      groups,
      maxItems: 2,
    });

    expect(container.querySelectorAll('[data-slot="activity-feed-item"]').length).toBe(2);

    unmount();
  });
});
