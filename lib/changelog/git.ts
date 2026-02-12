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

export function collectReleaseGitContext(projectRoot: string): ReleaseGitContext {
  const lastTag = tryRunGit(projectRoot, ["describe", "--tags", "--abbrev=0"]);
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
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
      const files = collectCommitFiles(projectRoot, hash);
      return {
        hash,
        subject: subject?.trim() ?? "",
        body: body?.trim() ?? "",
        files,
      };
    });

  if (commits.length === 0) {
    throw new Error(
      `No commits found for release range "${range}". Cannot infer changelog.`,
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
        const extra = commit.files.length > 12 ? ` (+${commit.files.length - 12} more)` : "";
        lines.push(`  files: ${fileList}${extra}`);
      }

      return lines.join("\n");
    })
    .join("\n");
}
