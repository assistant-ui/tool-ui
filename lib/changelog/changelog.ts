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
  generatedToRef?: string | null;
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

type SubsectionBounds = {
  heading: string;
  headingEnd: number;
  start: number;
  end: number;
};

function normalizeItemList(items: string[]): string[] {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "));
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

function parseSubsectionBounds(sectionContent: string): SubsectionBounds[] {
  const headingRegex = /^###\s+([^\n]+)$/gm;
  const matches = Array.from(sectionContent.matchAll(headingRegex));

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const headingText = match[0] ?? "";
    const heading = match[1]?.trim() ?? "";
    const headingEnd = start + headingText.length;
    const end = matches[index + 1]?.index ?? sectionContent.length;
    return {
      heading,
      headingEnd,
      start,
      end,
    };
  });
}

function hasMarkdownCodeFence(input: string): boolean {
  const normalized = input.trim();
  if (!normalized) return false;

  return /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/m.test(normalized);
}

function toMarkdownCodeFence(input: string, language: string): string {
  const normalized = input.replace(/\r\n/g, "\n").trimEnd();
  const backtickRuns = Array.from(normalized.matchAll(/`+/g), (match) =>
    match[0].length,
  );
  const maxBacktickRun = backtickRuns.length > 0 ? Math.max(...backtickRuns) : 0;
  const fence = "`".repeat(Math.max(3, maxBacktickRun + 1));
  return `${fence}${language}\n${normalized}\n${fence}`;
}

function extractGeneratedToRef(content: string): string | null {
  const markerMatch = content.match(
    /(?:<!--\s*changelog-generated-to:\s*([^\s>][^>]*)\s*-->|\{\/\*\s*changelog-generated-to:\s*(\S+)\s*\*\/\})/,
  );
  const marker = (markerMatch?.[1] ?? markerMatch?.[2])?.trim();
  return marker && marker.length > 0 ? marker : null;
}

function extractReleaseDateFromHeading(heading: string): string | null {
  const normalizedHeading = heading.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedHeading)) {
    return null;
  }

  return normalizedHeading;
}

function introAreaContainsOnlyAllowedComments(introArea: string): boolean {
  const stripped = introArea
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .trim();
  return stripped.length === 0;
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
  generatedToRef,
}: RenderReleaseSectionInput): string {
  const breakingChanges = normalizeItemList(notes.breakingChanges);
  const changes = normalizeItemList(notes.changes);
  const migrationPrompt = notes.migrationPrompt?.trim() ?? null;
  const normalizedGeneratedToRef = generatedToRef?.trim() ?? null;

  if (changes.length === 0) {
    throw new Error("Changelog rendering requires at least one change.");
  }

  const lines: string[] = [`## ${date}`, ""];

  if (normalizedGeneratedToRef) {
    lines.push(
      `{/* changelog-generated-to: ${normalizedGeneratedToRef} */}`,
      "",
    );
  }

  if (breakingChanges.length > 0) {
    lines.push("### Breaking changes", "", listToBullets(breakingChanges), "");
  }

  if (migrationPrompt) {
    lines.push(
      "### Migration prompt",
      "",
      toMarkdownCodeFence(migrationPrompt, "text"),
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
    const subsectionBounds = parseSubsectionBounds(sectionContent);
    const subsectionNames = subsectionBounds.map(
      (subsection) => subsection.heading,
    );
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

    if (
      introArea.length > 0 &&
      !introAreaContainsOnlyAllowedComments(introArea)
    ) {
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


    if (migrationPromptCount > 1) {
      errors.push(
        `Release "${section.heading}" contains duplicate "### Migration prompt" headings.`,
      );
    }

    if (migrationPromptCount === 1) {
      const migrationPromptSection = subsectionBounds.find(
        (subsection) => subsection.heading === "Migration prompt",
      );
      const migrationPromptBody = migrationPromptSection
        ? sectionContent.slice(migrationPromptSection.headingEnd, migrationPromptSection.end)
        : "";

      if (!hasMarkdownCodeFence(migrationPromptBody)) {
        errors.push(
          `Release "${section.heading}" has a migration prompt but is missing the required Fumadocs code-block markdown fence.`,
        );
      }
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

export function readLatestReleaseGeneratedToRef(content: string): string | null {
  const sections = parseReleaseSectionBounds(content);
  const latestSection = sections[0];
  if (!latestSection) {
    return null;
  }

  const latestSectionContent = content.slice(latestSection.start, latestSection.end);
  const firstSubheadingMatch = latestSectionContent.match(/^###\s+[^\n]+$/m);
  const markerSearchContent = firstSubheadingMatch
    ? latestSectionContent.slice(0, firstSubheadingMatch.index)
    : latestSectionContent;
  return extractGeneratedToRef(markerSearchContent);
}

export function readLatestReleaseDate(content: string): string | null {
  const sections = parseReleaseSectionBounds(content);
  const latestSection = sections[0];
  if (!latestSection) {
    return null;
  }

  return extractReleaseDateFromHeading(latestSection.heading);
}
