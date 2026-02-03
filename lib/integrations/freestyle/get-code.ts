"use server";

import { Freestyle } from "freestyle-sandboxes";

if (!process.env.FREESTYLE_API_KEY) {
  console.warn(
    "FREESTYLE_API_KEY is not set. Freestyle features will not work.",
  );
}

const freestyle = new Freestyle({
  apiKey: process.env.FREESTYLE_API_KEY!,
});

async function getFileFromRepo(
  repoId: string,
  filePath: string,
): Promise<string> {
  try {
    const repo = freestyle.git.repos.ref({ repoId });
    const response = await repo.contents.get({ path: filePath });

    if (response.type !== "file") {
      throw new Error(`Expected file at ${filePath}, got ${response.type}.`);
    }

    return Buffer.from(response.content, "base64").toString("utf-8");
  } catch (error) {
    console.error("Failed to get file from repo:", error);
    throw new Error(
      `Failed to read ${filePath} from repo: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getComponentCode(
  repoId: string,
  filePath: string = "app/page.tsx",
): Promise<string> {
  try {
    return await getFileFromRepo(repoId, filePath);
  } catch (error) {
    console.error("Failed to get component code:", error);
    throw error;
  }
}
