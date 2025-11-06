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

async function tryMCPEndpoint(
  url: string,
  isSSE = false,
): Promise<MCPListToolsResponse | null> {
  try {
    if (isSSE) {
      console.log(`[MCP] Trying SSE endpoint: ${url}`);

      // For SSE endpoints, we need to send the request and read the response stream
      const mcpResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
          params: {},
        }),
      });

      console.log(`[MCP] SSE Response status: ${mcpResponse.status}`);
      console.log(
        `[MCP] SSE Response headers:`,
        Object.fromEntries(mcpResponse.headers.entries()),
      );

      if (!mcpResponse.ok) {
        console.log(
          `[MCP] SSE request failed with status ${mcpResponse.status}`,
        );
        return null;
      }

      // Read the SSE stream
      const reader = mcpResponse.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: MCPListToolsResponse | null = null;

      if (reader) {
        // Read chunks with timeout
        const timeout = setTimeout(() => {
          console.log(`[MCP] SSE timeout reached`);
          reader.cancel();
        }, 10000); // Increased to 10 seconds

        try {
          let chunkCount = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log(`[MCP] SSE stream ended after ${chunkCount} chunks`);
              break;
            }

            chunkCount++;
            buffer += decoder.decode(value, { stream: true });
            console.log(
              `[MCP] Chunk ${chunkCount} received, buffer size: ${buffer.length}`,
            );
            console.log(`[MCP] Buffer content:`, buffer.slice(-200)); // Last 200 chars

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              console.log(`[MCP] Processing line:`, line.slice(0, 100));

              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  console.log(`[MCP] Received [DONE] marker`);
                  break;
                }

                try {
                  const mcpData = JSON.parse(data);
                  console.log(
                    `[MCP] Parsed data:`,
                    JSON.stringify(mcpData).slice(0, 200),
                  );

                  if (mcpData.result && !mcpData.error) {
                    result = mcpData.result;
                    console.log(
                      `[MCP] Found result with ${result?.tools?.length || 0} tools`,
                    );
                    clearTimeout(timeout);
                    reader.cancel();
                    return result;
                  }
                } catch (e) {
                  console.log(`[MCP] Failed to parse JSON:`, e);
                }
              }
            }
          }
        } finally {
          clearTimeout(timeout);
        }
      }

      console.log(`[MCP] SSE processing complete, result:`, result);
      return result;
    } else {
      // Regular HTTP POST request
      const mcpResponse = await fetch(url, {
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
        return null;
      }

      const mcpData = await mcpResponse.json();

      if (mcpData.error) {
        return null;
      }

      return mcpData.result || { tools: [] };
    }
  } catch {
    return null;
  }
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
        },
      );
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(serverUrl);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid URL format. Use 'demo' to try mock tools.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Detect if URL is likely an SSE endpoint
    const isSSE =
      url.pathname.includes("/sse") || url.pathname.includes("/stream");

    // Try different common MCP endpoint patterns
    const endpointsToTry: Array<{ url: string; isSSE: boolean }> = [
      { url: `${url.origin}${url.pathname}`, isSSE }, // User-provided exact URL
      { url: `${url.origin}${url.pathname}/mcp`, isSSE: false }, // Common pattern: /mcp
      { url: `${url.origin}${url.pathname}/api/mcp`, isSSE: false }, // Common pattern: /api/mcp
      { url: `${url.origin}/mcp`, isSSE: false }, // Root /mcp
      { url: `${url.origin}/sse`, isSSE: true }, // SSE endpoint
      { url: `${url.origin}/message`, isSSE: false }, // Message endpoint
    ];

    let result: MCPListToolsResponse | null = null;
    const lastError: string | null = null;

    for (const endpoint of endpointsToTry) {
      result = await tryMCPEndpoint(endpoint.url, endpoint.isSSE);
      if (result) {
        break;
      }
    }

    if (!result) {
      return new Response(
        JSON.stringify({
          error: `Could not connect to MCP server. Tried multiple endpoint patterns. Please ensure the URL is correct and the server supports the MCP protocol.`,
          details: lastError,
          triedEndpoints: endpointsToTry,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        tools: result.tools,
        serverUrl,
        count: result.tools.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
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
      },
    );
  }
}
