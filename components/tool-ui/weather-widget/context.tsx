"use client";

import * as React from "react";
import type { WeatherWidgetContextValue, WeatherWidgetUIState } from "./types";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WeatherWidgetContext =
  React.createContext<WeatherWidgetContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWeatherWidget() {
  const ctx = React.useContext(WeatherWidgetContext);
  if (!ctx) {
    throw new Error(
      "useWeatherWidget must be used within a <WeatherWidgetProvider />",
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface WeatherWidgetProviderProps {
  value: WeatherWidgetContextValue;
  children: React.ReactNode;
}

export function WeatherWidgetProvider({
  value,
  children,
}: WeatherWidgetProviderProps) {
  return (
    <WeatherWidgetContext.Provider value={value}>
      {children}
    </WeatherWidgetContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// State Hook (for controlled/uncontrolled pattern)
// ---------------------------------------------------------------------------

export function useWeatherWidgetState(
  controlledState?: WeatherWidgetUIState,
  defaultState?: WeatherWidgetUIState,
  onStateChange?: (state: WeatherWidgetUIState) => void,
): [WeatherWidgetUIState, (patch: Partial<WeatherWidgetUIState>) => void] {
  const [uncontrolledState, setUncontrolledState] =
    React.useState<WeatherWidgetUIState>(() => defaultState ?? {});

  const isControlled = controlledState !== undefined;
  const state = isControlled ? controlledState : uncontrolledState;

  const setState = React.useCallback(
    (patch: Partial<WeatherWidgetUIState>) => {
      const nextState = { ...state, ...patch };

      if (!isControlled) {
        setUncontrolledState(nextState);
      }

      onStateChange?.(nextState);
    },
    [state, isControlled, onStateChange],
  );

  return [state, setState];
}
