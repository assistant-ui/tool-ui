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
} from "./types";
import { DEVICE_PRESETS } from "./types";
import { workbenchComponents } from "./component-registry";
import { clearFiles } from "./file-store";

const defaultComponent = workbenchComponents[0];

export type ActiveJsonTab =
  | "toolInput"
  | "toolOutput"
  | "widgetState"
  | "toolResponseMetadata"
  | "window";

interface WorkbenchState {
  selectedComponent: string;
  displayMode: DisplayMode;
  theme: Theme;
  locale: string;
  deviceType: DeviceType;
  toolInput: Record<string, unknown>;
  toolOutput: Record<string, unknown> | null;
  widgetState: Record<string, unknown> | null;
  maxHeight: number;
  toolResponseMetadata: Record<string, unknown> | null;
  safeAreaInsets: SafeAreaInsets;
  consoleLogs: ConsoleEntry[];
  collapsedSections: Record<string, boolean>;
  activeJsonTab: ActiveJsonTab;
  isTransitioning: boolean;
  transitionFrom: DisplayMode | null;
  view: string | null;

  setSelectedComponent: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setTransitioning: (transitioning: boolean) => void;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: string) => void;
  setDeviceType: (type: DeviceType) => void;
  setToolInput: (input: Record<string, unknown>) => void;
  setToolOutput: (output: Record<string, unknown> | null) => void;
  setWidgetState: (state: Record<string, unknown> | null) => void;
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
  setActiveJsonTab: (tab: ActiveJsonTab) => void;
  setView: (view: string | null) => void;
  getOpenAIGlobals: () => OpenAIGlobals;
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
  activeJsonTab: "toolInput",
  isTransitioning: false,
  transitionFrom: null,
  view: null,
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
        activeJsonTab: "toolInput",
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
  setActiveJsonTab: (tab) => set(() => ({ activeJsonTab: tab })),
  setView: (view) => set(() => ({ view })),
  getOpenAIGlobals: () => {
    const state = get();
    return buildOpenAIGlobals(state);
  },
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
export const useActiveJsonTab = () => useWorkbenchStore((s) => s.activeJsonTab);

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
    ],
  );
};
