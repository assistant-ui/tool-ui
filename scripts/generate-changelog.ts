import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ensureChangelogFileExists,
  readLatestReleaseDate,
  readLatestReleaseGeneratedToRef,
  renderReleaseSection,
  upsertReleaseSection,
  validateChangelogStructure,
} from "../lib/changelog/changelog";
import {
  collectReleaseGitContext,
  formatCommitSummary,
} from "../lib/changelog/git";
import { inferReleaseNotes } from "../lib/changelog/inference";

function resolveArgValue(argv: string[], prefix: string): string | undefined {
  const arg = argv.find((value) => value.startsWith(prefix));
  if (!arg) {
    return undefined;
  }

  const value = arg.slice(prefix.length).trim();
  return value.length > 0 ? value : undefined;
}

function resolveReleaseDate(argv: string[]): string {
  const date = resolveArgValue(argv, "--date=") ?? process.env.CHANGELOG_DATE;
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `Invalid date "${date}". Use YYYY-MM-DD (example: --date=2026-02-12).`,
    );
  }

  return date;
}

function summarizeChangelogStyle(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !line.startsWith("import "));
  return lines.slice(0, 120).join("\n");
}

function resolveStableCommitHash(projectRoot: string, ref: string): string {
  try {
    return execFileSync(
      "git",
      ["-C", projectRoot, "rev-parse", "--verify", `${ref}^{commit}`],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
  } catch {
    throw new Error(
      `Invalid git ref "${ref}". Provide a valid commit-ish for --to (example: --to=HEAD).`,
    );
  }
}

function resolveLatestEntryCommitRef(
  projectRoot: string,
  changelogRelativePath: string,
  entryDate: string,
): string | null {
  try {
    const entryCommit = execFileSync(
      "git",
      [
        "-C",
        projectRoot,
        "log",
        "-n",
        "1",
        "--pretty=format:%H",
        "-G",
        `^[-+]?##[[:space:]]+${entryDate}$`,
        "--",
        changelogRelativePath,
      ],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    ).trim();
    return entryCommit.length > 0 ? entryCommit : null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const changelogRelativePath = "app/docs/changelog/content.mdx";
  const changelogPath = path.join(projectRoot, changelogRelativePath);
  const argv = process.argv.slice(2);
  const releaseDate = resolveReleaseDate(argv);
  const explicitFromRef = resolveArgValue(argv, "--from=");
  const requestedToRef = resolveArgValue(argv, "--to=") ?? "HEAD";
  const forceTagBaseline = argv.includes("--from-tag");
  const fromChangelog = !forceTagBaseline;

  ensureChangelogFileExists(changelogPath);

  const currentContent = fs.readFileSync(changelogPath, "utf8");
  const resolvedToCommitHash = resolveStableCommitHash(
    projectRoot,
    requestedToRef,
  );
  const markerFromRef = fromChangelog
    ? readLatestReleaseGeneratedToRef(currentContent)
    : null;
  const latestReleaseDate = fromChangelog
    ? readLatestReleaseDate(currentContent)
    : null;
  const latestEntryCommitRef =
    fromChangelog && latestReleaseDate
      ? resolveLatestEntryCommitRef(
          projectRoot,
          changelogRelativePath,
          latestReleaseDate,
        )
      : null;
  const fromRef =
    explicitFromRef ?? markerFromRef ?? latestEntryCommitRef ?? undefined;
  const fromDate =
    fromChangelog && !fromRef && latestReleaseDate
      ? latestReleaseDate
      : undefined;
  const fromChangelogPath =
    fromChangelog && !fromRef && !fromDate ? changelogRelativePath : undefined;
  const baselineSource = explicitFromRef
    ? "explicit --from"
    : markerFromRef
      ? "latest changelog marker"
      : latestEntryCommitRef
        ? "latest changelog entry commit"
        : fromDate
          ? "latest changelog release date"
          : fromChangelogPath
            ? "last changelog file commit"
            : "latest git tag";
  const gitContext = collectReleaseGitContext(projectRoot, {
    fromRef,
    fromDate,
    toRef: resolvedToCommitHash,
    fromChangelogPath,
  });
  const commitSummary = formatCommitSummary(gitContext);

  const notes = await inferReleaseNotes({
    releaseDate,
    commitSummary,
    changedFiles: gitContext.changedFiles,
    changelogTemplateContext: summarizeChangelogStyle(currentContent),
  });

  const section = renderReleaseSection({
    date: releaseDate,
    notes,
    generatedToRef: resolvedToCommitHash,
  });

  const nextContent = upsertReleaseSection({
    content: currentContent,
    date: releaseDate,
    section,
  });

  const validation = validateChangelogStructure(nextContent);
  if (!validation.ok) {
    throw new Error(
      [
        "Generated changelog failed structural validation:",
        ...validation.errors.map((error) => `- ${error}`),
      ].join("\n"),
    );
  }

  fs.writeFileSync(changelogPath, nextContent, "utf8");

  console.log("Generated changelog section.");
  console.log(`- date: ${releaseDate}`);
  console.log(`- baseline: ${baselineSource}`);
  console.log(`- range: ${gitContext.range}`);
  console.log(`- lastTag: ${gitContext.lastTag ?? "none"}`);
  console.log(`- changelog: ${path.relative(projectRoot, changelogPath)}`);
}

main().catch((error: unknown) => {
  console.error("Failed to generate changelog.");
  console.error(error);
  process.exitCode = 1;
});
