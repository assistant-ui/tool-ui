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

export async function createChat() {
  const { repoId } = await freestyle.createGitRepository({
    name: `Tool UI Builder - ${new Date().toISOString()}`,
    public: true,
    source: {
      url: "https://github.com/freestyle-sh/freestyle-next",
    },
    devServers: {
      preset: "nextJs",
    },
  });

  const { ephemeralUrl, mcpEphemeralUrl } = await freestyle.requestDevServer({
    repoId,
  });

  return {
    repoId,
    ephemeralUrl,
    mcpEphemeralUrl,
  };
}

export async function requestDevServer({ repoId }: { repoId: string }) {
  return await freestyle.requestDevServer({ repoId });
}
