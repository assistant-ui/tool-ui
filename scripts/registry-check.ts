import { spawnSync } from "node:child_process";

function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function runCapture(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
  return result.stdout.trim();
}

function main(): void {
  run("pnpm", ["registry:build"]);

  const diffCheck = spawnSync("git", ["diff", "--quiet", "--", "public/r"]);
  if (diffCheck.status === 0) {
    return;
  }

  const changedFiles = runCapture("git", [
    "diff",
    "--name-only",
    "--",
    "public/r",
  ]);

  console.error("\nRegistry artifacts are out of date.");
  if (changedFiles.length > 0) {
    console.error("Changed files:");
    for (const file of changedFiles.split("\n")) {
      console.error(`- ${file}`);
    }
  }
  console.error(
    '\nFix with: pnpm registry:build && git add public/r && git commit -m "chore: refresh registry artifacts"',
  );

  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
