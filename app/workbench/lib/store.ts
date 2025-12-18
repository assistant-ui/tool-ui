"use client";

import { create } from "zustand";
import { useMemo } from "react";
import type {
  DisplayMode,
  Theme,
  DeviceType,
  ConsoleEntry,
  ConsoleEntryType,
  OpenAIGlobals,
  SafeAreaInsets,
  View,
  WidgetState,
  UserLocation,
} from "./types";
import { DEVICE_PRESETS } from "./types";
import { workbenchComponents } from "./component-registry";
import { clearFiles } from "./file-store";
import type {
  MockConfigState,
  MockVariant,
  ToolAnnotations,
  ToolDescriptorMeta,
  ToolSchemas,
} from "./mock-config";
import { createToolMockConfig, createEmptyMockConfigState } from "./mock-config";

const defaultComponent = workbenchComponents[0];

interface WorkbenchState {
  selectedComponent: string;
  displayMode: DisplayMode;
  theme: Theme;
  locale: string;
  deviceType: DeviceType;
  toolInput: Record<string, unknown>;
  toolOutput: Record<string, unknown> | null;
  widgetState: WidgetState;
  maxHeight: number;
  toolResponseMetadata: Record<string, unknown> | null;
  safeAreaInsets: SafeAreaInsets;
  consoleLogs: ConsoleEntry[];
  collapsedSections: Record<string, boolean>;
  isTransitioning: boolean;
  transitionFrom: DisplayMode | null;
  view: View | null;
  mockConfig: MockConfigState;
  userLocation: UserLocation | null;
  isWidgetClosed: boolean;
  widgetSessionId: string;

  setSelectedComponent: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setTransitioning: (transitioning: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: string) => void;
  setDeviceType: (type: DeviceType) => void;
  setToolInput: (input: Record<string, unknown>) => void;
  setToolOutput: (output: Record<string, unknown> | null) => void;
  setWidgetState: (state: WidgetState) => void;
  updateWidgetState: (state: Record<string, unknown>) => void;
  setMaxHeight: (height: number) => void;
  setToolResponseMetadata: (metadata: Record<string, unknown> | null) => void;
  setSafeAreaInsets: (insets: Partial<SafeAreaInsets>) => void;
  addConsoleEntry: (entry: {
    type: ConsoleEntryType;
    method: string;
    args?: unknown;
    result?: unknown;
  }) => void;
  clearConsole: () => void;
  restoreConsoleLogs: (entries: ConsoleEntry[]) => void;
  toggleSection: (section: string) => void;
  setView: (view: View | null) => void;
  getOpenAIGlobals: () => OpenAIGlobals;
  setUserLocation: (location: UserLocation | null) => void;
  setWidgetClosed: (closed: boolean) => void;

  setMocksEnabled: (enabled: boolean) => void;
  registerTool: (toolName: string) => void;
  removeTool: (toolName: string) => void;
  setActiveVariant: (toolName: string, variantId: string | null) => void;
  setInterceptMode: (toolName: string, enabled: boolean) => void;
  addVariant: (toolName: string, variant: MockVariant) => void;
  updateVariant: (
    toolName: string,
    variantId: string,
    updates: Partial<MockVariant>,
  ) => void;
  removeVariant: (toolName: string, variantId: string) => void;
  setMockConfig: (config: MockConfigState) => void;
  setToolAnnotations: (toolName: string, annotations: ToolAnnotations) => void;
  setToolDescriptorMeta: (
    toolName: string,
    meta: ToolDescriptorMeta,
  ) => void;
  setToolSchemas: (toolName: string, schemas: ToolSchemas) => void;
}

