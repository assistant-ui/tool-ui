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

/**
 * Custom effect layer props for direct control.
 * When provided, these override the auto-calculated values from mapWeatherToEffects.
 */
export interface CustomEffectProps {
  layers?: {
    celestial?: boolean;
    clouds?: boolean;
    rain?: boolean;
    lightning?: boolean;
    snow?: boolean;
  };
  celestial?: {
    timeOfDay: number;
    moonPhase: number;
    starDensity: number;
    celestialX: number;
    celestialY: number;
    sunSize: number;
    moonSize: number;
    sunGlowIntensity: number;
    sunGlowSize: number;
    sunRayCount: number;
    sunRayLength: number;
    sunRayIntensity: number;
    moonGlowIntensity: number;
    moonGlowSize: number;
  };
  cloud?: {
    cloudScale?: number;
    coverage: number;
    density?: number;
    softness?: number;
    windSpeed: number;
    windAngle?: number;
    turbulence: number;
    sunAltitude: number;
    sunAzimuth?: number;
    lightIntensity?: number;
    ambientDarkness: number;
    numLayers?: number;
    layerSpread?: number;
    starDensity: number;
    starSize?: number;
    starTwinkleSpeed?: number;
    starTwinkleAmount?: number;
    horizonLine?: number;
  };
  rain?: {
    glassIntensity: number;
    zoom?: number;
    fallingIntensity: number;
    fallingSpeed?: number;
    fallingAngle: number;
    fallingStreakLength?: number;
    fallingLayers?: number;
    fallingRefraction?: number;
    fallingWaviness?: number;
    fallingThicknessVar?: number;
  };
  lightning?: {
    branchDensity?: number;
    displacement?: number;
    glowIntensity?: number;
    flashDuration?: number;
    sceneIllumination?: number;
    afterglowPersistence?: number;
    autoMode: boolean;
    autoInterval: number;
  };
  snow?: {
    intensity: number;
    layers?: number;
    fallSpeed?: number;
    windSpeed: number;
    windAngle?: number;
    turbulence?: number;
    drift: number;
    flutter?: number;
    windShear?: number;
    flakeSize?: number;
    sizeVariation?: number;
    opacity?: number;
    glowAmount?: number;
    sparkle?: number;
    visibility?: number;
  };
}

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
  /**
   * Custom effect props for direct control over all effect parameters.
   * When provided, these override the auto-calculated values.
   */
  customProps?: CustomEffectProps;
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
  customProps,
}: EffectCompositorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const enabled = settings?.enabled !== false;
  const reducedMotion = settings?.reducedMotion ?? false;
  const hasCustomProps = customProps !== undefined;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const effectConfig = useMemo(() => {
    if (!enabled || hasCustomProps) return null;

    return mapWeatherToEffects({
      condition,
      windSpeed,
      windDirection,
      precipitation,
      humidity,
      visibility,
      timestamp,
    });
  }, [condition, windSpeed, windDirection, precipitation, humidity, visibility, timestamp, enabled, hasCustomProps]);

  // Derive props from either customProps or effectConfig
  const derivedProps = useMemo(() => {
    if (hasCustomProps) {
      const layers = customProps.layers;
      return {
        hasCelestial: layers?.celestial !== false && customProps.celestial !== undefined,
        hasCloud: layers?.clouds !== false && customProps.cloud !== undefined,
        hasRain: layers?.rain !== false && customProps.rain !== undefined,
        hasLightning: layers?.lightning !== false && customProps.lightning !== undefined,
        hasSnow: layers?.snow !== false && customProps.snow !== undefined,
        celestial: customProps.celestial,
        cloud: customProps.cloud,
        rain: customProps.rain,
        lightning: customProps.lightning,
        snow: customProps.snow,
        isCustom: true as const,
      };
    }

    if (!effectConfig) {
      return {
        hasCelestial: false,
        hasCloud: false,
        hasRain: false,
        hasLightning: false,
        hasSnow: false,
        celestial: undefined,
        cloud: undefined,
        rain: undefined,
        lightning: undefined,
        snow: undefined,
        isCustom: false as const,
      };
    }

    const celestialProps = configToCelestialProps(effectConfig);
    const cloudProps = configToCloudProps(effectConfig);
    const rainProps = configToRainProps(effectConfig);
    const lightningProps = configToLightningProps(effectConfig);
    const snowProps = configToSnowProps(effectConfig);

    return {
      hasCelestial: celestialProps !== null,
      hasCloud: cloudProps !== null,
      hasRain: rainProps !== null,
      hasLightning: lightningProps !== null,
      hasSnow: snowProps !== null,
      celestial: celestialProps ?? undefined,
      cloud: cloudProps ?? undefined,
      rain: rainProps ?? undefined,
      lightning: lightningProps ?? undefined,
      snow: snowProps ?? undefined,
      isCustom: false as const,
    };
  }, [hasCustomProps, customProps, effectConfig]);

  if (!isMounted || !enabled || reducedMotion) {
    return null;
  }

  const { hasCelestial, hasCloud, hasRain, hasLightning, hasSnow, celestial, cloud, rain, lightning, snow, isCustom } = derivedProps;

  // Type helpers for accessing optional props (only exist in custom mode)
  const cloudCustom = isCustom ? cloud as CustomEffectProps["cloud"] : undefined;
  const rainCustom = isCustom ? rain as CustomEffectProps["rain"] : undefined;
  const lightningCustom = isCustom ? lightning as CustomEffectProps["lightning"] : undefined;
  const snowCustom = isCustom ? snow as CustomEffectProps["snow"] : undefined;

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
      {hasCelestial && celestial && (
        <CelestialCanvas
          className="absolute inset-0"
          timeOfDay={celestial.timeOfDay}
          moonPhase={celestial.moonPhase}
          starDensity={celestial.starDensity}
          celestialX={celestial.celestialX}
          celestialY={celestial.celestialY}
          sunSize={celestial.sunSize}
          moonSize={celestial.moonSize}
          sunGlowIntensity={celestial.sunGlowIntensity}
          sunGlowSize={celestial.sunGlowSize}
          sunRayCount={celestial.sunRayCount}
          sunRayLength={celestial.sunRayLength}
          sunRayIntensity={celestial.sunRayIntensity}
          moonGlowIntensity={celestial.moonGlowIntensity}
          moonGlowSize={celestial.moonGlowSize}
        />
      )}

      {hasCloud && cloud && (
        <CloudCanvas
          className="absolute inset-0"
          cloudScale={cloudCustom?.cloudScale}
          coverage={cloud.coverage}
          density={cloudCustom?.density}
          softness={cloudCustom?.softness}
          windSpeed={cloud.windSpeed}
          windAngle={cloudCustom?.windAngle}
          turbulence={cloud.turbulence}
          sunAltitude={cloud.sunAltitude}
          sunAzimuth={cloudCustom?.sunAzimuth}
          lightIntensity={cloudCustom?.lightIntensity}
          ambientDarkness={cloud.ambientDarkness}
          numLayers={cloudCustom?.numLayers ?? 3}
          layerSpread={cloudCustom?.layerSpread}
          starDensity={cloud.starDensity}
          starSize={cloudCustom?.starSize}
          starTwinkleSpeed={cloudCustom?.starTwinkleSpeed}
          starTwinkleAmount={cloudCustom?.starTwinkleAmount}
          horizonLine={cloudCustom?.horizonLine}
          transparentBackground={true}
        />
      )}

      {hasRain && rain && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "screen" }}
        >
          <RainCanvas
            className="absolute inset-0"
            glassIntensity={rain.glassIntensity}
            zoom={rainCustom?.zoom}
            fallingIntensity={rain.fallingIntensity}
            fallingSpeed={rainCustom?.fallingSpeed}
            fallingAngle={rain.fallingAngle}
            fallingStreakLength={rainCustom?.fallingStreakLength}
            fallingLayers={rainCustom?.fallingLayers ?? 3}
            fallingRefraction={rainCustom?.fallingRefraction}
            fallingWaviness={rainCustom?.fallingWaviness}
            fallingThicknessVar={rainCustom?.fallingThicknessVar}
          />
        </div>
      )}

      {hasLightning && lightning && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "screen" }}
        >
          <LightningCanvas
            className="absolute inset-0"
            branchDensity={isCustom ? lightningCustom?.branchDensity : undefined}
            displacement={isCustom ? lightningCustom?.displacement : undefined}
            glowIntensity={isCustom ? lightningCustom?.glowIntensity : undefined}
            flashDuration={isCustom ? lightningCustom?.flashDuration : undefined}
            sceneIllumination={isCustom ? lightningCustom?.sceneIllumination : 0.6}
            afterglowPersistence={isCustom ? lightningCustom?.afterglowPersistence : undefined}
            autoMode={lightning.autoMode}
            autoInterval={lightning.autoInterval}
          />
        </div>
      )}

      {hasSnow && snow && (
        <div
          className="absolute inset-0"
          style={{ mixBlendMode: "plus-lighter" }}
        >
          <SnowCanvas
            className="absolute inset-0"
            intensity={snow.intensity}
            layers={isCustom ? snowCustom?.layers : 4}
            fallSpeed={isCustom ? snowCustom?.fallSpeed : undefined}
            windSpeed={snow.windSpeed}
            windAngle={isCustom ? snowCustom?.windAngle : undefined}
            turbulence={isCustom ? snowCustom?.turbulence : undefined}
            drift={snow.drift}
            flutter={isCustom ? snowCustom?.flutter : undefined}
            windShear={isCustom ? snowCustom?.windShear : undefined}
            flakeSize={isCustom ? snowCustom?.flakeSize : undefined}
            sizeVariation={isCustom ? snowCustom?.sizeVariation : undefined}
            opacity={isCustom ? snowCustom?.opacity : undefined}
            glowAmount={isCustom ? snowCustom?.glowAmount : undefined}
            sparkle={isCustom ? snowCustom?.sparkle : undefined}
            visibility={isCustom ? snowCustom?.visibility : undefined}
          />
        </div>
      )}
    </div>
  );
}
