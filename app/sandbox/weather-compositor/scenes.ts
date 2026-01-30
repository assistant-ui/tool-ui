import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";

export interface WeatherScene {
  id: string;
  name: string;
  location: string;
  condition: WeatherCondition;
  timeOfDay: number;
  temp: number;
  tempMin: number;
  tempMax: number;
  unit: "celsius" | "fahrenheit";
  description: string;
  forecast: Array<{
    day: string;
    tempMin: number;
    tempMax: number;
    condition: WeatherCondition;
  }>;
}

export const WEATHER_SCENES: WeatherScene[] = [
  {
    id: "san-diego-noon",
    name: "San Diego Noon",
    location: "San Diego, CA",
    condition: "clear",
    timeOfDay: 0.5,
    temp: 76,
    tempMin: 68,
    tempMax: 79,
    unit: "fahrenheit",
    description: "Perfect beach weather",
    forecast: [
      { day: "Tue", tempMin: 65, tempMax: 78, condition: "clear" },
      { day: "Wed", tempMin: 66, tempMax: 81, condition: "clear" },
      { day: "Thu", tempMin: 67, tempMax: 82, condition: "partly-cloudy" },
      { day: "Fri", tempMin: 68, tempMax: 80, condition: "clear" },
      { day: "Sat", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
    ],
  },
  {
    id: "seattle-morning",
    name: "Seattle Morning",
    location: "Seattle, WA",
    condition: "rain",
    timeOfDay: 0.35,
    temp: 52,
    tempMin: 48,
    tempMax: 55,
    unit: "fahrenheit",
    description: "Classic Pacific Northwest",
    forecast: [
      { day: "Mon", tempMin: 46, tempMax: 54, condition: "drizzle" },
      { day: "Tue", tempMin: 47, tempMax: 53, condition: "rain" },
      { day: "Wed", tempMin: 45, tempMax: 52, condition: "heavy-rain" },
      { day: "Thu", tempMin: 44, tempMax: 51, condition: "rain" },
      { day: "Fri", tempMin: 46, tempMax: 55, condition: "cloudy" },
    ],
  },
  {
    id: "london-fog",
    name: "London Fog",
    location: "London, UK",
    condition: "fog",
    timeOfDay: 0.3,
    temp: 8,
    tempMin: 5,
    tempMax: 11,
    unit: "celsius",
    description: "Mysterious morning mist",
    forecast: [
      { day: "Mon", tempMin: 4, tempMax: 10, condition: "fog" },
      { day: "Tue", tempMin: 6, tempMax: 12, condition: "cloudy" },
      { day: "Wed", tempMin: 7, tempMax: 14, condition: "partly-cloudy" },
      { day: "Thu", tempMin: 5, tempMax: 11, condition: "drizzle" },
      { day: "Fri", tempMin: 3, tempMax: 9, condition: "fog" },
    ],
  },
  {
    id: "minneapolis-winter",
    name: "Minneapolis Winter",
    location: "Minneapolis, MN",
    condition: "snow",
    timeOfDay: 0.6,
    temp: 18,
    tempMin: 8,
    tempMax: 22,
    unit: "fahrenheit",
    description: "Heavy snowfall warning",
    forecast: [
      { day: "Tue", tempMin: 5, tempMax: 19, condition: "snow" },
      { day: "Wed", tempMin: -2, tempMax: 12, condition: "snow" },
      { day: "Thu", tempMin: -8, tempMax: 6, condition: "cloudy" },
      { day: "Fri", tempMin: -5, tempMax: 10, condition: "partly-cloudy" },
      { day: "Sat", tempMin: 2, tempMax: 18, condition: "clear" },
    ],
  },
  {
    id: "bangkok-storm",
    name: "Bangkok Storm",
    location: "Bangkok, Thailand",
    condition: "thunderstorm",
    timeOfDay: 0.65,
    temp: 31,
    tempMin: 27,
    tempMax: 34,
    unit: "celsius",
    description: "Monsoon season",
    forecast: [
      { day: "Mon", tempMin: 27, tempMax: 35, condition: "thunderstorm" },
      { day: "Tue", tempMin: 28, tempMax: 36, condition: "heavy-rain" },
      { day: "Wed", tempMin: 27, tempMax: 34, condition: "thunderstorm" },
      { day: "Thu", tempMin: 26, tempMax: 33, condition: "rain" },
      { day: "Fri", tempMin: 28, tempMax: 35, condition: "partly-cloudy" },
    ],
  },
  {
    id: "sedona-night",
    name: "Sedona Night",
    location: "Sedona, AZ",
    condition: "clear",
    timeOfDay: 0.92,
    temp: 45,
    tempMin: 38,
    tempMax: 62,
    unit: "fahrenheit",
    description: "Stargazing conditions",
    forecast: [
      { day: "Tue", tempMin: 36, tempMax: 64, condition: "clear" },
      { day: "Wed", tempMin: 38, tempMax: 66, condition: "clear" },
      { day: "Thu", tempMin: 40, tempMax: 68, condition: "partly-cloudy" },
      { day: "Fri", tempMin: 42, tempMax: 70, condition: "clear" },
      { day: "Sat", tempMin: 39, tempMax: 65, condition: "clear" },
    ],
  },
  {
    id: "kansas-evening-storm",
    name: "Kansas Evening Storm",
    location: "Kansas City, MO",
    condition: "thunderstorm",
    timeOfDay: 0.75,
    temp: 72,
    tempMin: 65,
    tempMax: 78,
    unit: "fahrenheit",
    description: "Severe weather alert",
    forecast: [
      { day: "Tue", tempMin: 62, tempMax: 75, condition: "heavy-rain" },
      { day: "Wed", tempMin: 58, tempMax: 70, condition: "rain" },
      { day: "Thu", tempMin: 55, tempMax: 68, condition: "cloudy" },
      { day: "Fri", tempMin: 52, tempMax: 72, condition: "partly-cloudy" },
      { day: "Sat", tempMin: 58, tempMax: 76, condition: "clear" },
    ],
  },
  {
    id: "tokyo-overcast",
    name: "Tokyo Overcast",
    location: "Tokyo, Japan",
    condition: "overcast",
    timeOfDay: 0.45,
    temp: 18,
    tempMin: 14,
    tempMax: 21,
    unit: "celsius",
    description: "Grey skies persist",
    forecast: [
      { day: "Mon", tempMin: 13, tempMax: 20, condition: "overcast" },
      { day: "Tue", tempMin: 14, tempMax: 22, condition: "cloudy" },
      { day: "Wed", tempMin: 15, tempMax: 23, condition: "partly-cloudy" },
      { day: "Thu", tempMin: 12, tempMax: 19, condition: "drizzle" },
      { day: "Fri", tempMin: 14, tempMax: 21, condition: "overcast" },
    ],
  },
  {
    id: "denver-windy",
    name: "Denver Windy",
    location: "Denver, CO",
    condition: "windy",
    timeOfDay: 0.55,
    temp: 58,
    tempMin: 42,
    tempMax: 62,
    unit: "fahrenheit",
    description: "High wind advisory",
    forecast: [
      { day: "Mon", tempMin: 40, tempMax: 60, condition: "windy" },
      { day: "Tue", tempMin: 38, tempMax: 55, condition: "partly-cloudy" },
      { day: "Wed", tempMin: 35, tempMax: 52, condition: "cloudy" },
      { day: "Thu", tempMin: 42, tempMax: 65, condition: "clear" },
      { day: "Fri", tempMin: 45, tempMax: 68, condition: "clear" },
    ],
  },
  {
    id: "reykjavik-sleet",
    name: "Reykjavik Sleet",
    location: "Reykjavik, Iceland",
    condition: "sleet",
    timeOfDay: 0.4,
    temp: 2,
    tempMin: -1,
    tempMax: 4,
    unit: "celsius",
    description: "Mixed precipitation",
    forecast: [
      { day: "Mon", tempMin: -2, tempMax: 3, condition: "sleet" },
      { day: "Tue", tempMin: -3, tempMax: 2, condition: "snow" },
      { day: "Wed", tempMin: 0, tempMax: 5, condition: "rain" },
      { day: "Thu", tempMin: -1, tempMax: 4, condition: "sleet" },
      { day: "Fri", tempMin: 1, tempMax: 6, condition: "cloudy" },
    ],
  },
  {
    id: "miami-sunrise",
    name: "Miami Sunrise",
    location: "Miami, FL",
    condition: "partly-cloudy",
    timeOfDay: 0.27,
    temp: 78,
    tempMin: 74,
    tempMax: 86,
    unit: "fahrenheit",
    description: "Beautiful morning",
    forecast: [
      { day: "Mon", tempMin: 75, tempMax: 88, condition: "partly-cloudy" },
      { day: "Tue", tempMin: 76, tempMax: 89, condition: "clear" },
      { day: "Wed", tempMin: 74, tempMax: 87, condition: "thunderstorm" },
      { day: "Thu", tempMin: 75, tempMax: 86, condition: "partly-cloudy" },
      { day: "Fri", tempMin: 76, tempMax: 88, condition: "clear" },
    ],
  },
  {
    id: "portland-drizzle",
    name: "Portland Drizzle",
    location: "Portland, OR",
    condition: "drizzle",
    timeOfDay: 0.42,
    temp: 54,
    tempMin: 49,
    tempMax: 58,
    unit: "fahrenheit",
    description: "Light persistent rain",
    forecast: [
      { day: "Mon", tempMin: 48, tempMax: 56, condition: "drizzle" },
      { day: "Tue", tempMin: 47, tempMax: 55, condition: "rain" },
      { day: "Wed", tempMin: 49, tempMax: 58, condition: "drizzle" },
      { day: "Thu", tempMin: 50, tempMax: 60, condition: "cloudy" },
      { day: "Fri", tempMin: 48, tempMax: 57, condition: "drizzle" },
    ],
  },
];

export function getSceneById(id: string): WeatherScene | undefined {
  return WEATHER_SCENES.find(scene => scene.id === id);
}
