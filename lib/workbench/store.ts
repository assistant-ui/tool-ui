"use client";

import { create } from "zustand";
import type {
  DisplayMode,
  Theme,
  DeviceType,
  ConsoleEntry,
  ConsoleEntryType,
  OpenAIGlobals,
  SafeAreaInsets,
} from "./types";
import { DEVICE_PRESETS } from "./types";
import { workbenchComponents } from "./component-registry";

// Get defaults from the first component in registry
const defaultComponent = workbenchComponents[0];

// ─────────────────────────────────────────────────────────────────────────────
// Store Interface
// ─────────────────────────────────────────────────────────────────────────────

interface WorkbenchState {
  // Configuration
  selectedComponent: string;
  displayMode: DisplayMode;
  theme: Theme;
  locale: string;
  deviceType: DeviceType;
  toolInput: Record<string, unknown>;
  toolOutput: Record<string, unknown>;
  widgetState: Record<string, unknown>;
  maxHeight: number;
  toolResponseMetadata: Record<string, unknown> | null;
  safeAreaInsets: SafeAreaInsets;

  // Console logs
  consoleLogs: ConsoleEntry[];

  // Config panel collapsed sections
  collapsedSections: Record<string, boolean>;

  // Actions - Configuration
  setSelectedComponent: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: string) => void;
  setDeviceType: (type: DeviceType) => void;
  setToolInput: (input: Record<string, unknown>) => void;
  setToolOutput: (output: Record<string, unknown>) => void;
  setWidgetState: (state: Record<string, unknown>) => void;
  updateWidgetState: (state: Record<string, unknown>) => void;
  setMaxHeight: (height: number) => void;
  setToolResponseMetadata: (metadata: Record<string, unknown> | null) => void;
  setSafeAreaInsets: (insets: Partial<SafeAreaInsets>) => void;

  // Actions - Console
  addConsoleEntry: (entry: {
    type: ConsoleEntryType;
    method: string;
    args?: unknown;
    result?: unknown;
  }) => void;
  clearConsole: () => void;

  // Actions - UI
  toggleSection: (section: string) => void;

  // Computed
  getOpenAIGlobals: () => OpenAIGlobals;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  // Initial state - use defaults from first component in registry
  selectedComponent: defaultComponent?.id ?? "media-card",
  displayMode: "inline",
  theme: "light",
  locale: "en-US",
  deviceType: "desktop",
  toolInput: defaultComponent?.defaultProps ?? {},
  toolOutput: {},
  widgetState: {},
  maxHeight: 800,
  toolResponseMetadata: null,
  safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  consoleLogs: [],
  collapsedSections: {},

  // Configuration actions
  setSelectedComponent: (id) =>
    set(() => ({
      selectedComponent: id,
      // Reset widget state when switching components
      widgetState: {},
    })),

  setDisplayMode: (mode) => set(() => ({ displayMode: mode })),

  setTheme: (theme) => set(() => ({ theme })),

  setLocale: (locale) => set(() => ({ locale })),

  setDeviceType: (type) => {
    const preset = DEVICE_PRESETS[type];
    const maxHeight = typeof preset.height === "number" ? preset.height : 800;
    set(() => ({ deviceType: type, maxHeight }));
  },

  setToolInput: (input) => set(() => ({ toolInput: input })),

  setToolOutput: (output) => set(() => ({ toolOutput: output })),

  setWidgetState: (state) => set(() => ({ widgetState: state })),

  updateWidgetState: (state) =>
    set((prev) => ({
      widgetState: { ...prev.widgetState, ...state },
    })),

  setMaxHeight: (height) => set(() => ({ maxHeight: height })),

  setToolResponseMetadata: (metadata) => set(() => ({ toolResponseMetadata: metadata })),

  setSafeAreaInsets: (insets) =>
    set((prev) => ({
      safeAreaInsets: { ...prev.safeAreaInsets, ...insets },
    })),

  // Console actions
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

  // UI actions
  toggleSection: (section) =>
    set((state) => ({
      collapsedSections: {
        ...state.collapsedSections,
        [section]: !state.collapsedSections[section],
      },
    })),

  // Computed - builds the OpenAI globals object for the iframe
  getOpenAIGlobals: () => {
    const state = get();
    const preset = DEVICE_PRESETS[state.deviceType];

    return {
      theme: state.theme,
      locale: state.locale,
      displayMode: state.displayMode,
      maxHeight: state.maxHeight,
      toolInput: state.toolInput,
      toolOutput: Object.keys(state.toolOutput).length > 0 ? state.toolOutput : null,
      toolResponseMetadata: state.toolResponseMetadata,
      widgetState: Object.keys(state.widgetState).length > 0 ? state.widgetState : null,
      userAgent: preset.userAgent,
      safeArea: {
        insets: state.safeAreaInsets,
      },
    };
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Selector Hooks (for optimized re-renders)
// ─────────────────────────────────────────────────────────────────────────────

export const useSelectedComponent = () =>
  useWorkbenchStore((s) => s.selectedComponent);

export const useDisplayMode = () =>
  useWorkbenchStore((s) => s.displayMode);

export const useWorkbenchTheme = () =>
  useWorkbenchStore((s) => s.theme);

export const useDeviceType = () =>
  useWorkbenchStore((s) => s.deviceType);

export const useConsoleLogs = () =>
  useWorkbenchStore((s) => s.consoleLogs);

export const useToolInput = () =>
  useWorkbenchStore((s) => s.toolInput);

export const useToolOutput = () =>
  useWorkbenchStore((s) => s.toolOutput);
