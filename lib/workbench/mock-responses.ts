/**
 * Mock Tool Responses
 *
 * Provides simulated responses for callTool requests in the Workbench.
 * These allow testing component behavior without a real MCP server.
 */

import type { CallToolResponse } from "./types";

type MockHandler = (args: Record<string, unknown>) => Promise<CallToolResponse>;

/**
 * Registry of mock tool handlers.
 * Add handlers here to simulate specific tool behaviors.
 */
const mockHandlers: Record<string, MockHandler> = {
  // Example: Search handler
  search: async (args) => {
    await simulateDelay(500);
    return {
      structuredContent: {
        results: [
          { id: "1", title: `Result for "${args.query || "search"}"`, score: 0.95 },
          { id: "2", title: "Another result", score: 0.87 },
          { id: "3", title: "Third result", score: 0.72 },
        ],
        total: 3,
      },
    };
  },

  // Example: Weather handler
  get_weather: async (args) => {
    await simulateDelay(300);
    const location = (args.location as string) || "San Francisco";
    return {
      structuredContent: {
        location,
        temperature: 72,
        condition: "sunny",
        humidity: 45,
        forecast: [
          { day: "Today", high: 75, low: 58 },
          { day: "Tomorrow", high: 73, low: 56 },
        ],
      },
    };
  },

  // Example: Create/update handler
  create_item: async (args) => {
    await simulateDelay(400);
    return {
      structuredContent: {
        success: true,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...args,
      },
    };
  },

  // Example: Delete handler
  delete_item: async (args) => {
    await simulateDelay(200);
    return {
      structuredContent: {
        success: true,
        deleted_id: args.id,
      },
    };
  },

  // Example: List handler
  list_items: async () => {
    await simulateDelay(350);
    return {
      structuredContent: {
        items: [
          { id: "1", name: "Item 1", status: "active" },
          { id: "2", name: "Item 2", status: "pending" },
          { id: "3", name: "Item 3", status: "completed" },
        ],
        total: 3,
        page: 1,
      },
    };
  },

  // Example: Refresh/sync handler
  refresh: async () => {
    await simulateDelay(600);
    return {
      structuredContent: {
        refreshed: true,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * Default handler for unknown tools.
 * Returns a generic success response with the provided args echoed back.
 */
const defaultHandler: MockHandler = async (args) => {
  await simulateDelay(300);
  return {
    structuredContent: {
      success: true,
      message: "Mock response from Workbench",
      receivedArgs: args,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Simulate network delay for realism.
 */
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle a mock tool call.
 *
 * @param toolName - The name of the tool being called
 * @param args - The arguments passed to the tool
 * @returns A promise resolving to the mock response
 */
export async function handleMockToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResponse> {
  const handler = mockHandlers[toolName] || defaultHandler;
  return handler(args);
}

/**
 * Register a custom mock handler.
 * Useful for testing specific tool behaviors.
 */
export function registerMockHandler(
  toolName: string,
  handler: MockHandler
): void {
  mockHandlers[toolName] = handler;
}

/**
 * Get list of available mock tool names.
 */
export function getAvailableMockTools(): string[] {
  return Object.keys(mockHandlers);
}
