export * from "./types";

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

export { generateBridgeScript, generateComponentBundle } from "./openai-bridge";

export {
  workbenchComponents,
  getComponent,
  getComponentIds,
  type WorkbenchComponentEntry,
  type ComponentCategory,
} from "./component-registry";

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

export {
  handleMockToolCall,
  registerMockHandler,
  getAvailableMockTools,
} from "./mock-responses";

export { OptionListSDK } from "./wrappers";
