import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import type { InferredReleaseNotes } from "./changelog";

const InferredReleaseNotesSchema = z.object({
  breakingChanges: z.array(z.string().min(1)).default([]),
  changes: z.array(z.string().min(1)).min(1),
  migrationPrompt: z.string().min(1).nullable(),
});

type InferReleaseNotesInput = {
  releaseDate: string;
  commitSummary: string;
  changedFiles: string[];
  changelogTemplateContext: string;
};

const RELEASE_NOTES_SYSTEM_PROMPT =
  "You are generating release notes for a public changelog. Return strict JSON only.";

function extractJsonPayload(text: string): string {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in inferred changelog output.");
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
}

function normalizeInferredNotes(notes: InferredReleaseNotes): InferredReleaseNotes {
  const normalizeText = (text: string): string =>
    text
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\r\n/g, "\n")
      .trim();

  const breakingChanges = notes.breakingChanges
    .map((item) => normalizeText(item))
    .filter(Boolean);
  const changes = notes.changes.map((item) => normalizeText(item)).filter(Boolean);

  const isGlobalSchemaBoundaryLine = (item: string): boolean => {
    const hasToolUiScope =
      /tool ui/i.test(item) &&
      (/component entrypoints?/i.test(item) ||
        /across all components|across tool ui components|all tool ui components|repo-wide/i.test(
          item,
        ));
    const hasSchemaBoundarySignal = /schema|entrypoint|boundary/i.test(item);
    return hasToolUiScope && hasSchemaBoundarySignal;
  };

  const dedupeSchemaScope = (items: string[]): string[] => {
    const hasGlobalSchemaBoundaryLine = items.some((item) =>
      isGlobalSchemaBoundaryLine(item),
    );

    if (!hasGlobalSchemaBoundaryLine) {
      return items;
    }

    return items.filter(
      (item) =>
        !(
          /datatable/i.test(item) &&
          /schema|entrypoint|boundary/i.test(item)
        ),
    );
  };

  const normalizedBreakingChanges = dedupeSchemaScope(breakingChanges);
  const normalizedChanges = dedupeSchemaScope(changes);
  const hasGlobalSchemaBoundaryLine =
    normalizedBreakingChanges.some((item) => isGlobalSchemaBoundaryLine(item)) ||
    normalizedChanges.some((item) => isGlobalSchemaBoundaryLine(item));

  if (normalizedChanges.length === 0) {
    throw new Error("Inferred changelog output must include at least one change.");
  }

  const migrationPrompt = notes.migrationPrompt
    ? normalizeText(notes.migrationPrompt)
    : null;
  const normalizedMigrationPrompt =
    hasGlobalSchemaBoundaryLine && migrationPrompt
      ? migrationPrompt.replace(
          /\btool ui and datatable schemas\b/gi,
          "Tool UI schemas",
        )
      : migrationPrompt;

  return {
    breakingChanges: normalizedBreakingChanges,
    changes: normalizedChanges,
    migrationPrompt:
      normalizedBreakingChanges.length > 0
        ? normalizedMigrationPrompt
        : null,
  };
}

export function parseInferredReleaseNotes(text: string): InferredReleaseNotes {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonPayload(text));
  } catch (error) {
    throw new Error(
      `Invalid inferred changelog payload: ${(error as Error).message}`,
    );
  }

  try {
    return normalizeInferredNotes(InferredReleaseNotesSchema.parse(parsedJson));
  } catch (error) {
    throw new Error(
      `Invalid inferred changelog payload: ${(error as Error).message}`,
    );
  }
}

function selectModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-5-20250929");
  }

  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-5-nano");
  }

  throw new Error(
    "Missing model credentials. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
  );
}

export function buildInferencePrompt(input: InferReleaseNotesInput): string {
  return [
    "Infer release notes from commit evidence.",
    `Release date: ${input.releaseDate}`,
    "",
    "Output JSON schema:",
    '{ "breakingChanges": string[], "changes": string[], "migrationPrompt": string | null }',
    "",
    "Rules:",
    "- Only include a migrationPrompt when breakingChanges is non-empty.",
    "- Keep migrationPrompt as an imperative migration checklist for coding agents.",
    "- Keep entries concise and user-facing.",
    "- Do not include markdown code fences in field values.",
    "- If a change has propagated across Tool UI components, use repo-wide wording.",
    "- Avoid over-indexing on a seed component (for example DataTable) when scope is cross-component.",
    "- Mention a specific component only when evidence indicates scope is actually component-local.",
    "",
    "Scenario examples:",
    "1) Cross-component schema migration (global wording)",
    "Evidence: DataTable commit appears first, then similar schema-entrypoint changes across multiple Tool UI components.",
    "Good breakingChanges example: [\"Tool UI component entrypoints now enforce /schema boundaries across components.\"]",
    "Bad breakingChanges example: [\"DataTable moved to /schema entrypoint.\"]",
    "",
    "2) Component-local fix (specific wording)",
    "Evidence: only option-list files changed, with no matching changes in other components.",
    "Good changes example: [\"Option List receipt preset generation no longer includes onConfirm in receipt mode.\"]",
    "",
    "3) Migration prompt scope",
    "When breaking scope is global, migrationPrompt should describe repo-wide migration steps.",
    "When breaking scope is local, migrationPrompt may mention the affected component directly.",
    "",
    "Existing changelog style sample:",
    input.changelogTemplateContext,
    "",
    "Changed files:",
    input.changedFiles.map((file) => `- ${file}`).join("\n"),
    "",
    "Commit evidence:",
    input.commitSummary,
    "",
    "Return JSON only.",
  ].join("\n");
}

export async function inferReleaseNotes(
  input: InferReleaseNotesInput,
): Promise<InferredReleaseNotes> {
  const model = selectModel();

  const { text } = await generateText({
    model,
    system: RELEASE_NOTES_SYSTEM_PROMPT,
    prompt: buildInferencePrompt(input),
  });

  return parseInferredReleaseNotes(text);
}
