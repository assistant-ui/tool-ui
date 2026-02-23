import { execFileSync } from "node:child_process";

export type ReleaseGitContext = {
  lastTag: string | null;
  range: string;
  commits: Array<{
    hash: string;
    subject: string;
    body: string;
    files: string[];
  }>;
  changedFiles: string[];
};

export type ReleaseGitContextOptions = {
  fromRef?: string;
  fromDate?: string;
  toRef?: string;
  fromChangelogPath?: string;
};

function isToolUiComponentPath(filePath: string): boolean {
  return filePath.startsWith("components/tool-ui/");
}

function filterToolUiComponentFiles(files: string[]): string[] {
  return files.filter((filePath) => isToolUiComponentPath(filePath));
}

function runGit(projectRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", projectRoot, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function tryRunGit(projectRoot: string, args: string[]): string | null {
  try {
    return runGit(projectRoot, args);
  } catch {
    return null;
  }
}

function collectCommitFiles(projectRoot: string, hash: string): string[] {
  const output = runGit(projectRoot, [
    "show",
    "--name-only",
    "--pretty=format:",
    hash,
  ]);

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function resolveReleaseRange(
  projectRoot: string,
  options: ReleaseGitContextOptions,
): { lastTag: string | null; range: string } {
  const normalizedFromRef = options.fromRef?.trim();
  const normalizedFromDate = options.fromDate?.trim();
  const normalizedToRef = options.toRef?.trim() || "HEAD";
  const normalizedFromChangelogPath = options.fromChangelogPath?.trim();

  const baselineOptionsCount = [
    normalizedFromRef,
    normalizedFromDate,
    normalizedFromChangelogPath,
  ].filter(Boolean).length;

  if (baselineOptionsCount > 1) {
    throw new Error(
      "Invalid changelog range options. Provide only one baseline selector: fromRef, fromDate, or fromChangelogPath.",
    );
  }

  if (normalizedFromRef) {
    return {
      lastTag: null,
      range: `${normalizedFromRef}..${normalizedToRef}`,
    };
  }

  if (normalizedFromDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedFromDate)) {
      throw new Error(
        `Invalid fromDate "${normalizedFromDate}". Use YYYY-MM-DD.`,
      );
    }

    const baselineCommit = tryRunGit(projectRoot, [
      "rev-list",
      "-n",
      "1",
      `--before=${normalizedFromDate}T23:59:59`,
      normalizedToRef,
    ]);

    if (!baselineCommit) {
      return {
        lastTag: null,
        range: normalizedToRef,
      };
    }

    return {
      lastTag: null,
      range: `${baselineCommit}..${normalizedToRef}`,
    };
  }

  if (normalizedFromChangelogPath) {
    const changelogBaselineCommit = tryRunGit(projectRoot, [
      "log",
      "-n",
      "1",
      "--pretty=format:%H",
      "--",
      normalizedFromChangelogPath,
    ]);

    if (!changelogBaselineCommit) {
      throw new Error(
        [
          `No git history found for changelog path "${normalizedFromChangelogPath}".`,
          "Ensure the changelog file exists and has been committed at least once.",
        ].join(" "),
      );
    }

    return {
      lastTag: null,
      range: `${changelogBaselineCommit}..${normalizedToRef}`,
    };
  }

  const lastTag = tryRunGit(projectRoot, ["describe", "--tags", "--abbrev=0"]);
  if (!lastTag) {
    throw new Error(
      [
        "No git release tag found. Changelog generation requires a tagged baseline.",
        'Create and push an annotated tag first (example: git tag -a v2026.2.13 -m "Release v2026.2.13" && git push origin v2026.2.13).',
      ].join("\n"),
    );
  }

  return {
    lastTag,
    range: `${lastTag}..HEAD`,
  };
}

export function collectReleaseGitContext(
  projectRoot: string,
  options: ReleaseGitContextOptions = {},
): ReleaseGitContext {
  const { lastTag, range } = resolveReleaseRange(projectRoot, options);
  const rawCommits = runGit(projectRoot, [
    "log",
    "--no-merges",
    "--pretty=format:%H%x1f%s%x1f%b%x1e",
    range,
  ]);

  const commits = rawCommits
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, subject, body] = entry.split("\x1f");
      const files = filterToolUiComponentFiles(
        collectCommitFiles(projectRoot, hash),
      );
      return {
        hash,
        subject: subject?.trim() ?? "",
        body: body?.trim() ?? "",
        files,
      };
    })
    .filter((commit) => commit.files.length > 0);

  if (commits.length === 0) {
    throw new Error(
      [
        `No tool-ui component commits found for release range "${range}".`,
        "Changelog inference only includes component source changes under components/tool-ui/.",
      ].join(" "),
    );
  }

  const changedFiles = Array.from(
    new Set(commits.flatMap((commit) => commit.files)),
  ).sort((a, b) => a.localeCompare(b));

  return {
    lastTag,
    range,
    commits,
    changedFiles,
  };
}

export function formatCommitSummary(
  context: ReleaseGitContext,
  maxCommits = 120,
): string {
  const commits = context.commits.slice(0, maxCommits);
  return commits
    .map((commit) => {
      const lines = [`- ${commit.hash.slice(0, 7)} ${commit.subject}`];
      if (commit.body) {
        lines.push(`  body: ${commit.body.replace(/\s+/g, " ").trim()}`);
      }

      if (commit.files.length > 0) {
        const fileList = commit.files.slice(0, 12).join(", ");
        const extra =
          commit.files.length > 12
            ? ` (+${commit.files.length - 12} more)`
            : "";
        lines.push(`  files: ${fileList}${extra}`);
      }

      return lines.join("\n");
    })
    .join("\n");
}
