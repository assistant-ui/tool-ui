import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("question-flow footer action button contracts", () => {
  it("keeps Back and Next footer actions fully rounded like shared action buttons", () => {
    const source = read("components/tool-ui/question-flow/question-flow.tsx");

    const backButtonClassMatch = source.match(
      /<Button[\s\S]*?onClick=\{onBack\}[\s\S]*?className="([^"]+)"[\s\S]*?>[\s\S]*?Back/,
    );
    const nextButtonClassMatch = source.match(
      /<Button[\s\S]*?onClick=\{onNext\}[\s\S]*?className="([^"]+)"[\s\S]*?>[\s\S]*?\{isLastStep \? "Complete" : "Next"\}/,
    );

    expect(backButtonClassMatch?.[1]).toContain("rounded-full");
    expect(nextButtonClassMatch?.[1]).toContain("rounded-full");
  });
});
