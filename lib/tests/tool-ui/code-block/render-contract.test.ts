// @vitest-environment jsdom

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = createElement;
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

type ShikiMock = {
  codeToHtml: ReturnType<typeof vi.fn>;
};

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

function setupShikiMock(): ShikiMock {
  const loadedLanguages = new Set<string>();
  const codeToHtml = vi.fn((code: string, options: { theme: string }) => {
    return `<pre data-theme="${options.theme}"><code>${code}</code></pre>`;
  });
  const loadLanguage = vi.fn(async (language: string) => {
    loadedLanguages.add(language);
  });
  const getLoadedLanguages = vi.fn(() => Array.from(loadedLanguages));

  vi.doMock("shiki", () => ({
    createHighlighter: vi.fn(async () => ({
      getLoadedLanguages,
      loadLanguage,
      codeToHtml,
    })),
  }));

  return { codeToHtml };
}

async function flushEffects(iterations = 4) {
  for (let i = 0; i < iterations; i += 1) {
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

async function rerenderClient(root: Root, node: ReactNode): Promise<void> {
  await act(async () => {
    root.render(node);
  });
  await flushEffects();
}

async function cleanupClientRender(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("code-block render contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    installMatchMedia(false);
  });

  it("does not reuse highlighted HTML across delimiter-collision inputs", async () => {
    const shiki = setupShikiMock();
    const { CodeBlock } = await import("@/components/tool-ui/code-block");

    const first = h(CodeBlock, {
      id: "collision-a",
      code: "snippet",
      language: "lang::x",
      lineNumbers: "visible",
    });
    const { container, root } = await renderClient(first);

    const second = h(CodeBlock, {
      id: "collision-b",
      code: "snippet::lang",
      language: "x",
      lineNumbers: "visible",
    });
    await rerenderClient(root, second);

    expect(container.textContent).toContain("snippet::lang");
    expect(shiki.codeToHtml).toHaveBeenCalledTimes(2);

    await cleanupClientRender(root, container);
  });

  it("evicts older highlighted HTML entries to keep cache bounded", async () => {
    const shiki = setupShikiMock();
    const { CodeBlock } = await import("@/components/tool-ui/code-block");

    const { container, root } = await renderClient(
      h(CodeBlock, {
        id: "bounded-cache-0",
        code: "code-0",
        language: "text",
        lineNumbers: "visible",
      }),
    );

    const uniqueEntries = 65;
    for (let index = 1; index < uniqueEntries; index += 1) {
      await rerenderClient(
        root,
        h(CodeBlock, {
          id: `bounded-cache-${index}`,
          code: `code-${index}`,
          language: "text",
          lineNumbers: "visible",
        }),
      );
    }

    await rerenderClient(
      root,
      h(CodeBlock, {
        id: "bounded-cache-revisit",
        code: "code-0",
        language: "text",
        lineNumbers: "visible",
      }),
    );

    expect(shiki.codeToHtml).toHaveBeenCalledTimes(uniqueEntries + 1);

    await cleanupClientRender(root, container);
  });

  it("uses data-theme when present on documentElement", async () => {
    const shiki = setupShikiMock();
    document.documentElement.setAttribute("data-theme", "dark");

    const { CodeBlock } = await import("@/components/tool-ui/code-block");
    const { container, root } = await renderClient(
      h(CodeBlock, {
        id: "data-theme-dark",
        code: "const value = 1;",
        language: "typescript",
        lineNumbers: "visible",
      }),
    );

    const call = shiki.codeToHtml.mock.calls.at(0)?.[1] as
      | { theme?: string }
      | undefined;
    expect(call?.theme).toBe("github-dark");

    await cleanupClientRender(root, container);
  });
});
