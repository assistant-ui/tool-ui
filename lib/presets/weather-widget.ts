import type {
  SerializableWeatherWidget,
  TimeOfDay,
} from "@/components/tool-ui/weather-widget";
import type { SerializableAction } from "@/components/tool-ui/shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeatherWidgetConfig {
  widget: SerializableWeatherWidget;
  footerActions?: SerializableAction[];
  overrideTimeOfDay?: TimeOfDay;
}

export type WeatherWidgetPresetName =
  | "sunny-day"
  | "rainy-afternoon"
  | "snowy-night"
  | "stormy-dusk"
  | "cloudy-dawn"
  | "with-actions";

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const sunnyDayPreset: WeatherWidgetConfig = {
  widget: {
    surfaceId: "weather-widget-sunny-day",
    location: {
      name: "San Francisco",
      region: "California",
      country: "US",
    },
    current: {
      temperature: 72,
      feelsLike: 74,
      condition: "clear",
      humidity: 55,
      windSpeed: 8,
      windDirection: "W",
      uvIndex: 6,
    },
    hourlyForecast: [
      { hour: 12, timestamp: "2025-12-01T12:00:00Z", temperature: 72, condition: "clear" },
      { hour: 13, timestamp: "2025-12-01T13:00:00Z", temperature: 74, condition: "clear" },
      { hour: 14, timestamp: "2025-12-01T14:00:00Z", temperature: 75, condition: "clear" },
      { hour: 15, timestamp: "2025-12-01T15:00:00Z", temperature: 74, condition: "partly_cloudy" },
      { hour: 16, timestamp: "2025-12-01T16:00:00Z", temperature: 72, condition: "partly_cloudy" },
      { hour: 17, timestamp: "2025-12-01T17:00:00Z", temperature: 69, condition: "clear" },
      { hour: 18, timestamp: "2025-12-01T18:00:00Z", temperature: 66, condition: "clear" },
      { hour: 19, timestamp: "2025-12-01T19:00:00Z", temperature: 63, condition: "clear" },
    ],
    dailyForecast: [
      { date: "2025-12-01", dayOfWeek: "Mon", high: 75, low: 58, condition: "clear" },
      { date: "2025-12-02", dayOfWeek: "Tue", high: 73, low: 57, condition: "partly_cloudy" },
      { date: "2025-12-03", dayOfWeek: "Wed", high: 70, low: 55, condition: "cloudy" },
      { date: "2025-12-04", dayOfWeek: "Thu", high: 68, low: 54, condition: "rain", precipChance: 60 },
      { date: "2025-12-05", dayOfWeek: "Fri", high: 71, low: 56, condition: "clear" },
    ],
    unit: "fahrenheit",
    lastUpdated: "2025-12-01T12:00:00Z",
  },
  overrideTimeOfDay: "day",
};

const rainyAfternoonPreset: WeatherWidgetConfig = {
  widget: {
    surfaceId: "weather-widget-rainy-afternoon",
    location: {
      name: "Seattle",
      region: "Washington",
      country: "US",
    },
    current: {
      temperature: 52,
      feelsLike: 48,
      condition: "rain",
      humidity: 85,
      windSpeed: 12,
      windDirection: "S",
      visibility: 5,
    },
    hourlyForecast: [
      { hour: 14, timestamp: "2025-12-01T14:00:00Z", temperature: 52, condition: "rain", precipChance: 80 },
      { hour: 15, timestamp: "2025-12-01T15:00:00Z", temperature: 51, condition: "heavy_rain", precipChance: 95 },
      { hour: 16, timestamp: "2025-12-01T16:00:00Z", temperature: 50, condition: "rain", precipChance: 70 },
      { hour: 17, timestamp: "2025-12-01T17:00:00Z", temperature: 49, condition: "drizzle", precipChance: 40 },
      { hour: 18, timestamp: "2025-12-01T18:00:00Z", temperature: 48, condition: "cloudy" },
      { hour: 19, timestamp: "2025-12-01T19:00:00Z", temperature: 47, condition: "cloudy" },
      { hour: 20, timestamp: "2025-12-01T20:00:00Z", temperature: 46, condition: "partly_cloudy" },
      { hour: 21, timestamp: "2025-12-01T21:00:00Z", temperature: 45, condition: "partly_cloudy" },
    ],
    dailyForecast: [
      { date: "2025-12-01", dayOfWeek: "Mon", high: 53, low: 45, condition: "rain", precipChance: 80 },
      { date: "2025-12-02", dayOfWeek: "Tue", high: 50, low: 43, condition: "heavy_rain", precipChance: 90 },
      { date: "2025-12-03", dayOfWeek: "Wed", high: 52, low: 44, condition: "drizzle", precipChance: 50 },
      { date: "2025-12-04", dayOfWeek: "Thu", high: 55, low: 46, condition: "cloudy" },
      { date: "2025-12-05", dayOfWeek: "Fri", high: 58, low: 48, condition: "partly_cloudy" },
    ],
    unit: "fahrenheit",
  },
  overrideTimeOfDay: "day",
};

