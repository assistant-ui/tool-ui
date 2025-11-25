import { readFileSync } from "fs";
import { join } from "path";

/**
 * Reads an MDX file and returns it with minimal cleanup.
 * Removes the DocsHeader component and its import since that's just UI chrome.
 */
export function getMdxAsMarkdown(mdxPath: string): string {
  const fullPath = join(process.cwd(), mdxPath);
  const rawContent = readFileSync(fullPath, "utf-8");

  let result = rawContent;

  // Remove DocsHeader import
  result = result.replace(/^import\s*\{\s*DocsHeader\s*\}\s*from\s*["'][^"']+["'];?\n?/gm, "");

  // Remove DocsHeader component usage
  result = result.replace(/<DocsHeader[^>]*\/>\n?/g, "");

  // Trim leading/trailing whitespace
  result = result.trim();

  return result;
}
