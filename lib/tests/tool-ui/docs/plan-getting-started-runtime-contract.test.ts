import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const PLAN_DOC_PATH = path.join(process.cwd(), "app/docs/plan/content.mdx");

describe("plan getting started runtime contract", () => {
  test("getting started snippets do not rely on local MDX code variables", () => {
    const content = fs.readFileSync(PLAN_DOC_PATH, "utf8");

    // Local MDX variables used in JSX props have caused runtime
    // `ReferenceError` when rendering this page.
    expect(content).not.toContain("code={useInYourAppCode}");
    expect(content).not.toContain("code={registerInRuntimeProviderCode}");
  });
});