function buildOpenAIGlobals(
  state: Pick<
    WorkbenchState,
    | "theme"
    | "locale"
    | "displayMode"
    | "maxHeight"
    | "toolInput"
    | "toolOutput"
    | "toolResponseMetadata"
    | "widgetState"
    | "deviceType"
    | "safeAreaInsets"
    | "view"
    | "userLocation"
  >,
): OpenAIGlobals {
  const preset = DEVICE_PRESETS[state.deviceType];

  return {
    theme: state.theme,
    locale: state.locale,
    displayMode: state.displayMode,
    maxHeight: state.maxHeight,
    toolInput: state.toolInput,
    toolOutput: state.toolOutput,
    toolResponseMetadata: state.toolResponseMetadata,
    widgetState: state.widgetState,
    userAgent: preset.userAgent,
    safeArea: {
      insets: state.safeAreaInsets,
    },
    view: state.view,
    userLocation: state.userLocation,
  };
}

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  selectedComponent: defaultComponent?.id ?? "chart",
  displayMode: "inline",
  theme: "light",
  locale: "en-US",
  deviceType: "desktop",
  toolInput: defaultComponent?.defaultProps ?? {},
  toolOutput: null,
  widgetState: null,
  maxHeight: 500,
  toolResponseMetadata: null,
  safeAreaInsets: { top: 10, bottom: 100, left: 10, right: 10 },
  consoleLogs: [],
  collapsedSections: {},
  isTransitioning: false,
  transitionFrom: null,
  view: null,
  mockConfig: createEmptyMockConfigState(),
  userLocation: null,
  isWidgetClosed: false,
  widgetSessionId: crypto.randomUUID(),
  setSelectedComponent: (id) => {
    clearFiles();
    set(() => {
      const entry = workbenchComponents.find((comp) => comp.id === id) ?? null;

      return {
        selectedComponent: id,
        toolInput: entry?.defaultProps ?? {},
        toolOutput: null,
        widgetState: null,
        toolResponseMetadata: null,
        isWidgetClosed: false,
        widgetSessionId: crypto.randomUUID(),
      };
    });
  },
  setDisplayMode: (mode) => set(() => ({ displayMode: mode })),
  setTransitioning: (transitioning) =>
    set((state) => ({
      isTransitioning: transitioning,
      transitionFrom: transitioning ? state.displayMode : null,
    })),
  setTheme: (theme) => set(() => ({ theme })),
  setLocale: (locale) => set(() => ({ locale })),
  setDeviceType: (type) => set(() => ({ deviceType: type })),
  setToolInput: (input) => set(() => ({ toolInput: input })),
  setToolOutput: (output) => set(() => ({ toolOutput: output })),
  setWidgetState: (state) => set(() => ({ widgetState: state })),
  updateWidgetState: (state) =>
    set((prev) => ({
      widgetState: { ...(prev.widgetState ?? {}), ...state },
    })),
  setMaxHeight: (height) => set(() => ({ maxHeight: height })),
  setToolResponseMetadata: (metadata) =>
    set(() => ({ toolResponseMetadata: metadata })),
  setSafeAreaInsets: (insets) =>
    set((prev) => ({
      safeAreaInsets: { ...prev.safeAreaInsets, ...insets },
    })),
  addConsoleEntry: (entry) =>
    set((state) => ({
      consoleLogs: [
        ...state.consoleLogs,
        {
          ...entry,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),
  clearConsole: () => set(() => ({ consoleLogs: [] })),
  restoreConsoleLogs: (entries) => set(() => ({ consoleLogs: entries })),
  toggleSection: (section) =>
    set((state) => ({
      collapsedSections: {
        ...state.collapsedSections,
        [section]: !state.collapsedSections[section],
      },
    })),
  setView: (view) => set(() => ({ view })),
  getOpenAIGlobals: () => {
    const state = get();
    return buildOpenAIGlobals(state);
  },
  setUserLocation: (location) => set(() => ({ userLocation: location })),
  setWidgetClosed: (closed) => set(() => ({ isWidgetClosed: closed })),

  setMocksEnabled: (enabled) =>
    set((state) => ({
      mockConfig: { ...state.mockConfig, globalEnabled: enabled },
    })),

  registerTool: (toolName) =>
    set((state) => {
      if (state.mockConfig.tools[toolName]) {
        return state;
      }
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: createToolMockConfig(toolName),
          },
        },
      };
    }),

  removeTool: (toolName) =>
    set((state) => {
      const { [toolName]: _, ...remainingTools } = state.mockConfig.tools;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: remainingTools,
        },
      };
    }),

  setActiveVariant: (toolName, variantId) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: { ...tool, activeVariantId: variantId },
          },
        },
      };
    }),

  setInterceptMode: (toolName, enabled) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: { ...tool, interceptMode: enabled },
          },
        },
      };
    }),

  addVariant: (toolName, variant) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: {
              ...tool,
              variants: [...tool.variants, variant],
            },
          },
        },
      };
    }),

  updateVariant: (toolName, variantId, updates) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: {
              ...tool,
              variants: tool.variants.map((v) =>
                v.id === variantId ? { ...v, ...updates } : v,
              ),
            },
          },
        },
      };
    }),

  removeVariant: (toolName, variantId) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      const newActiveId =
        tool.activeVariantId === variantId ? null : tool.activeVariantId;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: {
              ...tool,
              activeVariantId: newActiveId,
              variants: tool.variants.filter((v) => v.id !== variantId),
            },
          },
        },
      };
    }),

  setMockConfig: (config) => set(() => ({ mockConfig: config })),

  setToolAnnotations: (toolName, annotations) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: { ...tool, annotations },
          },
        },
      };
    }),

  setToolDescriptorMeta: (toolName, meta) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: { ...tool, descriptorMeta: meta },
          },
        },
      };
    }),

  setToolSchemas: (toolName, schemas) =>
    set((state) => {
      const tool = state.mockConfig.tools[toolName];
      if (!tool) return state;
      return {
        mockConfig: {
          ...state.mockConfig,
          tools: {
            ...state.mockConfig.tools,
            [toolName]: { ...tool, schemas },
          },
        },
      };
    }),
}));

