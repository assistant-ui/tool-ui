import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";

export const runtime = "edge";

interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export async function POST(req: Request) {
  try {
    const { serverUrl, transportType = "http" } = await req.json();

    if (!serverUrl || typeof serverUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: serverUrl is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate URL format
    try {
      new URL(serverUrl);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid URL format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use Vercel AI SDK's MCP client
    console.log(`[MCP] Creating MCP client for ${serverUrl} with transport: ${transportType}`);

    try {
      const mcpClient = await createMCPClient({
        transport: {
          type: transportType as "http" | "sse",
          url: serverUrl,
        },
      });

      console.log(`[MCP] Client created, fetching tools...`);
      const tools = await mcpClient.tools();
      console.log(`[MCP] Received ${Object.keys(tools).length} tools`);

      // Convert AI SDK tool format to our format
      const mcpTools: MCPTool[] = Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema as unknown as {
          type: string;
          properties?: Record<string, unknown>;
          required?: string[];
        },
      }));

      // Close the client
      await mcpClient.close();

      return new Response(
        JSON.stringify({
          tools: mcpTools,
          serverUrl,
          count: mcpTools.length,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error(`[MCP] Error with AI SDK client:`, error);

      return new Response(
        JSON.stringify({
          error: `Could not connect to MCP server: ${error instanceof Error ? error.message : "Unknown error"}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error fetching MCP tools:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while fetching MCP tools",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
