import type { WeatherWidgetPayload } from "@/components/tool-ui/weather-widget/runtime";
import type { PresetWithCodeGen } from "./types";

export type WeatherWidgetPresetName =
  | "thunderstorm"
  | "cold-snap"
  | "rainy-week"
  | "cloudy-sunset"
  | "sunny-forecast";

function generateWeatherWidgetCode(data: WeatherWidgetPayload): string {
  const props: string[] = [];

  props.push('  version="3.1"');
  props.push(`  id="${data.id}"`);
  props.push(
    `  location={${JSON.stringify(data.location, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  units={${JSON.stringify(data.units, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  current={${JSON.stringify(data.current, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  forecast={${JSON.stringify(data.forecast, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(
    `  time={${JSON.stringify(data.time, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.updatedAt) {
    props.push(`  updatedAt="${data.updatedAt}"`);
  }

  return `<WeatherWidget\n${props.join("\n")}\n/>`;
}

export const weatherWidgetPresets: Record<
  WeatherWidgetPresetName,
  PresetWithCodeGen<WeatherWidgetPayload>
> = {
  thunderstorm: {
    description: "Kansas City having a night",
    data: {
      version: "3.1",
      id: "weather-widget-thunderstorm",
      location: { name: "Kansas City, MO" },
      units: { temperature: "fahrenheit" },
      current: {
        temperature: 72,
        tempMin: 65,
        tempMax: 78,
        conditionCode: "thunderstorm",
      },
      forecast: [
        { label: "Tue", tempMin: 62, tempMax: 75, conditionCode: "heavy-rain" },
        { label: "Wed", tempMin: 58, tempMax: 70, conditionCode: "rain" },
        { label: "Thu", tempMin: 55, tempMax: 68, conditionCode: "cloudy" },
        { label: "Fri", tempMin: 52, tempMax: 72, conditionCode: "partly-cloudy" },
        { label: "Sat", tempMin: 58, tempMax: 76, conditionCode: "clear" },
      ],
      time: { localTimeOfDay: 22.5 / 24 },
      updatedAt: "2026-01-28T22:30:00Z",
    },
    generateExampleCode: generateWeatherWidgetCode,
  },
  "cold-snap": {
    description: "Minneapolis doing Minneapolis things",
    data: {
      version: "3.1",
      id: "weather-widget-cold-snap",
      location: { name: "Minneapolis, MN" },
      units: { temperature: "fahrenheit" },
      current: {
        temperature: 18,
        tempMin: 8,
        tempMax: 22,
        conditionCode: "snow",
      },
      forecast: [
        { label: "Tue", tempMin: 5, tempMax: 19, conditionCode: "snow" },
        { label: "Wed", tempMin: -2, tempMax: 12, conditionCode: "snow" },
        { label: "Thu", tempMin: -8, tempMax: 6, conditionCode: "cloudy" },
        { label: "Fri", tempMin: -5, tempMax: 10, conditionCode: "partly-cloudy" },
        { label: "Sat", tempMin: 2, tempMax: 18, conditionCode: "clear" },
      ],
      time: { localTimeOfDay: 21 / 24 },
      updatedAt: "2026-01-28T21:00:00Z",
    },
    generateExampleCode: generateWeatherWidgetCode,
  },
  "rainy-week": {
    description: "Seattle, so... rain",
    data: {
      version: "3.1",
      id: "weather-widget-rainy-week",
      location: { name: "Seattle, WA" },
      units: { temperature: "fahrenheit" },
      current: {
        temperature: 52,
        tempMin: 48,
        tempMax: 55,
        conditionCode: "rain",
      },
      forecast: [
        { label: "Mon", tempMin: 46, tempMax: 54, conditionCode: "drizzle" },
        { label: "Tue", tempMin: 47, tempMax: 53, conditionCode: "rain" },
        { label: "Wed", tempMin: 45, tempMax: 52, conditionCode: "heavy-rain" },
        { label: "Thu", tempMin: 44, tempMax: 51, conditionCode: "rain" },
        { label: "Fri", tempMin: 46, tempMax: 55, conditionCode: "cloudy" },
      ],
      time: { localTimeOfDay: 16 / 24 },
      updatedAt: "2026-01-28T16:00:00Z",
    },
    generateExampleCode: generateWeatherWidgetCode,
  },
  "cloudy-sunset": {
    description: "That golden hour cloud thing",
    data: {
      version: "3.1",
      id: "weather-widget-cloudy-sunset",
      location: { name: "Santa Fe, NM" },
      units: { temperature: "fahrenheit" },
      current: {
        temperature: 48,
        tempMin: 32,
        tempMax: 52,
        conditionCode: "overcast",
      },
      forecast: [
        { label: "Tue", tempMin: 28, tempMax: 49, conditionCode: "cloudy" },
        { label: "Wed", tempMin: 30, tempMax: 54, conditionCode: "partly-cloudy" },
        { label: "Thu", tempMin: 33, tempMax: 58, conditionCode: "clear" },
        { label: "Fri", tempMin: 35, tempMax: 56, conditionCode: "partly-cloudy" },
        { label: "Sat", tempMin: 31, tempMax: 51, conditionCode: "cloudy" },
      ],
      time: { localTimeOfDay: 17.75 / 24 },
      updatedAt: "2026-01-28T17:45:00Z",
    },
    generateExampleCode: generateWeatherWidgetCode,
  },
  "sunny-forecast": {
    description: "San Diego being San Diego",
    data: {
      version: "3.1",
      id: "weather-widget-sunny-forecast",
      location: { name: "San Diego, CA" },
      units: { temperature: "fahrenheit" },
      current: {
        temperature: 76,
        tempMin: 68,
        tempMax: 79,
        conditionCode: "clear",
      },
      forecast: [
        { label: "Tue", tempMin: 65, tempMax: 78, conditionCode: "clear" },
        { label: "Wed", tempMin: 66, tempMax: 81, conditionCode: "clear" },
        { label: "Thu", tempMin: 67, tempMax: 82, conditionCode: "partly-cloudy" },
        { label: "Fri", tempMin: 68, tempMax: 80, conditionCode: "clear" },
        { label: "Sat", tempMin: 64, tempMax: 77, conditionCode: "partly-cloudy" },
      ],
      time: { localTimeOfDay: 14.5 / 24 },
      updatedAt: "2026-01-28T14:30:00Z",
    },
    generateExampleCode: generateWeatherWidgetCode,
  },
};
