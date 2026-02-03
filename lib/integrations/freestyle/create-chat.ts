"use server";

import { Freestyle, type Responses } from "freestyle-sandboxes";

if (!process.env.FREESTYLE_API_KEY) {
  console.warn(
    "FREESTYLE_API_KEY is not set. Freestyle features will not work.",
  );
}

const freestyle = new Freestyle({
  apiKey: process.env.FREESTYLE_API_KEY!,
});

async function requestDevServerInternal(
  repoId: string,
): Promise<Responses.ResponsePostEphemeralV1DevServers200> {
  const response = await freestyle.fetch("/ephemeral/v1/dev-servers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      devServer: { repoId },
      preset: "nextJs",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to request dev server (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as Responses.ResponsePostEphemeralV1DevServers200;
}

export async function createChat() {
  const { repoId } = await freestyle.git.repos.create({
    name: `Tool UI Builder`,
    public: true,
    source: {
      url: "https://github.com/assistant-ui/tool-ui-sandbox-template",
    },
    devServers: {
      preset: "nextJs",
    },
  });

  const { ephemeralUrl, mcpEphemeralUrl } =
    await requestDevServerInternal(repoId);

  return {
    repoId,
    ephemeralUrl,
    mcpEphemeralUrl,
  };
}

export async function requestDevServer({ repoId }: { repoId: string }) {
  const devServer = await requestDevServerInternal(repoId);

  // Only return serializable data needed by the client
  return {
    ephemeralUrl: devServer.ephemeralUrl ?? devServer.url,
    mcpEphemeralUrl: devServer.mcpEphemeralUrl ?? null,
    devCommandRunning: devServer.devCommandRunning,
    installCommandRunning: devServer.installCommandRunning,
  };
}
