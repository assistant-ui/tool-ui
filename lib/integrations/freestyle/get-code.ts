"use server";

import { FreestyleSandboxes } from "freestyle-sandboxes";

if (!process.env.FREESTYLE_API_KEY) {
  console.warn(
    "FREESTYLE_API_KEY is not set. Freestyle features will not work.",
  );
}

const freestyle = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!,
});

async function getFileFromDevServer(
  repoId: string,
  filePath: string,
): Promise<string> {
  try {
    // Request dev server to get filesystem access
    const { fs } = await freestyle.requestDevServer({
      repoId: repoId,
    });

    // Read the file directly from the dev server filesystem
    const result: unknown = await fs.readFile(filePath);

    // Handle different return types - might be string or object with content property
    if (typeof result === "string") {
      return result;
    } else if (result && typeof result === "object") {
      // Check for common properties
      const obj = result as Record<string, unknown>;
      if ("content" in obj && typeof obj.content === "string") {
        return obj.content;
      } else if ("data" in obj && typeof obj.data === "string") {
        return obj.data;
      } else if ("text" in obj && typeof obj.text === "string") {
        return obj.text;
      } else if (Array.isArray(result)) {
        // If it's a buffer-like array, convert to string
        return Buffer.from(result).toString("utf-8");
      } else {
        // Try to extract string from object
        const stringValue = Object.values(obj).find(
          (v) => typeof v === "string",
        ) as string | undefined;
        if (stringValue) {
          return stringValue;
        }
        throw new Error(
          `Unexpected readFile return type: ${typeof result}. Expected string or object with content/data/text property.`,
        );
      }
    } else {
      throw new Error(
        `Unexpected readFile return type: ${typeof result}. Expected string or object.`,
      );
    }
  } catch (error) {
    console.error("Failed to get file from dev server:", error);
    throw new Error(
      `Failed to read ${filePath} from dev server: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getComponentCode(
  repoId: string,
  filePath: string = "app/page.tsx",
): Promise<string> {
  try {
    return await getFileFromDevServer(repoId, filePath);
  } catch (error) {
    console.error("Failed to get component code:", error);
    throw error;
  }
}
