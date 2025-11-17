import { createChat } from "@/lib/integrations/freestyle/create-chat";

export async function POST() {
  try {
    if (!process.env.FREESTYLE_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "Freestyle API key is not configured. Please set FREESTYLE_API_KEY in your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { repoId, ephemeralUrl, mcpEphemeralUrl } = await createChat();

    return new Response(
      JSON.stringify({
        repoId,
        ephemeralUrl,
        mcpEphemeralUrl,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating Freestyle project:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to create Freestyle project.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
