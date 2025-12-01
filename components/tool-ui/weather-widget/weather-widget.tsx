"use client";

import * as React from "react";
import { cn } from "./_cn";
import {
  WeatherWidgetProvider,
  useWeatherWidgetState,
} from "./context";
import type {
  WeatherWidgetProps,
  WeatherWidgetContextValue,
  WeatherWidgetUIState,
} from "./types";
import { getTimeOfDayFromHour } from "./types";
import { getEffectCategory } from "./schema";
import { SkyGradient } from "./background";
import { EffectsLayer } from "./effects";
import { GlassPanel } from "./skeuomorphic";
import { CurrentConditions, HourlyForecast, DailyForecast } from "./display";
import { ActionButtons, normalizeActionsConfig } from "../shared";
import type { ActionsConfig } from "../shared";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WeatherWidget({
  // Data props
  surfaceId,
  location,
  current,
  hourlyForecast,
  dailyForecast,
  unit = "fahrenheit",
  timeOfDay: timeOfDayProp,
  lastUpdated,
  footerActions: footerActionsProp,

  // Client props
  className,
  maxWidth = "480px",
  isLoading = false,
  state: controlledState,
  defaultState,
  onStateChange,
  onRefresh,
  onLocationChange,
  onFooterAction,
  onBeforeFooterAction,
  locale = "en-US",
  effectIntensity = "normal",
  overrideTimeOfDay,
}: WeatherWidgetProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [state, setState] = useWeatherWidgetState(
    controlledState,
    defaultState,
    onStateChange,
  );

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  // Determine time of day
  const timeOfDay = React.useMemo(() => {
    if (overrideTimeOfDay) return overrideTimeOfDay;
    if (timeOfDayProp) return timeOfDayProp;
    return getTimeOfDayFromHour(new Date().getHours());
  }, [overrideTimeOfDay, timeOfDayProp]);

  // Effect category based on current condition
  const effectCategory = getEffectCategory(current.condition);

  // Normalize footer actions
  const normalizedFooterActions = React.useMemo<ActionsConfig | null>(() => {
    if (!footerActionsProp) return null;
    return normalizeActionsConfig(footerActionsProp);
  }, [footerActionsProp]);

  // Build context value
  const contextValue: WeatherWidgetContextValue = React.useMemo(
    () => ({
      widget: {
        surfaceId,
        location,
        current,
        hourlyForecast,
        dailyForecast,
        unit,
        timeOfDay,
        lastUpdated,
      },
      locale,
      unit,
      timeOfDay,
      effectCategory,
      state,
      setState,
      effectIntensity,
      handlers: {
        onRefresh,
        onLocationChange,
      },
    }),
    [
      surfaceId,
      location,
      current,
      hourlyForecast,
      dailyForecast,
      unit,
      timeOfDay,
      lastUpdated,
      locale,
      effectCategory,
      state,
      setState,
      effectIntensity,
      onRefresh,
      onLocationChange,
    ],
  );

  // ---------------------------------------------------------------------------
  // Footer Action Handler
  // ---------------------------------------------------------------------------

  const handleFooterAction = React.useCallback(
    async (actionId: string) => {
      if (onBeforeFooterAction) {
        const shouldContinue = await onBeforeFooterAction(actionId);
        if (!shouldContinue) return;
      }
      await onFooterAction?.(actionId);
    },
    [onFooterAction, onBeforeFooterAction],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex w-full flex-col",
          className,
        )}
        style={{ maxWidth }}
        data-surface-id={surfaceId}
      >
        <div className="animate-pulse rounded-2xl bg-slate-700/50 p-5">
          <div className="mb-4 h-6 w-32 rounded bg-slate-600/50" />
          <div className="mb-6 flex items-center justify-between">
            <div className="h-16 w-24 rounded bg-slate-600/50" />
            <div className="h-16 w-16 rounded-full bg-slate-600/50" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-slate-600/50" />
            <div className="h-6 w-20 rounded-full bg-slate-600/50" />
            <div className="h-6 w-20 rounded-full bg-slate-600/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <WeatherWidgetProvider value={contextValue}>
      <div
        className={cn(
          "flex w-full flex-col gap-3",
          className,
        )}
        style={{ maxWidth }}
        data-surface-id={surfaceId}
      >
        {/* Main widget */}
        <SkyGradient>
          <EffectsLayer>
            <GlassPanel blur="xl" opacity="medium" rounded="2xl">
              <CurrentConditions />
              <HourlyForecast />
              <DailyForecast />
            </GlassPanel>
          </EffectsLayer>
        </SkyGradient>

        {/* Footer actions (if any) */}
        {normalizedFooterActions && (
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={handleFooterAction}
          />
        )}
      </div>
    </WeatherWidgetProvider>
  );
}
