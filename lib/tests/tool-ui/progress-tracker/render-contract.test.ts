import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProgressTracker } from "@/components/tool-ui/progress-tracker";

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

describe("progress tracker render contract", () => {
  it("is server-renderable (no client directive)", () => {
    const sourcePath = path.join(
      process.cwd(),
      "components/tool-ui/progress-tracker/progress-tracker.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).not.toContain('"use client"');
  });

  it("renders semantic ordered step markup", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-semantic-list",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "in-progress" as const },
        ],
      }),
    );

    expect(html).toContain("<ol");
    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"));
  });

  it("exposes compound variants on the root export", () => {
    expect(typeof ProgressTracker.Live).toBe("function");
    expect(typeof ProgressTracker.Receipt).toBe("function");

    const liveHtml = renderToStaticMarkup(
      React.createElement(ProgressTracker.Live, {
        id: "progress-tracker-live-variant",
        steps: [{ id: "step-1", label: "First", status: "in-progress" as const }],
      }),
    );

    const receiptHtml = renderToStaticMarkup(
      React.createElement(ProgressTracker.Receipt, {
        id: "progress-tracker-receipt-variant",
        steps: [{ id: "step-1", label: "First", status: "completed" as const }],
        choice: {
          outcome: "success",
          summary: "Complete",
          at: "2026-02-14T00:00:00.000Z",
        },
      }),
    );

    expect(liveHtml).toContain('data-slot="progress-tracker"');
    expect(getClassForDataSlot(liveHtml, "progress-tracker")).toContain(
      "isolate",
    );
    expect(getClassForDataSlot(receiptHtml, "progress-tracker")).toContain(
      "isolate",
    );
    expect(receiptHtml).toContain('data-receipt="true"');
  });

  it("does not render action buttons in display-only v2", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-no-actions",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "pending" as const },
        ],
      }),
    );

    expect(html).not.toContain("@container/actions");
    expect(html).not.toContain("<button");
  });

  it("marks the failed step as current when no step is in progress", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-failed-current-step",
        steps: [
          { id: "connect", label: "Connect", status: "completed" as const },
          {
            id: "migrate",
            label: "Run Migrations",
            status: "failed" as const,
            description: "Failed migration",
          },
          { id: "verify", label: "Verify", status: "pending" as const },
        ],
      }),
    );

    const currentStepMatches = Array.from(
      html.matchAll(/<li[^>]*aria-current="step"[^>]*>[\s\S]*?<\/li>/g),
    );

    expect(currentStepMatches).toHaveLength(1);
    expect(currentStepMatches[0]?.[0]).toContain("Run Migrations");
  });

  it("keeps failed step descriptions visible in interactive mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-failed-description",
        steps: [
          { id: "connect", label: "Connect", status: "completed" as const },
          {
            id: "migrate",
            label: "Run Migrations",
            status: "failed" as const,
            description: "Failed migration",
          },
        ],
      }),
    );

    expect(html).toContain("grid-rows-[1fr] opacity-100");
    expect(html).toContain("Failed migration");
  });

  it("hides inactive descriptions from assistive tech in interactive mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-description-a11y",
        steps: [
          {
            id: "pending-step",
            label: "Pending Step",
            status: "pending" as const,
            description: "This should stay hidden",
          },
          {
            id: "active-step",
            label: "Active Step",
            status: "in-progress" as const,
            description: "This should stay visible",
          },
        ],
      }),
    );

    expect(html).toContain("This should stay hidden");
    expect(html).toContain("This should stay visible");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('aria-hidden="false"');
  });

  it("renders elapsed time using a semantic <time> with dateTime", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-semantic-time",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "in-progress" as const },
        ],
        elapsedTime: 43200,
      }),
    );

    expect(html).toContain("<time");
    expect(html).toContain('dateTime="PT43.2S"');
    expect(html).toContain("43.2s");
  });

  it("rounds sub-minute values consistently at boundary transitions", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-time-boundary",
        steps: [{ id: "step-1", label: "First", status: "in-progress" as const }],
        elapsedTime: 59999,
      }),
    );

    expect(html).toContain("1m 0s");
    expect(html).toContain('dateTime="PT1M"');
    expect(html).not.toContain("60.0s");
  });

  it("renders receipt mode with explicit non-success outcome icons", () => {
    const partialHtml = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-receipt-partial",
        steps: [{ id: "step-1", label: "First", status: "completed" as const }],
        choice: {
          outcome: "partial",
          summary: "Partially complete",
          at: "2026-02-14T00:00:00.000Z",
        },
      }),
    );

    const cancelledHtml = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-receipt-cancelled",
        steps: [{ id: "step-1", label: "First", status: "failed" as const }],
        choice: {
          outcome: "cancelled",
          summary: "Cancelled by user",
          at: "2026-02-14T00:00:00.000Z",
        },
      }),
    );

    expect(partialHtml).toContain('data-receipt="true"');
    expect(partialHtml).toContain('aria-label="Partially complete"');
    expect(partialHtml).toContain("lucide-circle-alert");

    expect(cancelledHtml).toContain("lucide-x");
  });
});
