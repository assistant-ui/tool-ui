export type MockVariantType = "success" | "empty" | "error" | "slow" | "custom";

export interface MockResponse {
  structuredContent?: Record<string, unknown>;
  content?: string;
  isError?: boolean;
  _meta?: Record<string, unknown>;
}

export interface MockVariant {
  id: string;
  name: string;
  type: MockVariantType;
  response: MockResponse;
  delay: number;
}

export interface ToolMockConfig {
  toolName: string;
  activeVariantId: string | null;
  variants: MockVariant[];
  interceptMode: boolean;
}

export interface MockConfigState {
  tools: Record<string, ToolMockConfig>;
  globalEnabled: boolean;
}