const snowyNightPreset: WeatherWidgetConfig = {
  widget: {
    surfaceId: "weather-widget-snowy-night",
    location: {
      name: "Aspen",
      region: "Colorado",
      country: "US",
    },
    current: {
      temperature: 28,
      feelsLike: 18,
      condition: "snow",
      humidity: 90,
      windSpeed: 15,
      windDirection: "NW",
    },
    hourlyForecast: [
      { hour: 21, timestamp: "2025-12-01T21:00:00Z", temperature: 28, condition: "snow", precipChance: 85 },
      { hour: 22, timestamp: "2025-12-01T22:00:00Z", temperature: 27, condition: "heavy_snow", precipChance: 95 },
      { hour: 23, timestamp: "2025-12-01T23:00:00Z", temperature: 26, condition: "heavy_snow", precipChance: 95 },
      { hour: 0, timestamp: "2025-12-02T00:00:00Z", temperature: 25, condition: "snow", precipChance: 80 },
      { hour: 1, timestamp: "2025-12-02T01:00:00Z", temperature: 24, condition: "snow", precipChance: 60 },
      { hour: 2, timestamp: "2025-12-02T02:00:00Z", temperature: 23, condition: "cloudy" },
      { hour: 3, timestamp: "2025-12-02T03:00:00Z", temperature: 22, condition: "cloudy" },
      { hour: 4, timestamp: "2025-12-02T04:00:00Z", temperature: 21, condition: "partly_cloudy" },
    ],
    dailyForecast: [
      { date: "2025-12-01", dayOfWeek: "Mon", high: 32, low: 22, condition: "snow", precipChance: 90 },
      { date: "2025-12-02", dayOfWeek: "Tue", high: 30, low: 20, condition: "heavy_snow", precipChance: 95 },
      { date: "2025-12-03", dayOfWeek: "Wed", high: 28, low: 18, condition: "cloudy" },
      { date: "2025-12-04", dayOfWeek: "Thu", high: 35, low: 25, condition: "clear" },
      { date: "2025-12-05", dayOfWeek: "Fri", high: 38, low: 28, condition: "partly_cloudy" },
    ],
    unit: "fahrenheit",
  },
  overrideTimeOfDay: "night",
};

const stormyDuskPreset: WeatherWidgetConfig = {
  widget: {
    surfaceId: "weather-widget-stormy-dusk",
    location: {
      name: "Miami",
      region: "Florida",
      country: "US",
    },
    current: {
      temperature: 78,
      feelsLike: 85,
      condition: "thunderstorm",
      humidity: 88,
      windSpeed: 25,
      windDirection: "E",
      pressure: 1002,
    },
    hourlyForecast: [
      { hour: 18, timestamp: "2025-12-01T18:00:00Z", temperature: 78, condition: "thunderstorm", precipChance: 90 },
      { hour: 19, timestamp: "2025-12-01T19:00:00Z", temperature: 76, condition: "thunderstorm", precipChance: 85 },
      { hour: 20, timestamp: "2025-12-01T20:00:00Z", temperature: 75, condition: "heavy_rain", precipChance: 70 },
      { hour: 21, timestamp: "2025-12-01T21:00:00Z", temperature: 74, condition: "rain", precipChance: 50 },
      { hour: 22, timestamp: "2025-12-01T22:00:00Z", temperature: 73, condition: "cloudy" },
      { hour: 23, timestamp: "2025-12-01T23:00:00Z", temperature: 72, condition: "partly_cloudy" },
      { hour: 0, timestamp: "2025-12-02T00:00:00Z", temperature: 72, condition: "clear" },
      { hour: 1, timestamp: "2025-12-02T01:00:00Z", temperature: 71, condition: "clear" },
    ],
    dailyForecast: [
      { date: "2025-12-01", dayOfWeek: "Mon", high: 82, low: 72, condition: "thunderstorm", precipChance: 90 },
      { date: "2025-12-02", dayOfWeek: "Tue", high: 84, low: 74, condition: "partly_cloudy" },
      { date: "2025-12-03", dayOfWeek: "Wed", high: 86, low: 76, condition: "clear" },
      { date: "2025-12-04", dayOfWeek: "Thu", high: 85, low: 75, condition: "clear" },
      { date: "2025-12-05", dayOfWeek: "Fri", high: 83, low: 74, condition: "partly_cloudy" },
    ],
    unit: "fahrenheit",
  },
  overrideTimeOfDay: "dusk",
};

