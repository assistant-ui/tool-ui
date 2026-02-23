import { describe, expect, test } from "vitest";
import { buildInferencePrompt } from "@/lib/changelog/inference";

describe("changelog inference prompt", () => {
  test("includes cross-component guidance to avoid seed-component bias", () => {
    const prompt = buildInferencePrompt({
      releaseDate: "2026-02-12",
      changedFiles: ["components/tool-ui/data-table/schema.ts"],
      commitSummary: "- abc1234 refactor: migrate schema entrypoints",
      changelogTemplateContext: "## 2026-02-11\n\n### Changes\n\n- Example",
    });

    expect(prompt).toContain(
      "Avoid over-indexing on a seed component (for example DataTable) when scope is cross-component.",
    );
    expect(prompt).toContain(
      "Include markdown links to relevant docs routes when confidence is high (for example [Actions](/docs/actions) for action-model changes).",
    );
    expect(prompt).toContain(
      "Cross-component schema migration (global wording)",
    );
    expect(prompt).toContain(
      'Bad breakingChanges example: ["DataTable moved to /schema entrypoint."]',
    );
  });

  test("includes component-local example and dynamic evidence sections", () => {
    const prompt = buildInferencePrompt({
      releaseDate: "2026-02-12",
      changedFiles: [
        "components/tool-ui/option-list/schema.ts",
        "components/tool-ui/option-list/option-list.tsx",
      ],
      commitSummary:
        "- def5678 fix(option-list): tighten selection constraints",
      changelogTemplateContext: "## 2026-02-11\n\n### Changes\n\n- Example",
    });

    expect(prompt).toContain("Component-local fix (specific wording)");
    expect(prompt).toContain("Changed files:");
    expect(prompt).toContain("Commit evidence:");
    expect(prompt).toContain("- components/tool-ui/option-list/schema.ts");
    expect(prompt).toContain(
      "- def5678 fix(option-list): tighten selection constraints",
    );
  });
});
