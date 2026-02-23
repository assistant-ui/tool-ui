import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateChangelogStructure } from "../lib/changelog/changelog";

function main(): void {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const changelogPath = path.join(
    projectRoot,
    "app/docs/changelog/content.mdx",
  );

  if (!fs.existsSync(changelogPath)) {
    throw new Error(
      'Missing changelog file at "app/docs/changelog/content.mdx". Run "pnpm changelog:generate" first.',
    );
  }

  const content = fs.readFileSync(changelogPath, "utf8");
  const validation = validateChangelogStructure(content);

  if (!validation.ok) {
    throw new Error(
      [
        "Changelog structure validation failed:",
        ...validation.errors.map((error) => `- ${error}`),
      ].join("\n"),
    );
  }

  console.log("Changelog structure check passed.");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
