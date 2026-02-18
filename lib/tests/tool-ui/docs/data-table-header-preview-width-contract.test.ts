import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("data-table header preview width contract", () => {
  it("wraps data-table preview in a full-width container", () => {
    const filePath = path.join(process.cwd(), "lib/docs/preview-config.tsx");
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toMatch(
      /"data-table":\s*\{[\s\S]*?<div className="flex w-full flex-col gap-4">[\s\S]*?<DynamicDataTable/,
    );
  });
});
