import fs from "node:fs";
import path from "node:path";

export type InferredReleaseNotes = {
  breakingChanges: string[];
  changes: string[];
  migrationPrompt: string | null;
};

type RenderReleaseSectionInput = {
  date: string;
  notes: InferredReleaseNotes;
};

type UpsertReleaseSectionInput = {
  content: string;
  date: string;
  section: string;
};

export type ChangelogValidationResult = {
  ok: boolean;
  errors: string[];
};

type SectionBounds = {
  heading: string;
  start: number;
  end: number;
};

function normalizeItemList(items: string[]): string[] {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "));
}

function escapeTemplateLiteralContent(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function listToBullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function parseReleaseSectionBounds(content: string): SectionBounds[] {
  const sections: SectionBounds[] = [];
  const headingRegex = /^##\s+([^\n]+)$/gm;
  const matches = Array.from(content.matchAll(headingRegex));

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? content.length;
    sections.push({
      heading: match[1]?.trim() ?? "",
      start,
      end,
    });
  }

  return sections;
}

function parseSubsectionHeadings(sectionContent: string): string[] {
  const headingRegex = /^###\s+([^\n]+)$/gm;
  return Array.from(sectionContent.matchAll(headingRegex))
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean);
}

export function createInitialChangelogContent(): string {
  return `import { DocsHeader } from "../_components/docs-header";

<DocsHeader
  title="Changelog"
  mdxPath="app/docs/changelog/content.mdx"
/>\n`;
}

export function ensureChangelogFileExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, createInitialChangelogContent(), "utf8");
}

export function renderReleaseSection({
  date,
  notes,
}: RenderReleaseSectionInput): string {
  const breakingChanges = normalizeItemList(notes.breakingChanges);
  const changes = normalizeItemList(notes.changes);
  const migrationPrompt = notes.migrationPrompt?.trim() ?? null;

  if (changes.length === 0) {
    throw new Error("Changelog rendering requires at least one change.");
  }

  const lines: string[] = [`## ${date}`, ""];

  if (breakingChanges.length > 0) {
    lines.push("### Breaking changes", "", listToBullets(breakingChanges), "");
  }

  if (breakingChanges.length > 0 && migrationPrompt) {
    const escapedPrompt = escapeTemplateLiteralContent(migrationPrompt);
    lines.push(
      "### Migration prompt",
      "",
      '<div className="not-prose max-h-[300px] overflow-auto rounded-lg border border-border">',
      '  <pre className="m-0 whitespace-pre-wrap p-4 text-sm leading-6">',
      `{\`${escapedPrompt}\`}`,
      "  </pre>",
      "</div>",
      "",
    );
  }

  lines.push("### Changes", "", listToBullets(changes));
  return `${lines.join("\n").trimEnd()}\n`;
}

export function upsertReleaseSection({
  content,
  date,
  section,
}: UpsertReleaseSectionInput): string {
  const nextSection = section.trim();
  const sections = parseReleaseSectionBounds(content);
  const heading = date.trim();

  const existing = sections.find((candidate) => candidate.heading === heading);
  if (existing) {
    const before = content.slice(0, existing.start).trimEnd();
    const after = content.slice(existing.end).replace(/^\s+/, "");
    return `${before}\n\n${nextSection}\n${after ? `\n${after}` : ""}`.trimEnd() + "\n";
  }

  const insertAt = sections[0]?.start ?? content.length;
  const before = content.slice(0, insertAt).trimEnd();
  const after = content.slice(insertAt).replace(/^\s+/, "");
  return `${before}\n\n${nextSection}\n${after ? `\n${after}` : ""}`.trimEnd() + "\n";
}

export function validateChangelogStructure(
  content: string,
): ChangelogValidationResult {
  const errors: string[] = [];
  const sections = parseReleaseSectionBounds(content);

  if (sections.length === 0) {
    errors.push("Changelog must include at least one release section (## YYYY-MM-DD).");
    return { ok: false, errors };
  }

  for (const section of sections) {
    const sectionContent = content.slice(section.start, section.end);
    const subsectionNames = parseSubsectionHeadings(sectionContent);
    const migrationPromptCount = subsectionNames.filter(
      (name) => name === "Migration prompt",
    ).length;
    const firstSubheadingMatch = sectionContent.match(/^###\s+[^\n]+$/m);

    if (!firstSubheadingMatch) {
      errors.push(
        `Release "${section.heading}" must include subsection headings.`,
      );
      continue;
    }

    const headingLine = sectionContent.match(/^##\s+[^\n]+/)?.[0] ?? "";
    const introArea = sectionContent
      .slice(
        sectionContent.indexOf(headingLine) + headingLine.length,
        firstSubheadingMatch.index,
      )
      .trim();

    if (introArea.length > 0) {
      errors.push(
        `Release "${section.heading}" contains prose before the first subsection heading.`,
      );
    }

    const idxBreaking = subsectionNames.indexOf("Breaking changes");
    const idxMigration = subsectionNames.indexOf("Migration prompt");
    const idxChanges = subsectionNames.indexOf("Changes");

    if (idxChanges === -1) {
      errors.push(`Release "${section.heading}" is missing "### Changes".`);
    }

    if (idxBreaking !== -1 && idxChanges !== -1 && idxBreaking > idxChanges) {
      errors.push(
        `Release "${section.heading}" must place "### Breaking changes" before "### Changes".`,
      );
    }

    if (idxMigration !== -1 && idxChanges !== -1 && idxMigration > idxChanges) {
      errors.push(
        `Release "${section.heading}" must place "### Migration prompt" before "### Changes".`,
      );
    }

    if (idxMigration !== -1 && idxBreaking === -1) {
      errors.push(
        `Release "${section.heading}" has "### Migration prompt" but no "### Breaking changes".`,
      );
    }

    if (migrationPromptCount > 1) {
      errors.push(
        `Release "${section.heading}" contains duplicate "### Migration prompt" headings.`,
      );
    }

    if (migrationPromptCount === 1 && !sectionContent.includes("max-h-[300px]")) {
      errors.push(
        `Release "${section.heading}" has a migration prompt but is missing the required max-height style.`,
      );
    }

    for (const subsectionName of subsectionNames) {
      if (
        subsectionName !== "Breaking changes" &&
        subsectionName !== "Migration prompt" &&
        subsectionName !== "Changes"
      ) {
        errors.push(
          `Release "${section.heading}" contains unsupported subsection heading "### ${subsectionName}".`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
