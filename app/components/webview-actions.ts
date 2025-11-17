"use server";

import { requestDevServer as requestDevServerInner } from "@/lib/integrations/freestyle/create-chat";

export async function requestDevServer({ repoId }: { repoId: string }) {
  return await requestDevServerInner({ repoId });
}
