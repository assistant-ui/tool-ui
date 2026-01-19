"use client";

import { useState, useMemo } from "react";
import { useControls, Leva } from "leva";
import { WeatherWidget } from "@/components/tool-ui/weather-widget";
import type {
  WeatherCondition,
  SerializableWeatherWidget,
} from "@/components/tool-ui/weather-widget/schema";

interface LocationPreset extends Omit<SerializableWeatherWidget, "id"> {
  name: string;
  description: string;
}

const LOCATION_PRESETS: LocationPreset[] = [
  {
    name: "san-diego",
    description: "Clear & Sunny",
    location: "San Diego, CA",
    current: { temp: 76, tempMin: 68, tempMax: 79, condition: "clear" },
    forecast: [
      { day: "Tue", tempMin: 65, tempMax: 78, condition: "clear" },
      { day: "Wed", tempMin: 66, tempMax: 81, condition: "clear" },
      { day: "Thu", tempMin: 67, tempMax: 82, condition: "partly-cloudy" },
      { day: "Fri", tempMin: 68, tempMax: 80, condition: "clear" },
      { day: "Sat", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "seattle",
    description: "Rainy Week",
    location: "Seattle, WA",
    current: { temp: 52, tempMin: 48, tempMax: 55, condition: "rain" },
    forecast: [
      { day: "Mon", tempMin: 46, tempMax: 54, condition: "drizzle" },
      { day: "Tue", tempMin: 47, tempMax: 53, condition: "rain" },
      { day: "Wed", tempMin: 45, tempMax: 52, condition: "heavy-rain" },
      { day: "Thu", tempMin: 44, tempMax: 51, condition: "rain" },
      { day: "Fri", tempMin: 46, tempMax: 55, condition: "cloudy" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "london",
    description: "Overcast & Foggy",
    location: "London, UK",
    current: { temp: 8, tempMin: 5, tempMax: 10, condition: "fog" },
    forecast: [
      { day: "Mon", tempMin: 4, tempMax: 9, condition: "fog" },
      { day: "Tue", tempMin: 6, tempMax: 11, condition: "overcast" },
      { day: "Wed", tempMin: 5, tempMax: 10, condition: "cloudy" },
      { day: "Thu", tempMin: 7, tempMax: 12, condition: "drizzle" },
      { day: "Fri", tempMin: 4, tempMax: 8, condition: "fog" },
    ],
    unit: "celsius",
  },
  {
    name: "minneapolis",
    description: "Heavy Snow",
    location: "Minneapolis, MN",
    current: { temp: 18, tempMin: 8, tempMax: 22, condition: "snow" },
    forecast: [
      { day: "Tue", tempMin: 5, tempMax: 19, condition: "snow" },
      { day: "Wed", tempMin: -2, tempMax: 12, condition: "snow" },
      { day: "Thu", tempMin: -8, tempMax: 6, condition: "cloudy" },
      { day: "Fri", tempMin: -5, tempMax: 10, condition: "partly-cloudy" },
      { day: "Sat", tempMin: 2, tempMax: 18, condition: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "kansas-city",
    description: "Thunderstorm",
    location: "Kansas City, MO",
    current: { temp: 72, tempMin: 65, tempMax: 78, condition: "thunderstorm" },
    forecast: [
      { day: "Tue", tempMin: 62, tempMax: 75, condition: "heavy-rain" },
      { day: "Wed", tempMin: 58, tempMax: 70, condition: "rain" },
      { day: "Thu", tempMin: 55, tempMax: 68, condition: "cloudy" },
      { day: "Fri", tempMin: 52, tempMax: 72, condition: "partly-cloudy" },
      { day: "Sat", tempMin: 58, tempMax: 76, condition: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "chicago",
    description: "Windy City",
    location: "Chicago, IL",
    current: { temp: 45, tempMin: 38, tempMax: 52, condition: "windy" },
    forecast: [
      { day: "Tue", tempMin: 35, tempMax: 48, condition: "windy" },
      { day: "Wed", tempMin: 32, tempMax: 45, condition: "partly-cloudy" },
      { day: "Thu", tempMin: 30, tempMax: 42, condition: "cloudy" },
      { day: "Fri", tempMin: 28, tempMax: 40, condition: "snow" },
      { day: "Sat", tempMin: 25, tempMax: 38, condition: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "sedona",
    description: "Desert Night",
    location: "Sedona, AZ",
    current: { temp: 45, tempMin: 38, tempMax: 62, condition: "clear" },
    forecast: [
      { day: "Tue", tempMin: 36, tempMax: 64, condition: "clear" },
      { day: "Wed", tempMin: 38, tempMax: 66, condition: "clear" },
      { day: "Thu", tempMin: 40, tempMax: 68, condition: "partly-cloudy" },
      { day: "Fri", tempMin: 42, tempMax: 70, condition: "clear" },
      { day: "Sat", tempMin: 39, tempMax: 65, condition: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "reykjavik",
    description: "Sleet & Hail",
    location: "Reykjavik, Iceland",
    current: { temp: 2, tempMin: -1, tempMax: 4, condition: "sleet" },
    forecast: [
      { day: "Mon", tempMin: -2, tempMax: 3, condition: "sleet" },
      { day: "Tue", tempMin: -3, tempMax: 2, condition: "hail" },
      { day: "Wed", tempMin: -1, tempMax: 4, condition: "snow" },
      { day: "Thu", tempMin: 0, tempMax: 5, condition: "overcast" },
      { day: "Fri", tempMin: 1, tempMax: 6, condition: "windy" },
    ],
    unit: "celsius",
  },
  {
    name: "bangkok",
    description: "Heavy Rain",
    location: "Bangkok, Thailand",
    current: { temp: 29, tempMin: 26, tempMax: 32, condition: "heavy-rain" },
    forecast: [
      { day: "Mon", tempMin: 25, tempMax: 31, condition: "heavy-rain" },
      { day: "Tue", tempMin: 26, tempMax: 33, condition: "thunderstorm" },
      { day: "Wed", tempMin: 27, tempMax: 34, condition: "rain" },
      { day: "Thu", tempMin: 26, tempMax: 32, condition: "drizzle" },
      { day: "Fri", tempMin: 28, tempMax: 35, condition: "partly-cloudy" },
    ],
    unit: "celsius",
  },
  {
    name: "portland",
    description: "Drizzle",
    location: "Portland, OR",
    current: { temp: 48, tempMin: 42, tempMax: 52, condition: "drizzle" },
    forecast: [
      { day: "Mon", tempMin: 40, tempMax: 50, condition: "drizzle" },
      { day: "Tue", tempMin: 42, tempMax: 52, condition: "cloudy" },
      { day: "Wed", tempMin: 44, tempMax: 54, condition: "drizzle" },
      { day: "Thu", tempMin: 43, tempMax: 53, condition: "rain" },
      { day: "Fri", tempMin: 45, tempMax: 55, condition: "partly-cloudy" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "denver",
    description: "Partly Cloudy",
    location: "Denver, CO",
    current: { temp: 58, tempMin: 45, tempMax: 65, condition: "partly-cloudy" },
    forecast: [
      { day: "Mon", tempMin: 42, tempMax: 62, condition: "partly-cloudy" },
      { day: "Tue", tempMin: 40, tempMax: 60, condition: "clear" },
      { day: "Wed", tempMin: 38, tempMax: 58, condition: "cloudy" },
      { day: "Thu", tempMin: 35, tempMax: 55, condition: "snow" },
      { day: "Fri", tempMin: 30, tempMax: 50, condition: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "pittsburgh",
    description: "Overcast",
    location: "Pittsburgh, PA",
    current: { temp: 42, tempMin: 36, tempMax: 48, condition: "overcast" },
    forecast: [
      { day: "Mon", tempMin: 34, tempMax: 46, condition: "overcast" },
      { day: "Tue", tempMin: 32, tempMax: 44, condition: "cloudy" },
      { day: "Wed", tempMin: 30, tempMax: 42, condition: "rain" },
      { day: "Thu", tempMin: 28, tempMax: 40, condition: "overcast" },
      { day: "Fri", tempMin: 32, tempMax: 45, condition: "partly-cloudy" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "sf",
    description: "Cloudy",
    location: "San Francisco, CA",
    current: { temp: 58, tempMin: 52, tempMax: 62, condition: "cloudy" },
    forecast: [
      { day: "Mon", tempMin: 50, tempMax: 60, condition: "cloudy" },
      { day: "Tue", tempMin: 52, tempMax: 62, condition: "fog" },
      { day: "Wed", tempMin: 54, tempMax: 64, condition: "partly-cloudy" },
      { day: "Thu", tempMin: 55, tempMax: 65, condition: "clear" },
      { day: "Fri", tempMin: 53, tempMax: 63, condition: "cloudy" },
    ],
    unit: "fahrenheit",
  },
];

function formatTimeLabel(timeOfDay: number): string {
  const totalMinutes = timeOfDay * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function timeToISOString(timeOfDay: number): string {
  const totalMinutes = timeOfDay * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}

interface LocationPillProps {
  preset: LocationPreset;
  isActive: boolean;
  onClick: () => void;
}

function LocationPill({ preset, isActive, onClick }: LocationPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all
        ${isActive
          ? "bg-white/20 text-white ring-1 ring-white/30"
          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
        }
      `}
    >
      <span className="block">{preset.location.split(",")[0]}</span>
      <span className="block text-[10px] opacity-60">{preset.description}</span>
    </button>
  );
}

export default function WeatherWidgetSandbox() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = LOCATION_PRESETS[activePresetIndex];

  const [{ timeOfDay, effectsEnabled, quality }] = useControls("Settings", () => ({
    timeOfDay: { value: 0.5, min: 0, max: 1, step: 0.01, label: "Time of Day" },
    effectsEnabled: { value: true, label: "Effects" },
    quality: {
      value: "high" as const,
      options: ["low", "medium", "high", "auto"] as const,
      label: "Quality",
    },
  }));

  const timestamp = useMemo(() => timeToISOString(timeOfDay), [timeOfDay]);

  const widgetData: SerializableWeatherWidget = useMemo(() => ({
    id: `weather-widget-${activePreset.name}`,
    location: activePreset.location,
    current: activePreset.current,
    forecast: activePreset.forecast,
    unit: activePreset.unit,
    updatedAt: timestamp,
  }), [activePreset, timestamp]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Leva
        collapsed={false}
        flat={false}
        titleBar={{ title: "Weather Widget" }}
        theme={{
          sizes: {
            rootWidth: "240px",
            controlWidth: "120px",
          },
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
        <div className="flex w-full max-w-[800px] flex-wrap items-center justify-center gap-2">
          {LOCATION_PRESETS.map((preset, index) => (
            <LocationPill
              key={preset.name}
              preset={preset}
              isActive={index === activePresetIndex}
              onClick={() => setActivePresetIndex(index)}
            />
          ))}
        </div>

        <div className="relative">
          <WeatherWidget
            {...widgetData}
            effects={{
              enabled: effectsEnabled,
              quality,
            }}
          />
        </div>

        <div className="rounded bg-black/50 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
          {formatTimeLabel(timeOfDay)} · {activePreset.current.condition}
        </div>
      </div>
    </div>
  );
}
