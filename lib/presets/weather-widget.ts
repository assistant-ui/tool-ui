import type { SerializableWeatherWidget } from "@/components/tool-ui/weather-widget";
import type { PresetWithCodeGen } from "./types";

export type WeatherWidgetPresetName =
  | "thunderstorm"
  | "night-cloudy"
  | "cold-snap"
  | "rainy-week"
  | "sunny-forecast";

function generateWeatherWidgetCode(data: SerializableWeatherWidget): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  location="${data.location}"`);
  props.push(
    `  current={${JSON.stringify(data.current, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  forecast={${JSON.stringify(data.forecast, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.unit && data.unit !== "celsius") {
    props.push(`  unit="${data.unit}"`);
  }

  if (data.updatedAt) {
    props.push(`  updatedAt="${data.updatedAt}"`);
  }

  return `<WeatherWidget\n${props.join("\n")}\n/>`;
}

export const weatherWidgetPresets: Record<
  WeatherWidgetPresetName,
  PresetWithCodeGen<SerializableWeatherWidget>
> = {
  thunderstorm: {
    description: "Dramatic thunderstorm with lightning",
    data: {
      id: "weather-widget-thunderstorm",
      location: "Kansas City, MO",
      current: {
        temp: 72,
        tempMin: 65,
        tempMax: 78,
        condition: "thunderstorm",
      },
      forecast: [
        { day: "Tue", tempMin: 62, tempMax: 75, condition: "heavy-rain" },
        { day: "Wed", tempMin: 58, tempMax: 70, condition: "rain" },
        { day: "Thu", tempMin: 55, tempMax: 68, condition: "cloudy" },
        { day: "Fri", tempMin: 52, tempMax: 72, condition: "partly-cloudy" },
        { day: "Sat", tempMin: 58, tempMax: 76, condition: "clear" },
      ],
      unit: "fahrenheit",
      updatedAt: "2026-01-28T17:30:00Z",
    } satisfies SerializableWeatherWidget,
    generateExampleCode: generateWeatherWidgetCode,
  },
  "night-cloudy": {
    description: "Cloudy night with moon peeking through",
    data: {
      id: "weather-widget-night-cloudy",
      location: "Sedona, AZ",
      current: {
        temp: 45,
        tempMin: 38,
        tempMax: 62,
        condition: "cloudy",
      },
      forecast: [
        { day: "Tue", tempMin: 36, tempMax: 64, condition: "partly-cloudy" },
        { day: "Wed", tempMin: 38, tempMax: 66, condition: "cloudy" },
        { day: "Thu", tempMin: 40, tempMax: 68, condition: "rain" },
        { day: "Fri", tempMin: 42, tempMax: 70, condition: "partly-cloudy" },
        { day: "Sat", tempMin: 39, tempMax: 65, condition: "clear" },
      ],
      unit: "fahrenheit",
      updatedAt: "2026-01-28T23:00:00Z",
    } satisfies SerializableWeatherWidget,
    generateExampleCode: generateWeatherWidgetCode,
  },
  "cold-snap": {
    description: "Winter weather with snow at night",
    data: {
      id: "weather-widget-cold-snap",
      location: "Minneapolis, MN",
      current: {
        temp: 18,
        tempMin: 8,
        tempMax: 22,
        condition: "snow",
      },
      forecast: [
        { day: "Tue", tempMin: 5, tempMax: 19, condition: "snow" },
        { day: "Wed", tempMin: -2, tempMax: 12, condition: "snow" },
        { day: "Thu", tempMin: -8, tempMax: 6, condition: "cloudy" },
        { day: "Fri", tempMin: -5, tempMax: 10, condition: "partly-cloudy" },
        { day: "Sat", tempMin: 2, tempMax: 18, condition: "clear" },
      ],
      unit: "fahrenheit",
      updatedAt: "2026-01-28T21:00:00Z",
    } satisfies SerializableWeatherWidget,
    generateExampleCode: generateWeatherWidgetCode,
  },
  "rainy-week": {
    description: "Persistent rain throughout the week",
    data: {
      id: "weather-widget-rainy-week",
      location: "Seattle, WA",
      current: {
        temp: 52,
        tempMin: 48,
        tempMax: 55,
        condition: "rain",
      },
      forecast: [
        { day: "Mon", tempMin: 46, tempMax: 54, condition: "drizzle" },
        { day: "Tue", tempMin: 47, tempMax: 53, condition: "rain" },
        { day: "Wed", tempMin: 45, tempMax: 52, condition: "heavy-rain" },
        { day: "Thu", tempMin: 44, tempMax: 51, condition: "rain" },
        { day: "Fri", tempMin: 46, tempMax: 55, condition: "cloudy" },
      ],
      unit: "fahrenheit",
    } satisfies SerializableWeatherWidget,
    generateExampleCode: generateWeatherWidgetCode,
  },
  "sunny-forecast": {
    description: "Clear skies and warm temperatures",
    data: {
      id: "weather-widget-sunny-forecast",
      location: "San Diego, CA",
      current: {
        temp: 76,
        tempMin: 68,
        tempMax: 79,
        condition: "clear",
      },
      forecast: [
        { day: "Tue", tempMin: 65, tempMax: 78, condition: "clear" },
        { day: "Wed", tempMin: 66, tempMax: 81, condition: "clear" },
        { day: "Thu", tempMin: 67, tempMax: 82, condition: "partly-cloudy" },
        { day: "Fri", tempMin: 68, tempMax: 80, condition: "clear" },
        { day: "Sat", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
      ],
      unit: "fahrenheit",
      updatedAt: "2026-01-28T14:30:00Z",
    } satisfies SerializableWeatherWidget,
    generateExampleCode: generateWeatherWidgetCode,
  },
};
