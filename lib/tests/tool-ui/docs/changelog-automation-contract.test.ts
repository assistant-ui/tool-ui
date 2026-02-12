import { describe, expect, test } from "vitest";
import {
  renderReleaseSection,
  upsertReleaseSection,
  validateChangelogStructure,
} from "@/lib/changelog/changelog";

describe("changelog automation contract", () => {
  test("renders one migration prompt block for breaking releases", () => {
    const section = renderReleaseSection({
      date: "2026-02-12",
      notes: {
        breakingChanges: ["Schema helpers moved to /schema entrypoints."],
        changes: ["Data Table date formatting is now more consistent."],
        migrationPrompt: "Migrate schema helper imports to /schema entrypoints.",
      },
    });

    expect(section).toContain("## 2026-02-12");
    expect(section).toContain("### Breaking changes");
    expect(section).toContain("### Migration prompt");
    expect(section.match(/### Migration prompt/g)?.length ?? 0).toBe(1);
    expect(section).toContain("max-h-[300px]");
    expect(section).toContain("### Changes");
  });

  test("omits migration prompt for non-breaking releases", () => {
    const section = renderReleaseSection({
      date: "2026-02-12",
      notes: {
        breakingChanges: [],
        changes: ["Data Table date formatting is now more consistent."],
        migrationPrompt: null,
      },
    });

    expect(section).not.toContain("### Breaking changes");
    expect(section).not.toContain("### Migration prompt");
    expect(section).toContain("### Changes");
  });

  test("upserts a release section by date", () => {
    const existing = `import { DocsHeader } from "../_components/docs-header";

<DocsHeader title="Changelog" mdxPath="app/docs/changelog/content.mdx" />

## 2026-02-12

### Changes

- Old change

## 2026-02-11

### Changes

- Prior release change
`;

    const replacement = `## 2026-02-12

### Changes

- New change`;

    const next = upsertReleaseSection({
      content: existing,
      date: "2026-02-12",
      section: replacement,
    });

    expect(next).toContain("- New change");
    expect(next).not.toContain("- Old change");
    expect(next.match(/^## 2026-02-12$/gm)?.length ?? 0).toBe(1);
  });

  test("fails validation when a release has duplicate migration prompt headings", () => {
    const content = `## 2026-02-12

### Breaking changes

- One

### Migration prompt

Text

### Migration prompt

Text

### Changes

- Two`;

    const result = validateChangelogStructure(content);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain(
      'contains duplicate "### Migration prompt" headings',
    );
  });

  test("fails validation when intro prose appears before first subsection", () => {
    const content = `## 2026-02-12

This paragraph should not appear.

### Changes

- One`;

    const result = validateChangelogStructure(content);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain(
      "contains prose before the first subsection heading",
    );
  });
});
