import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function walkTsx(relativeDir: string): string[] {
  const root = path.resolve(process.cwd(), relativeDir);
  const files: string[] = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
        continue;
      }
      if (!entry.isFile() || !absolute.endsWith(".tsx")) continue;
      files.push(path.relative(process.cwd(), absolute));
    }
  }

  return files.sort();
}

describe("tool-ui action button style contracts", () => {
  it("keeps shared ActionButtons pill shaped", () => {
    const source = read("components/tool-ui/shared/action-buttons.tsx");
    expect(source).toContain('"rounded-full px-4!"');
  });

  it("requires ActionButtons consumers to render an explicit action surface", () => {
    const files = walkTsx("components/tool-ui");
    const consumers = files.filter((file) =>
      read(file).includes("<ActionButtons"),
    );

    for (const file of consumers) {
      const source = read(file);
      expect(source, file).toContain("@container/actions");
    }
  });

  it("keeps direct QuestionFlow footer actions pill shaped", () => {
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
