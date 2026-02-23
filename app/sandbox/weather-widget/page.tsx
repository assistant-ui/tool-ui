"use client";

import { useState, useMemo } from "react";
import { useControls, Leva } from "leva";
import {
  WeatherWidget,
  type TemperatureUnit,
  type WeatherWidgetCurrent,
  type WeatherWidgetPayload,
} from "@/components/tool-ui/weather-widget/runtime";

interface LocationPreset {
  name: string;
  description: string;
  location: string;
  current: WeatherWidgetCurrent;
  forecast: WeatherWidgetPayload["forecast"];
  unit: TemperatureUnit;
}

const LOCATION_PRESETS: LocationPreset[] = [
  {
    name: "san-diego",
    description: "Clear & Sunny",
    location: "San Diego, CA",
    current: {
      temperature: 76,
      tempMin: 68,
      tempMax: 79,
      conditionCode: "clear",
    },
    forecast: [
      { label: "Tue", tempMin: 65, tempMax: 78, conditionCode: "clear" },
      { label: "Wed", tempMin: 66, tempMax: 81, conditionCode: "clear" },
      {
        label: "Thu",
        tempMin: 67,
        tempMax: 82,
        conditionCode: "partly-cloudy",
      },
      { label: "Fri", tempMin: 68, tempMax: 80, conditionCode: "clear" },
      {
        label: "Sat",
        tempMin: 64,
        tempMax: 77,
        conditionCode: "partly-cloudy",
      },
    ],
    unit: "fahrenheit",
  },
  {
    name: "seattle",
    description: "Rainy Week",
    location: "Seattle, WA",
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
    unit: "fahrenheit",
  },
  {
    name: "london",
    description: "Overcast & Foggy",
    location: "London, UK",
    current: { temperature: 8, tempMin: 5, tempMax: 10, conditionCode: "fog" },
    forecast: [
      { label: "Mon", tempMin: 4, tempMax: 9, conditionCode: "fog" },
      { label: "Tue", tempMin: 6, tempMax: 11, conditionCode: "overcast" },
      { label: "Wed", tempMin: 5, tempMax: 10, conditionCode: "cloudy" },
      { label: "Thu", tempMin: 7, tempMax: 12, conditionCode: "drizzle" },
      { label: "Fri", tempMin: 4, tempMax: 8, conditionCode: "fog" },
    ],
    unit: "celsius",
  },
  {
    name: "minneapolis",
    description: "Heavy Snow",
    location: "Minneapolis, MN",
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
      {
        label: "Fri",
        tempMin: -5,
        tempMax: 10,
        conditionCode: "partly-cloudy",
      },
      { label: "Sat", tempMin: 2, tempMax: 18, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "kansas-city",
    description: "Thunderstorm",
    location: "Kansas City, MO",
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
      {
        label: "Fri",
        tempMin: 52,
        tempMax: 72,
        conditionCode: "partly-cloudy",
      },
      { label: "Sat", tempMin: 58, tempMax: 76, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "chicago",
    description: "Windy City",
    location: "Chicago, IL",
    current: {
      temperature: 45,
      tempMin: 38,
      tempMax: 52,
      conditionCode: "windy",
    },
    forecast: [
      { label: "Tue", tempMin: 35, tempMax: 48, conditionCode: "windy" },
      {
        label: "Wed",
        tempMin: 32,
        tempMax: 45,
        conditionCode: "partly-cloudy",
      },
      { label: "Thu", tempMin: 30, tempMax: 42, conditionCode: "cloudy" },
      { label: "Fri", tempMin: 28, tempMax: 40, conditionCode: "snow" },
      { label: "Sat", tempMin: 25, tempMax: 38, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "sedona",
    description: "Desert Night",
    location: "Sedona, AZ",
    current: {
      temperature: 45,
      tempMin: 38,
      tempMax: 62,
      conditionCode: "clear",
    },
    forecast: [
      { label: "Tue", tempMin: 36, tempMax: 64, conditionCode: "clear" },
      { label: "Wed", tempMin: 38, tempMax: 66, conditionCode: "clear" },
      {
        label: "Thu",
        tempMin: 40,
        tempMax: 68,
        conditionCode: "partly-cloudy",
      },
      { label: "Fri", tempMin: 42, tempMax: 70, conditionCode: "clear" },
      { label: "Sat", tempMin: 39, tempMax: 65, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "reykjavik",
    description: "Sleet & Hail",
    location: "Reykjavik, Iceland",
    current: {
      temperature: 2,
      tempMin: -1,
      tempMax: 4,
      conditionCode: "sleet",
    },
    forecast: [
      { label: "Mon", tempMin: -2, tempMax: 3, conditionCode: "sleet" },
      { label: "Tue", tempMin: -3, tempMax: 2, conditionCode: "hail" },
      { label: "Wed", tempMin: -1, tempMax: 4, conditionCode: "snow" },
      { label: "Thu", tempMin: 0, tempMax: 5, conditionCode: "overcast" },
      { label: "Fri", tempMin: 1, tempMax: 6, conditionCode: "windy" },
    ],
    unit: "celsius",
  },
  {
    name: "bangkok",
    description: "Heavy Rain",
    location: "Bangkok, Thailand",
    current: {
      temperature: 29,
      tempMin: 26,
      tempMax: 32,
      conditionCode: "heavy-rain",
    },
    forecast: [
      { label: "Mon", tempMin: 25, tempMax: 31, conditionCode: "heavy-rain" },
      { label: "Tue", tempMin: 26, tempMax: 33, conditionCode: "thunderstorm" },
      { label: "Wed", tempMin: 27, tempMax: 34, conditionCode: "rain" },
      { label: "Thu", tempMin: 26, tempMax: 32, conditionCode: "drizzle" },
      {
        label: "Fri",
        tempMin: 28,
        tempMax: 35,
        conditionCode: "partly-cloudy",
      },
    ],
    unit: "celsius",
  },
  {
    name: "portland",
    description: "Drizzle",
    location: "Portland, OR",
    current: {
      temperature: 48,
      tempMin: 42,
      tempMax: 52,
      conditionCode: "drizzle",
    },
    forecast: [
      { label: "Mon", tempMin: 40, tempMax: 50, conditionCode: "drizzle" },
      { label: "Tue", tempMin: 42, tempMax: 52, conditionCode: "cloudy" },
      { label: "Wed", tempMin: 44, tempMax: 54, conditionCode: "drizzle" },
      { label: "Thu", tempMin: 43, tempMax: 53, conditionCode: "rain" },
      {
        label: "Fri",
        tempMin: 45,
        tempMax: 55,
        conditionCode: "partly-cloudy",
      },
    ],
    unit: "fahrenheit",
  },
  {
    name: "denver",
    description: "Partly Cloudy",
    location: "Denver, CO",
    current: {
      temperature: 58,
      tempMin: 45,
      tempMax: 65,
      conditionCode: "partly-cloudy",
    },
    forecast: [
      {
        label: "Mon",
        tempMin: 42,
        tempMax: 62,
        conditionCode: "partly-cloudy",
      },
      { label: "Tue", tempMin: 40, tempMax: 60, conditionCode: "clear" },
      { label: "Wed", tempMin: 38, tempMax: 58, conditionCode: "cloudy" },
      { label: "Thu", tempMin: 35, tempMax: 55, conditionCode: "snow" },
      { label: "Fri", tempMin: 30, tempMax: 50, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  },
  {
    name: "pittsburgh",
    description: "Overcast",
    location: "Pittsburgh, PA",
    current: {
      temperature: 42,
      tempMin: 36,
      tempMax: 48,
      conditionCode: "overcast",
    },
    forecast: [
      { label: "Mon", tempMin: 34, tempMax: 46, conditionCode: "overcast" },
      { label: "Tue", tempMin: 32, tempMax: 44, conditionCode: "cloudy" },
      { label: "Wed", tempMin: 30, tempMax: 42, conditionCode: "rain" },
      { label: "Thu", tempMin: 28, tempMax: 40, conditionCode: "overcast" },
      {
        label: "Fri",
        tempMin: 32,
        tempMax: 45,
        conditionCode: "partly-cloudy",
      },
    ],
    unit: "fahrenheit",
  },
  {
    name: "sf",
    description: "Cloudy",
    location: "San Francisco, CA",
    current: {
      temperature: 58,
      tempMin: 52,
      tempMax: 62,
      conditionCode: "cloudy",
    },
    forecast: [
      { label: "Mon", tempMin: 50, tempMax: 60, conditionCode: "cloudy" },
      { label: "Tue", tempMin: 52, tempMax: 62, conditionCode: "fog" },
      {
        label: "Wed",
        tempMin: 54,
        tempMax: 64,
        conditionCode: "partly-cloudy",
      },
      { label: "Thu", tempMin: 55, tempMax: 65, conditionCode: "clear" },
      { label: "Fri", tempMin: 53, tempMax: 63, conditionCode: "cloudy" },
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
  // Keep this aligned with `getTimeOfDay`, which interprets timestamps in UTC.
  now.setUTCHours(hours, minutes, 0, 0);
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
      className={`relative rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
        isActive
          ? "bg-white/20 text-white ring-1 ring-white/30"
          : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
      } `}
    >
      <span className="block">{preset.location.split(",")[0]}</span>
      <span className="block text-[10px] opacity-60">{preset.description}</span>
    </button>
  );
}

export default function WeatherWidgetSandbox() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = LOCATION_PRESETS[activePresetIndex];

  const [{ timeOfDay, effectsEnabled, quality }] = useControls(
    "Settings",
    () => ({
      timeOfDay: {
        value: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Time of Day",
      },
      effectsEnabled: { value: true, label: "Effects" },
      quality: {
        value: "high" as const,
        options: ["low", "medium", "high", "auto"] as const,
        label: "Quality",
      },
    }),
  );

  const timestamp = useMemo(() => timeToISOString(timeOfDay), [timeOfDay]);

  const widgetData: WeatherWidgetPayload = {
    version: "3.1",
    id: `weather-widget-${activePreset.name}`,
    location: { name: activePreset.location },
    units: { temperature: activePreset.unit },
    current: activePreset.current,
    forecast: activePreset.forecast,
    time: { localTimeOfDay: timeOfDay },
    updatedAt: timestamp,
  };

  return (
    <div className="relative min-h-screen bg-linear-to-b from-slate-900 to-slate-950">
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
          {formatTimeLabel(timeOfDay)} · {activePreset.current.conditionCode}
        </div>
      </div>
    </div>
  );
}
