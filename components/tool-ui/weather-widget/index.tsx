// Main component
export { WeatherWidget } from "./weather-widget";

// Types
export type {
  WeatherWidgetProps,
  WeatherWidgetUIState,
  WeatherWidgetClientProps,
  WeatherWidgetContextValue,
} from "./types";

// Schema & parsing
export {
  SerializableWeatherWidgetSchema,
  parseSerializableWeatherWidget,
  WeatherConditionSchema,
  TimeOfDaySchema,
  TemperatureUnitSchema,
  LocationSchema,
  CurrentConditionsSchema,
  HourlyForecastItemSchema,
  DailyForecastItemSchema,
  getEffectCategory,
} from "./schema";

export type {
  SerializableWeatherWidget,
  WeatherCondition,
  TimeOfDay,
  TemperatureUnit,
  Location,
  CurrentConditions as CurrentConditionsData,
  HourlyForecastItem,
  DailyForecastItem,
  EffectCategory,
} from "./schema";

// Context (for advanced usage)
export {
  WeatherWidgetProvider,
  useWeatherWidget,
  useWeatherWidgetState,
} from "./context";

// Sub-components (for composition)
export { SkyGradient, getSkyGradient, gradientToCSS } from "./background";
export { EffectsLayer, RainEffect, SnowEffect, SunEffect, CloudsEffect } from "./effects";
export { GlassPanel, EmbossedText, TemperatureText, TactileCard, StatBadge } from "./skeuomorphic";
export { CurrentConditions, HourlyForecast, DailyForecast } from "./display";
export { ConditionIcon, getConditionLabel } from "./icons";
