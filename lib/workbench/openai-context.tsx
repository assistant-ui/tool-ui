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
import { MORPH_TIMING } from "./transition-config";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type {
  OpenAIGlobals,
  OpenAIAPI,
  DisplayMode,
  CallToolResponse,
  ModalOptions,
} from "./types";

interface OpenAIContextValue extends OpenAIGlobals, OpenAIAPI {}

const OpenAIContext = createContext<OpenAIContextValue | null>(null);

interface OpenAIProviderProps {
  children: ReactNode;
}

export function OpenAIProvider({ children }: OpenAIProviderProps) {
  const store = useWorkbenchStore();
  const globals = store.getOpenAIGlobals();
  const reducedMotion = useReducedMotion();

  const callTool = useCallback(
    async (
      name: string,
      args: Record<string, unknown>,
    ): Promise<CallToolResponse> => {
      store.addConsoleEntry({
        type: "callTool",
        method: `callTool("${name}")`,
        args,
      });

      // User should get a prompt to provide the tool result for testing
      // We don't want to hardcode the results
      const result = await handleMockToolCall(name, args);

      store.addConsoleEntry({
        type: "callTool",
        method: `callTool("${name}") → response`,
        result,
      });

      if (result.structuredContent) {
        store.setToolOutput(result.structuredContent);
      }
      if (result._meta) {
        store.setToolResponseMetadata(result._meta);
      }

      return result;
    },
    [store],
  );

  const setWidgetState = useCallback(
    async (state: Record<string, unknown>): Promise<void> => {
      store.addConsoleEntry({
        type: "setWidgetState",
        method: "setWidgetState",
        args: state,
      });
      store.updateWidgetState(state);
    },
    [store],
  );

  const requestDisplayMode = useCallback(
    async (args: { mode: DisplayMode }): Promise<{ mode: DisplayMode }> => {
      const currentMode = store.displayMode;

      store.addConsoleEntry({
        type: "requestDisplayMode",
        method: `requestDisplayMode("${args.mode}")`,
        args,
      });

      if (currentMode === args.mode) {
        return { mode: args.mode };
      }

      if (store.isTransitioning) {
        return { mode: args.mode };
      }

      if (
        reducedMotion ||
        typeof document === "undefined" ||
        !("startViewTransition" in document)
      ) {
        store.setDisplayMode(args.mode);
        return { mode: args.mode };
      }

      store.setTransitioning(true);

      const toFullscreen = args.mode === "fullscreen";
      const root = document.documentElement;
      root.style.setProperty(
        "--morph-radius-from",
        toFullscreen ? "0.75rem" : "0",
      );
      root.style.setProperty(
        "--morph-radius-to",
        toFullscreen ? "0" : "0.75rem",
      );

      (
        document as Document & {
          startViewTransition: (callback: () => void) => void;
        }
      ).startViewTransition(() => {
        store.setDisplayMode(args.mode);
      });

      setTimeout(() => {
        store.setTransitioning(false);
        root.style.removeProperty("--morph-radius-from");
        root.style.removeProperty("--morph-radius-to");
      }, MORPH_TIMING.viewTransitionDuration);

      return { mode: args.mode };
    },
    [store, reducedMotion],
  );

  const sendFollowUpMessage = useCallback(
    async (args: { prompt: string }): Promise<void> => {
      store.addConsoleEntry({
        type: "sendFollowUpMessage",
        method: "sendFollowUpMessage",
        args,
      });
    },
    [store],
  );

  const requestClose = useCallback(() => {
    store.addConsoleEntry({
      type: "requestClose",
      method: "requestClose",
    });
  }, [store]);

  const openExternal = useCallback(
    (payload: { href: string }) => {
      store.addConsoleEntry({
        type: "openExternal",
        method: `openExternal("${payload.href}")`,
        args: payload,
      });
    },
    [store],
  );

  const notifyIntrinsicHeight = useCallback(
    (height: number) => {
      store.addConsoleEntry({
        type: "notifyIntrinsicHeight",
        method: `notifyIntrinsicHeight(${height})`,
        args: { height },
      });
    },
    [store],
  );

  const requestModal = useCallback(
    async (options: ModalOptions): Promise<void> => {
      store.addConsoleEntry({
        type: "requestModal",
        method: "requestModal",
        args: options,
      });
    },
    [store],
  );

  const value = useMemo<OpenAIContextValue>(
    () => ({
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
      callTool,
      setWidgetState,
      requestDisplayMode,
      sendFollowUpMessage,
      requestClose,
      openExternal,
      notifyIntrinsicHeight,
      requestModal,
    }),
    [
      globals,
      callTool,
      setWidgetState,
      requestDisplayMode,
      sendFollowUpMessage,
      requestClose,
      openExternal,
      notifyIntrinsicHeight,
      requestModal,
    ],
  );

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
}

export function useOpenAI(): OpenAIContextValue {
  const context = useContext(OpenAIContext);
  if (!context) {
    throw new Error("useOpenAI must be used within an OpenAIProvider");
  }
  return context;
}

export function useOpenAiGlobal<K extends keyof OpenAIGlobals>(
  key: K,
): OpenAIGlobals[K] {
  const context = useOpenAI();
  return context[key];
}

export function useToolInput<T = Record<string, unknown>>(): T {
  return useOpenAiGlobal("toolInput") as T;
}

export function useToolOutput<T = Record<string, unknown>>(): T | null {
  return useOpenAiGlobal("toolOutput") as T | null;
}

export function useTheme(): "light" | "dark" {
  return useOpenAiGlobal("theme");
}

export function useDisplayMode(): DisplayMode {
  return useOpenAiGlobal("displayMode");
}

export function useLocale(): string {
  return useOpenAiGlobal("locale");
}

export function useWidgetState<T extends Record<string, unknown>>(
  defaultState?: T,
): readonly [T | null, (state: T | ((prev: T | null) => T)) => void] {
  const context = useOpenAI();
  const currentState =
    (context.widgetState as T | null) ?? defaultState ?? null;

  const setState = useCallback(
    (stateOrUpdater: T | ((prev: T | null) => T)) => {
      const newState =
        typeof stateOrUpdater === "function"
          ? stateOrUpdater(currentState)
          : stateOrUpdater;
      context.setWidgetState(newState);
    },
    [context, currentState],
  );

  return [currentState, setState] as const;
}

export function useCallTool() {
  const context = useOpenAI();
  return context.callTool;
}

export function useRequestDisplayMode() {
  const context = useOpenAI();
  return context.requestDisplayMode;
}

export function useSendFollowUpMessage() {
  const context = useOpenAI();
  return context.sendFollowUpMessage;
}