const cloudyDawnPreset: WeatherWidgetConfig = {
  widget: {
    surfaceId: "weather-widget-cloudy-dawn",
    location: {
      name: "London",
      region: "England",
      country: "UK",
    },
    current: {
      temperature: 8,
      feelsLike: 5,
      condition: "overcast",
      humidity: 78,
      windSpeed: 10,
      windDirection: "NE",
    },
    hourlyForecast: [
      { hour: 6, timestamp: "2025-12-01T06:00:00Z", temperature: 7, condition: "fog" },
      { hour: 7, timestamp: "2025-12-01T07:00:00Z", temperature: 8, condition: "overcast" },
      { hour: 8, timestamp: "2025-12-01T08:00:00Z", temperature: 9, condition: "cloudy" },
      { hour: 9, timestamp: "2025-12-01T09:00:00Z", temperature: 10, condition: "cloudy" },
      { hour: 10, timestamp: "2025-12-01T10:00:00Z", temperature: 11, condition: "partly_cloudy" },
      { hour: 11, timestamp: "2025-12-01T11:00:00Z", temperature: 12, condition: "partly_cloudy" },
      { hour: 12, timestamp: "2025-12-01T12:00:00Z", temperature: 12, condition: "cloudy" },
      { hour: 13, timestamp: "2025-12-01T13:00:00Z", temperature: 11, condition: "drizzle", precipChance: 30 },
    ],
    dailyForecast: [
      { date: "2025-12-01", dayOfWeek: "Mon", high: 12, low: 6, condition: "cloudy" },
      { date: "2025-12-02", dayOfWeek: "Tue", high: 11, low: 5, condition: "drizzle", precipChance: 40 },
      { date: "2025-12-03", dayOfWeek: "Wed", high: 10, low: 4, condition: "rain", precipChance: 60 },
      { date: "2025-12-04", dayOfWeek: "Thu", high: 9, low: 3, condition: "cloudy" },
      { date: "2025-12-05", dayOfWeek: "Fri", high: 11, low: 5, condition: "partly_cloudy" },
    ],
    unit: "celsius",
  },
  overrideTimeOfDay: "dawn",
};

const withActionsPreset: WeatherWidgetConfig = {
  widget: {
    ...sunnyDayPreset.widget,
    surfaceId: "weather-widget-with-actions",
  },
  footerActions: [
    { id: "refresh", label: "Refresh", variant: "secondary" },
    { id: "share", label: "Share", variant: "default" },
  ],
  overrideTimeOfDay: "day",
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const weatherWidgetPresets: Record<WeatherWidgetPresetName, WeatherWidgetConfig> = {
  "sunny-day": sunnyDayPreset,
  "rainy-afternoon": rainyAfternoonPreset,
  "snowy-night": snowyNightPreset,
  "stormy-dusk": stormyDuskPreset,
  "cloudy-dawn": cloudyDawnPreset,
  "with-actions": withActionsPreset,
};

export const weatherWidgetPresetDescriptions: Record<WeatherWidgetPresetName, string> = {
  "sunny-day": "Clear skies in San Francisco with animated sun rays",
  "rainy-afternoon": "Rainy Seattle afternoon with falling droplets",
  "snowy-night": "Snowy night in Aspen with drifting snowflakes",
  "stormy-dusk": "Miami thunderstorm at dusk with lightning flashes",
  "cloudy-dawn": "Overcast London morning with drifting clouds",
  "with-actions": "Sunny day preset with refresh and share actions",
};
