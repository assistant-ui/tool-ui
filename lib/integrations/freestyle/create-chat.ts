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
    name: `Tool UI Builder`,
    public: true,
    source: {
      url: "https://github.com/assistant-ui/tool-ui-sandbox-template",
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
  const devServer = await freestyle.requestDevServer({ repoId });

  // Only return serializable data needed by the client
  return {
    ephemeralUrl: devServer.ephemeralUrl,
    mcpEphemeralUrl: devServer.mcpEphemeralUrl,
    codeServerUrl: devServer.codeServerUrl,
    devCommandRunning: devServer.devCommandRunning,
    installCommandRunning: devServer.installCommandRunning,
  };
}
