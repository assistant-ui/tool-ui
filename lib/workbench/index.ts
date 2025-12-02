/**
 * Workbench Library
 *
 * Exports all workbench-related utilities for testing Tool UIs
 * with the OpenAI Apps SDK interface.
 */

// Types
export * from "./types";

// Store
export { useWorkbenchStore } from "./store";
export {
  useSelectedComponent,
  useDisplayMode as useWorkbenchDisplayMode,
  useWorkbenchTheme,
  useDeviceType,
  useConsoleLogs,
  useToolInput as useWorkbenchToolInput,
  useToolOutput as useWorkbenchToolOutput,
} from "./store";

// Bridge
export { generateBridgeScript, generateComponentBundle } from "./openai-bridge";

// Component Registry
export {
  workbenchComponents,
  getComponent,
  getComponentIds,
  type WorkbenchComponentEntry,
  type ComponentCategory,
} from "./component-registry";

// OpenAI Context
export {
  OpenAIProvider,
  useOpenAI,
  useOpenAiGlobal,
  useToolInput,
  useToolOutput,
  useTheme,
  useDisplayMode,
  useLocale,
  useWidgetState,
  useCallTool,
  useRequestDisplayMode,
  useSendFollowUpMessage,
} from "./openai-context";

// Mock Responses
export {
  handleMockToolCall,
  registerMockHandler,
  getAvailableMockTools,
} from "./mock-responses";
