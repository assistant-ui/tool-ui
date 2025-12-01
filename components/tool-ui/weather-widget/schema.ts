import { z } from "zod";
import {
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  SurfaceIdSchema,
} from "../shared";

// ---------------------------------------------------------------------------
// Weather Condition
// ---------------------------------------------------------------------------

export const WeatherConditionSchema = z.enum([
  "clear",
  "partly_cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy_rain",
  "thunderstorm",
  "snow",
  "heavy_snow",
  "sleet",
  "hail",
]);

export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;

// ---------------------------------------------------------------------------
// Time of Day
// ---------------------------------------------------------------------------

export const TimeOfDaySchema = z.enum(["dawn", "day", "dusk", "night"]);

export type TimeOfDay = z.infer<typeof TimeOfDaySchema>;

// ---------------------------------------------------------------------------
// Temperature Unit
// ---------------------------------------------------------------------------

export const TemperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);

export type TemperatureUnit = z.infer<typeof TemperatureUnitSchema>;

// ---------------------------------------------------------------------------
// Location
// ---------------------------------------------------------------------------

export const LocationSchema = z.object({
  name: z.string().min(1),
  region: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// ---------------------------------------------------------------------------
// Current Conditions
// ---------------------------------------------------------------------------

export const CurrentConditionsSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  condition: WeatherConditionSchema,
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  windDirection: z.string().optional(),
  uvIndex: z.number().min(0).max(11).optional(),
  visibility: z.number().optional(),
  pressure: z.number().optional(),
});

export type CurrentConditions = z.infer<typeof CurrentConditionsSchema>;

// ---------------------------------------------------------------------------
// Hourly Forecast
// ---------------------------------------------------------------------------

export const HourlyForecastItemSchema = z.object({
  hour: z.number().min(0).max(23),
  timestamp: z.string().datetime(),
  temperature: z.number(),
  condition: WeatherConditionSchema,
  precipChance: z.number().min(0).max(100).optional(),
});

export type HourlyForecastItem = z.infer<typeof HourlyForecastItemSchema>;

// ---------------------------------------------------------------------------
// Daily Forecast
// ---------------------------------------------------------------------------

export const DailyForecastItemSchema = z.object({
  date: z.string(),
  dayOfWeek: z.string(),
  high: z.number(),
  low: z.number(),
  condition: WeatherConditionSchema,
  precipChance: z.number().min(0).max(100).optional(),
});

export type DailyForecastItem = z.infer<typeof DailyForecastItemSchema>;

// ---------------------------------------------------------------------------
// Main Serializable Schema
// ---------------------------------------------------------------------------

export const SerializableWeatherWidgetSchema = z.object({
  /**
   * Unique identifier for this surface instance in the conversation.
   *
   * Used for:
   * - Assistant referencing ("the weather above")
   * - Narration context
   *
   * Should be stable across re-renders, meaningful, and unique within the conversation.
   *
   * @example "weather-widget-current-location", "weather-widget-destination"
   */
  surfaceId: SurfaceIdSchema,
  location: LocationSchema,
  current: CurrentConditionsSchema,
  hourlyForecast: z.array(HourlyForecastItemSchema).max(12).optional(),
  dailyForecast: z.array(DailyForecastItemSchema).max(7).optional(),
  unit: TemperatureUnitSchema.default("fahrenheit"),
  timeOfDay: TimeOfDaySchema.optional(),
  lastUpdated: z.string().datetime().optional(),
  footerActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type SerializableWeatherWidget = z.infer<
  typeof SerializableWeatherWidgetSchema
>;

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

export function parseSerializableWeatherWidget(
  input: unknown,
): SerializableWeatherWidget {
  const result = SerializableWeatherWidgetSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid WeatherWidget payload: ${result.error.message}`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Effect Category Helper
// ---------------------------------------------------------------------------

/**
 * Maps a weather condition to an effect category for rendering.
 * This simplifies the 13 conditions down to 4 primary effects.
 */
export type EffectCategory = "sun" | "clouds" | "rain" | "snow" | "none";

export function getEffectCategory(condition: WeatherCondition): EffectCategory {
  switch (condition) {
    case "clear":
      return "sun";
    case "partly_cloudy":
    case "cloudy":
    case "overcast":
    case "fog":
      return "clouds";
    case "drizzle":
    case "rain":
    case "heavy_rain":
    case "thunderstorm":
      return "rain";
    case "snow":
    case "heavy_snow":
    case "sleet":
    case "hail":
      return "snow";
    default:
      return "none";
  }
}
