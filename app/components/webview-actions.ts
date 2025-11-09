"use server";

import { requestDevServer as requestDevServerInner } from "@/lib/freestyle";

export async function requestDevServer({ repoId }: { repoId: string }) {
  return await requestDevServerInner({ repoId });
}
