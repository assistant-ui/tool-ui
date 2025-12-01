"use client";

import * as React from "react";
import { cn } from "../_cn";
import { useWeatherWidget } from "../context";
import { ConditionIcon, getConditionLabel } from "../icons";
import { TemperatureText, EmbossedText } from "../skeuomorphic";
import { StatBadge } from "../skeuomorphic/tactile-card";

// ---------------------------------------------------------------------------
// Icons for stats
// ---------------------------------------------------------------------------

function DropletIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

function ThermometerIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface CurrentConditionsProps {
  className?: string;
}

export function CurrentConditions({ className }: CurrentConditionsProps) {
  const { widget, unit } = useWeatherWidget();
  const { current, location } = widget;

  const unitLabel = unit === "celsius" ? "km/h" : "mph";

  return (
    <div className={cn("flex flex-col gap-4 p-5", className)}>
      {/* Location name */}
      <div>
        <EmbossedText variant="raised" size="lg" className="font-semibold">
          {location.name}
        </EmbossedText>
        {location.region && (
          <EmbossedText variant="inset" size="sm" className="ml-2">
            {location.region}
          </EmbossedText>
        )}
      </div>

      {/* Main temperature + icon row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <TemperatureText value={current.temperature} unit={unit} />
          <EmbossedText variant="inset" size="sm" className="mt-1">
            {getConditionLabel(current.condition)}
          </EmbossedText>
        </div>

        <ConditionIcon
          condition={current.condition}
          size={72}
          className="drop-shadow-lg"
        />
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatBadge
          icon={<ThermometerIcon />}
          label="Feels"
          value={`${Math.round(current.feelsLike)}\u00B0`}
        />
        <StatBadge
          icon={<DropletIcon />}
          label="Humidity"
          value={`${current.humidity}%`}
        />
        <StatBadge
          icon={<WindIcon />}
          label="Wind"
          value={`${current.windSpeed} ${unitLabel}`}
        />
        {current.uvIndex !== undefined && (
          <StatBadge label="UV" value={current.uvIndex} />
        )}
      </div>
    </div>
  );
}
