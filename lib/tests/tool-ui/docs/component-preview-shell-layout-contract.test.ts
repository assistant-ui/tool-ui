import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("component preview shell layout contract", () => {
  it("allows horizontal scrolling for the canvas center panel", () => {
    const filePath = path.join(
      process.cwd(),
      "app/docs/_components/component-preview-shell.tsx",
    );
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("scrollbar-subtle relative overflow-x-auto");
  });
});
