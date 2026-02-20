import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("gallery tooltip layout contract", () => {
  test("gallery cards keep a single-row clickable tooltip with extended spacing buffer", () => {
    const galleryPagePath = path.join(process.cwd(), "app/docs/gallery/page.tsx");
    const content = fs.readFileSync(galleryPagePath, "utf8");

    expect(content).toContain("group/gallery-card relative pt-[44px]");
    expect(content).toContain("label={componentMeta.name}");
    expect(content).toContain("pointer-events-auto inline-flex items-center");
    expect(content).not.toContain("focus-visible:outline-none");
  });

  test("gallery docs link includes a bullet and keeps name unwrapped", () => {
    const docsLinkPath = path.join(
      process.cwd(),
      "app/docs/_components/gallery-docs-link.tsx",
    );
    const content = fs.readFileSync(docsLinkPath, "utf8");

    expect(content).toMatch(/label:\s*string/);
    expect(content).toContain("whitespace-nowrap");
    expect(content).toContain("•");
    expect(content).toContain("group-hover:underline");
    expect(content).toContain("group-focus-visible:underline");
    expect(content).toContain("focus-visible:ring-2");
    expect(content).toContain("hover:no-underline");
    expect(content).toContain("{label}");
    expect(content).toContain("View Docs");
    expect(content).toContain("componentId: GalleryComponentDocId");
    expect(content).toContain("href: `/docs/${string}`");
  });
});
