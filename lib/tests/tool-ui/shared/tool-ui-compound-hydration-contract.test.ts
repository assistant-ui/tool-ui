// @vitest-environment jsdom

import { act, createElement, type ComponentType, type ReactNode } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToolUI } from "@/components/tool-ui/shared";

const h = createElement;
const ToolUIRoot = ToolUI as unknown as ComponentType<{
  id: string;
  children?: ReactNode;
}>;
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

const localActions = [{ id: "export", label: "Export" }];

function createHydrationContainer(serverHtml: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.appendChild(container);
  return container;
}

async function hydrate(container: HTMLDivElement, app: ReactNode): Promise<Root> {
  let root!: Root;

  await act(async () => {
    root = hydrateRoot(container, app);
  });

  await act(async () => {
    await Promise.resolve();
  });

  return root;
}

async function cleanupHydration(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("tool-ui compound hydration contracts", () => {
  it("applies a default stacked gap layout at the ToolUI root", async () => {
    const app = h(
      ToolUIRoot,
      { id: "hydrate-root-layout" },
      h(ToolUI.Surface, null, h("div", { "data-slot": "surface" }, "Surface")),
      h(
        ToolUI.Actions,
        null,
        h(ToolUI.LocalActions, {
          actions: localActions,
          onAction: async () => undefined,
        }),
      ),
    );

    const serverHtml = renderToString(app);
    const container = createHydrationContainer(serverHtml);
    const root = await hydrate(container, app);

    const toolUIRoot = container.querySelector('[data-slot="tool-ui"]');
    expect(toolUIRoot).not.toBeNull();
    expect(toolUIRoot?.getAttribute("data-tool-ui-id")).toBe("hydrate-root-layout");
    expect(toolUIRoot?.className).toContain("flex");
    expect(toolUIRoot?.className).toContain("flex-col");
    expect(toolUIRoot?.className).toContain("gap-3");

    await cleanupHydration(root, container);
  });

  it("reveals ToolUI.Actions only after hydration mounts ToolUI.Surface", async () => {
    const app = h(
      ToolUIRoot,
      { id: "hydrate-surface-present" },
      h(ToolUI.Surface, null, h("div", { "data-slot": "surface" }, "Surface")),
      h(
        ToolUI.Actions,
        null,
        h(ToolUI.LocalActions, {
          actions: localActions,
          onAction: async () => undefined,
        }),
      ),
    );

    const serverHtml = renderToString(app);
    expect(serverHtml).not.toContain('data-slot="tool-ui-actions"');

    const container = createHydrationContainer(serverHtml);
    expect(container.querySelector('[data-slot="tool-ui-actions"]')).toBeNull();

    const root = await hydrate(container, app);

    expect(container.querySelector('[data-slot="tool-ui-actions"]')).not.toBeNull();
    expect(
      container
        .querySelector('[data-slot="tool-ui-actions"]')
        ?.getAttribute("data-tool-ui-id"),
    ).toBe("hydrate-surface-present");
    expect(container.querySelector('[data-slot="local-actions"]')).not.toBeNull();

    await cleanupHydration(root, container);
  });

  it("keeps ToolUI.Actions hidden after hydration when ToolUI.Surface is absent", async () => {
    const app = h(
      ToolUIRoot,
      { id: "hydrate-surface-absent" },
      h(
        ToolUI.Actions,
        null,
        h(ToolUI.LocalActions, {
          actions: localActions,
          onAction: async () => undefined,
        }),
      ),
    );

    const serverHtml = renderToString(app);
    expect(serverHtml).not.toContain('data-slot="tool-ui-actions"');

    const container = createHydrationContainer(serverHtml);
    const root = await hydrate(container, app);

    expect(container.querySelector('[data-slot="tool-ui-actions"]')).toBeNull();
    expect(container.querySelector('[data-slot="local-actions"]')).toBeNull();

    await cleanupHydration(root, container);
  });
});
