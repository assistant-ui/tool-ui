import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Plan } from "@/components/tool-ui/plan";

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

describe("plan render contract", () => {
  it("renders an accessible progressbar with current completion state", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plan, {
        id: "plan-render-contract",
        title: "Render Contract",
        todos: [
          { id: "todo-1", label: "First", status: "completed" as const },
          { id: "todo-2", label: "Second", status: "pending" as const },
        ],
      }),
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="50"');
  });

  it("creates an isolated stacking context at the root container", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plan, {
        id: "plan-isolate-contract",
        title: "Isolation Contract",
        todos: [{ id: "todo-1", label: "First", status: "pending" as const }],
      }),
    );

    const rootClass = getClassForDataSlot(html, "plan");
    expect(rootClass).toContain("isolate");
  });

  it("does not reserve progress spacing in compact mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plan.Compact, {
        id: "plan-compact-render-contract",
        title: "Compact Render Contract",
        description: "This description should not render in compact mode",
        todos: [
          { id: "todo-1", label: "First", status: "completed" as const },
          { id: "todo-2", label: "Second", status: "pending" as const },
        ],
      }),
    );

    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html).not.toContain('role="progressbar"');
    expect(html).not.toContain('data-slot="card-header"');
    expect(html).not.toContain("Compact Render Contract");
    expect(html).not.toContain("This description should not render in compact mode");
    expect(html).not.toContain("bg-muted/70");
  });
});
