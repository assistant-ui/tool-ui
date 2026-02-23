import { spawnSync } from "node:child_process";

const WATCHED_PREFIXES = ["components/tool-ui/", "lib/registry/"];
const WATCHED_FILES = new Set(["scripts/build-tool-ui-registry.ts"]);

function runCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
  return result.stdout.trim();
}

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function shouldSyncRegistry(stagedFiles: string[]): boolean {
  return stagedFiles.some(
    (file) =>
      WATCHED_FILES.has(file) ||
      WATCHED_PREFIXES.some((prefix) => file.startsWith(prefix)),
  );
}

function main(): void {
  const insideWorkTree = spawnSync("git", [
    "rev-parse",
    "--is-inside-work-tree",
  ]);
  if (insideWorkTree.status !== 0) {
    return;
  }

  const stagedOutput = runCapture("git", [
    "diff",
    "--cached",
    "--name-only",
    "--diff-filter=ACMR",
  ]);
  const stagedFiles = stagedOutput
    .split("\n")
    .map((file) => file.trim())
    .filter((file) => file.length > 0);

  if (!shouldSyncRegistry(stagedFiles)) {
    return;
  }

  console.log(
    "Detected Tool UI source changes; regenerating registry artifacts.",
  );
  run("pnpm", ["registry:build"]);
  run("git", ["add", "public/r"]);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
