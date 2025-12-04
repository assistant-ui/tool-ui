import type { CallToolResponse } from "./types";

type MockHandler = (args: Record<string, unknown>) => Promise<CallToolResponse>;

const mockHandlers: Record<string, MockHandler> = {
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

  delete_item: async (args) => {
    await simulateDelay(200);
    return {
      structuredContent: {
        success: true,
        deleted_id: args.id,
      },
    };
  },

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

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function handleMockToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<CallToolResponse> {
  const handler = mockHandlers[toolName] || defaultHandler;
  return handler(args);
}

export function registerMockHandler(
  toolName: string,
  handler: MockHandler
): void {
  mockHandlers[toolName] = handler;
}

export function getAvailableMockTools(): string[] {
  return Object.keys(mockHandlers);
}
