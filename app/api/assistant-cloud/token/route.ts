import type { NextRequest } from "next/server";

import { getCloudServerEnv } from "@/lib/assistant/cloud-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenRequest = {
  deploymentId?: string;
  instanceSlug?: string;
  ttlSeconds?: number;
};

export async function POST(request: NextRequest) {
  const env = getCloudServerEnv();

  if (!env.ready) {
    return new Response(
      JSON.stringify({
        error: "Assistant Cloud environment is not configured.",
        missingEnv: env.missing,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const body = (await request.json()) as TokenRequest;
  const ttlSeconds = body.ttlSeconds ?? env.defaultTTL;

  try {
    const response = await fetch(env.tokenEndpoint!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: env.projectId,
        deploymentId: body.deploymentId,
        instanceSlug: body.instanceSlug,
        ttlSeconds,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: "Failed to mint Assistant Cloud token",
          status: response.status,
          details: errorText,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error minting Assistant Cloud token:", error);
    return new Response(
      JSON.stringify({
        error: "Unexpected error while contacting Assistant Cloud.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}


