import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema, parseWithSchema } from "../shared";

export const WeatherConditionSchema = z.enum([
  "clear",
  "partly-cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "sleet",
  "hail",
  "windy",
]);

export type WeatherCondition = z.infer<typeof WeatherConditionSchema>;

export const CurrentWeatherSchema = z.object({
  temp: z.number(),
  tempMin: z.number(),
  tempMax: z.number(),
  condition: WeatherConditionSchema,
});

export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>;

export const ForecastDaySchema = z.object({
  day: z.string().min(1),
  tempMin: z.number(),
  tempMax: z.number(),
  condition: WeatherConditionSchema,
});

export type ForecastDay = z.infer<typeof ForecastDaySchema>;

export const TemperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);

export type TemperatureUnit = z.infer<typeof TemperatureUnitSchema>;

export const SerializableWeatherWidgetSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  location: z.string().min(1),
  current: CurrentWeatherSchema,
  forecast: z.array(ForecastDaySchema).min(1).max(7),
  unit: TemperatureUnitSchema.optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SerializableWeatherWidget = z.infer<
  typeof SerializableWeatherWidgetSchema
>;

export function parseSerializableWeatherWidget(
  input: unknown,
): SerializableWeatherWidget {
  return parseWithSchema(
    SerializableWeatherWidgetSchema,
    input,
    "WeatherWidget",
  );
}

export interface WeatherWidgetProps extends SerializableWeatherWidget {
  className?: string;
  isLoading?: boolean;
  locale?: string;
}
