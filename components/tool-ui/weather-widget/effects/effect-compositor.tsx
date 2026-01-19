"use client";

import { useMemo, useState, useEffect } from "react";
import { CloudCanvas } from "@/app/sandbox/cloud-effect/cloud-canvas";
import { RainCanvas } from "@/app/sandbox/rain-effect/rain-canvas";
import { LightningCanvas } from "@/app/sandbox/lightning-effect/lightning-canvas";
import { SnowCanvas } from "@/app/sandbox/snow-effect/snow-canvas";
import { CelestialCanvas } from "./celestial-canvas";
import type { WeatherCondition } from "../schema";
import type { EffectSettings } from "./types";
import {
  mapWeatherToEffects,
  configToCloudProps,
  configToRainProps,
  configToLightningProps,
  configToSnowProps,
  configToCelestialProps,
} from "./parameter-mapper";

interface EffectCompositorProps {
  condition: WeatherCondition;
  windSpeed?: number;
  windDirection?: number;
  precipitation?: "none" | "light" | "moderate" | "heavy";
  humidity?: number;
  visibility?: number;
  timestamp?: string;
  settings?: EffectSettings;
  className?: string;
}

export function EffectCompositor({
  condition,
  windSpeed,
  windDirection,
  precipitation,
  humidity,
  visibility,
  timestamp,
  settings,
  className,
}: EffectCompositorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const enabled = settings?.enabled !== false;
  const reducedMotion = settings?.reducedMotion ?? false;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const effectConfig = useMemo(() => {
    if (!enabled) return null;

    return mapWeatherToEffects({
      condition,
      windSpeed,
      windDirection,
      precipitation,
      humidity,
      visibility,
      timestamp,
    });
  }, [condition, windSpeed, windDirection, precipitation, humidity, visibility, timestamp, enabled]);

  if (!isMounted || !enabled || !effectConfig) {
    return null;
  }

  const celestialProps = configToCelestialProps(effectConfig);
  const cloudProps = configToCloudProps(effectConfig);
  const rainProps = configToRainProps(effectConfig);
  const lightningProps = configToLightningProps(effectConfig);
  const snowProps = configToSnowProps(effectConfig);

  const hasCelestial = celestialProps !== null;
  const hasCloud = cloudProps !== null;
  const hasRain = rainProps !== null;
  const hasLightning = lightningProps !== null;
  const hasSnow = snowProps !== null;

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
      aria-hidden="true"
    >
      {hasCelestial && (
        <CelestialCanvas
          className="absolute inset-0"
          timeOfDay={celestialProps.timeOfDay}
          moonPhase={celestialProps.moonPhase}
          starDensity={celestialProps.starDensity}
          celestialX={celestialProps.celestialX}
          celestialY={celestialProps.celestialY}
          sunSize={celestialProps.sunSize}
          moonSize={celestialProps.moonSize}
          sunGlowIntensity={celestialProps.sunGlowIntensity}
          sunGlowSize={celestialProps.sunGlowSize}
          sunRayCount={celestialProps.sunRayCount}
          sunRayLength={celestialProps.sunRayLength}
          sunRayIntensity={celestialProps.sunRayIntensity}
          moonGlowIntensity={celestialProps.moonGlowIntensity}
          moonGlowSize={celestialProps.moonGlowSize}
        />
      )}

      {hasCloud && (
        <CloudCanvas
          className="absolute inset-0"
          coverage={cloudProps.coverage}
          windSpeed={cloudProps.windSpeed}
          turbulence={cloudProps.turbulence}
          sunAltitude={cloudProps.sunAltitude}
          ambientDarkness={cloudProps.ambientDarkness}
          starDensity={cloudProps.starDensity}
          numLayers={3}
          density={0.7}
        />
      )}

      {hasRain && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "screen" }}
        >
          <RainCanvas
            className="absolute inset-0"
            glassIntensity={rainProps.glassIntensity}
            fallingIntensity={rainProps.fallingIntensity}
            fallingAngle={rainProps.fallingAngle}
            fallingLayers={3}
          />
        </div>
      )}

      {hasLightning && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "screen" }}
        >
          <LightningCanvas
            className="absolute inset-0"
            autoMode={lightningProps.autoMode}
            autoInterval={lightningProps.autoInterval}
            sceneIllumination={0.6}
          />
        </div>
      )}

      {hasSnow && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "plus-lighter" }}
        >
          <SnowCanvas
            className="absolute inset-0"
            intensity={snowProps.intensity}
            windSpeed={snowProps.windSpeed}
            drift={snowProps.drift}
            layers={4}
          />
        </div>
      )}
    </div>
  );
}
