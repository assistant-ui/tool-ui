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

interface MCPListToolsResponse {
  tools: MCPTool[];
}

export async function POST(req: Request) {
  try {
    const { serverUrl } = await req.json();

    if (!serverUrl || typeof serverUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid request: serverUrl is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(serverUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Make request to MCP server to list tools
    // MCP servers typically expose a tools/list endpoint
    const mcpResponse = await fetch(`${url.origin}${url.pathname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      }),
    });

    if (!mcpResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `MCP server returned error: ${mcpResponse.status} ${mcpResponse.statusText}`,
        }),
        {
          status: mcpResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const mcpData = await mcpResponse.json();

    // Handle JSON-RPC error response
    if (mcpData.error) {
      return new Response(
        JSON.stringify({
          error: `MCP server error: ${mcpData.error.message || "Unknown error"}`,
          code: mcpData.error.code,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract tools from JSON-RPC response
    const result: MCPListToolsResponse = mcpData.result || { tools: [] };

    return new Response(
      JSON.stringify({
        tools: result.tools,
        serverUrl,
        count: result.tools.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
      }
    );
  }
}
