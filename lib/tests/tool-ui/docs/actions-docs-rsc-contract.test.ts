import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("actions docs RSC contract", () => {
  test("keeps interactive handlers out of server-rendered MDX", () => {
    const contentPath = path.resolve(process.cwd(), "app/docs/actions/content.mdx");
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).not.toContain("onAction={");
    expect(content).not.toContain("onCommit={");
  });
});
