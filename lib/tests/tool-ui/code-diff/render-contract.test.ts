// @vitest-environment jsdom

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = createElement;
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

function installMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function installClipboard() {
  const writeText = vi.fn(async () => undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return { writeText };
}

function setupPierreMock(lineCount: number) {
  const parseDiffFromFile = vi.fn(() => ({ unifiedLineCount: lineCount }));
  const fileDiffRender = vi.fn((props: { options: Record<string, unknown> }) =>
    h("div", {
      "data-slot": "mock-file-diff",
      "data-style": props.options.diffStyle,
      "data-disable-line-numbers": String(props.options.disableLineNumbers),
    }),
  );
  const patchDiffRender = vi.fn((props: {
    patch: string;
    options: Record<string, unknown>;
  }) =>
    h("div", {
      "data-slot": "mock-patch-diff",
      "data-style": props.options.diffStyle,
      "data-patch": props.patch,
    }),
  );

  vi.doMock("@pierre/diffs", () => ({
    parseDiffFromFile,
    RegisteredCustomThemes: new Map<string, () => Promise<unknown>>(),
  }));

  vi.doMock("@pierre/diffs/react", () => ({
    FileDiff: fileDiffRender,
    PatchDiff: patchDiffRender,
  }));

  return { parseDiffFromFile, fileDiffRender, patchDiffRender };
}

async function flushEffects(iterations = 4) {
  for (let index = 0; index < iterations; index += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

async function renderClient(node: ReactNode): Promise<{
  container: HTMLDivElement;
  root: Root;
}> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(node);
  });
  await flushEffects();

  return { container, root };
}

async function cleanupClientRender(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("code-diff render contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    installMatchMedia(false);
    installClipboard();
  });

  it("renders patch mode without file-mode parsing and supports collapse toggling", async () => {
    const pierre = setupPierreMock(20);
    const { CodeDiff } = await import("@/components/tool-ui/code-diff");
    const patch = "--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n-1\n+2";

    const { container, root } = await renderClient(
      h(CodeDiff.Standard, {
        id: "code-diff-patch-render",
        patch,
        language: "typescript",
        lineNumbers: "visible",
        diffStyle: "unified",
        maxCollapsedLines: 2,
      }),
    );

    expect(pierre.parseDiffFromFile).not.toHaveBeenCalled();
    expect(pierre.patchDiffRender).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-slot="mock-patch-diff"]')).toBeTruthy();
    expect(container.textContent).toContain("Show full diff");

    const toggleButton = Array.from(container.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Show full diff"),
    );
    expect(toggleButton).toBeTruthy();

    await act(async () => {
      toggleButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flushEffects();

    expect(container.textContent).toContain("Collapse");

    await cleanupClientRender(root, container);
  });

  it("renders file mode, forwards options, and copies the new code payload", async () => {
    const pierre = setupPierreMock(4);
    const { writeText } = installClipboard();
    const { CodeDiff } = await import("@/components/tool-ui/code-diff");
    const oldCode = "const count = 1;";
    const newCode = "const count = 2;";

    const { container, root } = await renderClient(
      h(CodeDiff.Standard, {
        id: "code-diff-file-render",
        oldCode,
        newCode,
        language: "typescript",
        lineNumbers: "hidden",
        diffStyle: "split",
      }),
    );

    expect(pierre.parseDiffFromFile).toHaveBeenCalledTimes(1);
    expect(pierre.fileDiffRender).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[data-slot="mock-file-diff"]')).toBeTruthy();

    const fileDiffProps = pierre.fileDiffRender.mock.calls[0]?.[0] as
      | { options: { diffStyle?: string; disableLineNumbers?: boolean } }
      | undefined;
    expect(fileDiffProps?.options.diffStyle).toBe("split");
    expect(fileDiffProps?.options.disableLineNumbers).toBe(true);

    const copyButton = container.querySelector(
      'button[aria-label="Copy code"]',
    ) as HTMLButtonElement | null;
    expect(copyButton).toBeTruthy();

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flushEffects();

    expect(writeText).toHaveBeenCalledWith(newCode);

    await cleanupClientRender(root, container);
  });
});