export const useSelectedComponent = () =>
  useWorkbenchStore((s) => s.selectedComponent);
export const useDisplayMode = () => useWorkbenchStore((s) => s.displayMode);
export const useIsTransitioning = () =>
  useWorkbenchStore((s) => s.isTransitioning);
export const useTransitionFrom = () =>
  useWorkbenchStore((s) => s.transitionFrom);
export const useWorkbenchTheme = () => useWorkbenchStore((s) => s.theme);
export const useDeviceType = () => useWorkbenchStore((s) => s.deviceType);
export const useConsoleLogs = () => useWorkbenchStore((s) => s.consoleLogs);
export const useClearConsole = () => useWorkbenchStore((s) => s.clearConsole);
export const useToolInput = () => useWorkbenchStore((s) => s.toolInput);
export const useToolOutput = () => useWorkbenchStore((s) => s.toolOutput);
export const useMockConfig = () => useWorkbenchStore((s) => s.mockConfig);

export const useOpenAIGlobals = (): OpenAIGlobals => {
  const theme = useWorkbenchStore((s) => s.theme);
  const locale = useWorkbenchStore((s) => s.locale);
  const displayMode = useWorkbenchStore((s) => s.displayMode);
  const maxHeight = useWorkbenchStore((s) => s.maxHeight);
  const toolInput = useWorkbenchStore((s) => s.toolInput);
  const toolOutput = useWorkbenchStore((s) => s.toolOutput);
  const toolResponseMetadata = useWorkbenchStore((s) => s.toolResponseMetadata);
  const widgetState = useWorkbenchStore((s) => s.widgetState);
  const deviceType = useWorkbenchStore((s) => s.deviceType);
  const safeAreaInsets = useWorkbenchStore((s) => s.safeAreaInsets);
  const view = useWorkbenchStore((s) => s.view);
  const userLocation = useWorkbenchStore((s) => s.userLocation);

  return useMemo(
    () =>
      buildOpenAIGlobals({
        theme,
        locale,
        displayMode,
        maxHeight,
        toolInput,
        toolOutput,
        toolResponseMetadata,
        widgetState,
        deviceType,
        safeAreaInsets,
        view,
        userLocation,
      }),
    [
      theme,
      locale,
      displayMode,
      maxHeight,
      toolInput,
      toolOutput,
      toolResponseMetadata,
      widgetState,
      deviceType,
      safeAreaInsets,
      view,
      userLocation,
    ],
  );
};

export const useIsWidgetClosed = () =>
  useWorkbenchStore((s) => s.isWidgetClosed);
export const useWidgetSessionId = () =>
  useWorkbenchStore((s) => s.widgetSessionId);
