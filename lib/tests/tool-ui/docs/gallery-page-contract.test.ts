import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { galleryComponentDocs } from "@/lib/docs/gallery-component-docs";

const GALLERY_PAGE_PATH = path.join(process.cwd(), "app/docs/gallery/page.tsx");

function getGalleryPageComponentIds(): string[] {
  const content = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");
  return [...content.matchAll(/componentId:\s*"([a-z0-9-]+)"/g)].map(
    (match) => match[1],
  );
}

describe("gallery page contract", () => {
  test("gallery docs map stays in sync with component registry", () => {
    const registryIds = [...componentsRegistry.map((component) => component.id)].sort();
    const galleryIds = [...Object.keys(galleryComponentDocs)].sort();
    expect(galleryIds).toEqual(registryIds);
  });

  test("gallery page renders each mapped component exactly once", () => {
    const pageIds = getGalleryPageComponentIds();
    const uniqueIds = new Set(pageIds);

    expect(uniqueIds.size).toBe(pageIds.length);
    expect([...uniqueIds].sort()).toEqual(Object.keys(galleryComponentDocs).sort());
  });

  test("gallery page provides semantic heading and main landmark", () => {
    const content = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");

    expect(content).toMatch(/<main[\s>]/);
    expect(content).toMatch(/<h1[^>]*>/);
  });

  test("gallery page composes preview cards from a single card config list", () => {
    const content = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");

    expect(content).toContain("const galleryCards: GalleryCardConfig[] = [");
    expect(content).toContain("galleryCards.map((card) => (");
    expect(content).toContain("componentId={card.componentId}");
    expect(content).toContain("{card.render()}");
  });

  test("gallery uses a direct dynamic binding for the code-block variant", () => {
    const content = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");

    expect(content).toContain("const CodeBlock = dynamic(");
    expect(content).toContain(".then((m) => m.CodeBlock)");
    expect(content).toContain("<CodeBlock");
  });
});
