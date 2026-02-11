import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const PROJECT_ROOT = process.cwd();
const COMPONENTS_ROOT = path.join(PROJECT_ROOT, "components/tool-ui");
const DOCS_ROOT = path.join(PROJECT_ROOT, "app/docs");
const QUICK_START_DOC_PATH = path.join(DOCS_ROOT, "quick-start/content.mdx");

function listDirectories(rootPath: string): string[] {
  return fs
    .readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe("component docs registry installation contract", () => {
  const componentIds = listDirectories(COMPONENTS_ROOT).filter(
    (name) => name !== "shared",
  );

  test("every shipped component has a docs page", () => {
    const missingDocPages = componentIds.filter(
      (id) => !fs.existsSync(path.join(DOCS_ROOT, id, "content.mdx")),
    );

    expect(missingDocPages).toEqual([]);
  });

  test("component docs are registry-first and contain no zip/manual install instructions", () => {
    for (const componentId of componentIds) {
      const docPath = path.join(DOCS_ROOT, componentId, "content.mdx");
      const content = fs.readFileSync(docPath, "utf8");

      expect(content).toContain("## Source and Install");
      expect(content).toContain(
        `npx shadcn@latest add https://tool-ui.com/r/${componentId}.json`,
      );
      expect(content).not.toContain("--cwd");
      expect(content).not.toContain("pnpm workspace");
      expect(content).not.toContain("### Download");
      expect(content).not.toContain("download-directory.github.io");
      expect(content).not.toContain("Copy the component");
      expect(content).not.toContain("copy files manually");
    }
  });

  test("quick start does not send users to manual copy docs flows", () => {
    const content = fs.readFileSync(QUICK_START_DOC_PATH, "utf8");

    expect(content).not.toContain("manual copy/ZIP");
    expect(content).not.toContain("manual copy");
    expect(content).not.toContain("download ZIP");
    expect(content).not.toContain("download ZIP archives");
  });

  test("quick start uses a single root-level install command", () => {
    const content = fs.readFileSync(QUICK_START_DOC_PATH, "utf8");

    expect(content).toContain(
      "npx shadcn@latest add https://tool-ui.com/r/plan.json",
    );
    expect(content).not.toContain("--cwd");
    expect(content).not.toContain("pnpm workspace");
  });
});
