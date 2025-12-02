"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useWorkbenchStore } from "./store";
import { handleMockToolCall } from "./mock-responses";
import type {
  OpenAIGlobals,
  OpenAIAPI,
  DisplayMode,
  CallToolResponse,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────────────────────

interface OpenAIContextValue extends OpenAIGlobals, OpenAIAPI {}

const OpenAIContext = createContext<OpenAIContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider Component
// ─────────────────────────────────────────────────────────────────────────────

interface OpenAIProviderProps {
  children: ReactNode;
}

export function OpenAIProvider({ children }: OpenAIProviderProps) {
  const store = useWorkbenchStore();

  // Get current globals from store
  const globals = store.getOpenAIGlobals();

  // API Methods
  const callTool = useCallback(
    async (name: string, args: Record<string, unknown>): Promise<CallToolResponse> => {
      store.addConsoleEntry({
        type: "callTool",
        method: `callTool("${name}")`,
        args,
      });

      const result = await handleMockToolCall(name, args);

      store.addConsoleEntry({
        type: "callTool",
        method: `callTool("${name}") → response`,
        result,
      });

      return result;
    },
    [store]
  );

  const setWidgetState = useCallback(
    (state: Record<string, unknown>) => {
      store.addConsoleEntry({
        type: "setWidgetState",
        method: "setWidgetState",
        args: state,
      });
      store.updateWidgetState(state);
    },
    [store]
  );

  const requestDisplayMode = useCallback(
    async (args: { mode: DisplayMode }): Promise<{ mode: DisplayMode }> => {
      store.addConsoleEntry({
        type: "requestDisplayMode",
        method: `requestDisplayMode("${args.mode}")`,
        args,
      });
      store.setDisplayMode(args.mode);
      return { mode: args.mode };
    },
    [store]
  );

  const sendFollowUpMessage = useCallback(
    async (args: { prompt: string }): Promise<void> => {
      store.addConsoleEntry({
        type: "sendFollowUpMessage",
        method: "sendFollowUpMessage",
        args,
      });
      // In workbench, we just log this
    },
    [store]
  );

  const requestClose = useCallback(() => {
    store.addConsoleEntry({
      type: "requestClose",
      method: "requestClose",
    });
    // In workbench, we just log this
  }, [store]);

  const openExternal = useCallback(
    (payload: { href: string }) => {
      store.addConsoleEntry({
        type: "openExternal",
        method: `openExternal("${payload.href}")`,
        args: payload,
      });
      // In workbench, we just log this
    },
    [store]
  );

  // Combine globals and API methods
  const value = useMemo<OpenAIContextValue>(
    () => ({
      // Globals
      theme: globals.theme,
      locale: globals.locale,
      displayMode: globals.displayMode,
      maxHeight: globals.maxHeight,
      toolInput: globals.toolInput,
      toolOutput: globals.toolOutput,
      toolResponseMetadata: globals.toolResponseMetadata,
      widgetState: globals.widgetState,
      userAgent: globals.userAgent,
      safeArea: globals.safeArea,

      // API Methods
      callTool,
      setWidgetState,
      requestDisplayMode,
      sendFollowUpMessage,
      requestClose,
      openExternal,
    }),
    [
      globals,
      callTool,
      setWidgetState,
      requestDisplayMode,
      sendFollowUpMessage,
      requestClose,
      openExternal,
    ]
  );

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hooks (matching OpenAI Apps SDK patterns)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Access the full OpenAI context (globals + API).
 * Throws if used outside of OpenAIProvider.
 */
export function useOpenAI(): OpenAIContextValue {
  const context = useContext(OpenAIContext);
  if (!context) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
}

/**
 * Access a specific global value.
 * Matches the useOpenAiGlobal pattern from OpenAI Apps SDK.
 */
export function useOpenAiGlobal<K extends keyof OpenAIGlobals>(
  key: K
): OpenAIGlobals[K] {
  const context = useOpenAI();
  return context[key];
}

/**
 * Get the tool input passed to the component.
 */
export function useToolInput<T = Record<string, unknown>>(): T {
  return useOpenAiGlobal("toolInput") as T;
}

/**
 * Get the tool output/result.
 */
export function useToolOutput<T = Record<string, unknown>>(): T | null {
  return useOpenAiGlobal("toolOutput") as T | null;
}

/**
 * Get the current theme.
 */
export function useTheme(): "light" | "dark" {
  return useOpenAiGlobal("theme");
}

/**
 * Get the current display mode.
 */
export function useDisplayMode(): DisplayMode {
  return useOpenAiGlobal("displayMode");
}

/**
 * Get the current locale.
 */
export function useLocale(): string {
  return useOpenAiGlobal("locale");
}

/**
 * Access and update widget state.
 * Returns [state, setState] tuple similar to useState.
 */
export function useWidgetState<T extends Record<string, unknown>>(
  defaultState?: T
): readonly [T | null, (state: T | ((prev: T | null) => T)) => void] {
  const context = useOpenAI();
  const currentState = (context.widgetState as T | null) ?? defaultState ?? null;

  const setState = useCallback(
    (stateOrUpdater: T | ((prev: T | null) => T)) => {
      const newState =
        typeof stateOrUpdater === "function"
          ? stateOrUpdater(currentState)
          : stateOrUpdater;
      context.setWidgetState(newState);
    },
    [context, currentState]
  );

  return [currentState, setState] as const;
}

/**
 * Get the callTool function.
 */
export function useCallTool() {
  const context = useOpenAI();
  return context.callTool;
}

/**
 * Get the requestDisplayMode function.
 */
export function useRequestDisplayMode() {
  const context = useOpenAI();
  return context.requestDisplayMode;
}

/**
 * Get the sendFollowUpMessage function.
 */
export function useSendFollowUpMessage() {
  const context = useOpenAI();
  return context.sendFollowUpMessage;
}
