"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudHail,
  Wind,
  Droplets,
  type LucideIcon,
} from "lucide-react";
import { cn } from "./_adapter";
import type { ForecastDay, TemperatureUnit, WeatherCondition } from "./schema";
import {
  getSceneBrightnessFromTimeOfDay,
  getTimeOfDay,
  getWeatherTheme,
  useGlassStyles,
  type WeatherTheme,
} from "./effects";

// =============================================================================
// Constants
// =============================================================================

const CONDITION_ICONS: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  "heavy-rain": CloudRain,
  thunderstorm: CloudLightning,
  snow: Snowflake,
  sleet: CloudHail,
  hail: CloudHail,
  windy: Wind,
};

const GLOW_MAX_DISTANCE = 150;

// =============================================================================
// Utilities
// =============================================================================

/** Returns intensity (0-1) based on proximity to noon or midnight. */
function getPeakIntensity(timeOfDay: number): number {
  const noonDistance = Math.abs(timeOfDay - 0.5);
  const midnightDistance = Math.min(timeOfDay, 1 - timeOfDay);
  return Math.max(0, 1 - Math.min(noonDistance, midnightDistance) * 4);
}

/** Generates a radial gradient with sine-eased opacity falloff. */
function createRadialGlow(
  x: number,
  y: number,
  radius: number,
  peakOpacity: number,
  steps = 8,
): string {
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const eased = Math.sin((t * Math.PI) / 2);
    const opacity = peakOpacity * (1 - eased);
    return `rgba(255,255,255,${opacity.toFixed(4)}) ${(t * 100).toFixed(1)}%`;
  });
  return `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${stops.join(", ")})`;
}

// =============================================================================
// Hooks
// =============================================================================

interface GlowState {
  x: number;
  y: number;
  intensity: number;
}

/**
 * Tracks mouse position relative to a target element with distance-based intensity falloff.
 * Uses passive listeners (Rule 4.2) and RAF throttling (Rule 5.12) to minimize performance impact.
 */
function useGlowTracking(
  containerRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
): GlowState {
  const [glowState, setGlowState] = useState<GlowState>({ x: 0, y: 0, intensity: 0 });
  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<GlowState | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const flushUpdate = () => {
      if (pendingUpdateRef.current) {
        setGlowState(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = targetRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();

      // Clamp cursor position to card bounds for glow position
      const clampedX = Math.max(rect.left, Math.min(e.clientX, rect.right));
      const clampedY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));

      // Calculate distance from card edges
      const distanceX =
        e.clientX < rect.left
          ? rect.left - e.clientX
          : e.clientX > rect.right
            ? e.clientX - rect.right
            : 0;
      const distanceY =
        e.clientY < rect.top
          ? rect.top - e.clientY
          : e.clientY > rect.bottom
            ? e.clientY - rect.bottom
            : 0;

      const distance = Math.hypot(distanceX, distanceY);
      const intensity = Math.max(0, 1 - distance / GLOW_MAX_DISTANCE);

      // Batch updates to next animation frame (Rule 5.12)
      pendingUpdateRef.current = {
        x: clampedX - rect.left,
        y: clampedY - rect.top,
        intensity,
      };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flushUpdate);
      }
    };

    const handleMouseLeave = () => {
      // Cancel pending RAF and update immediately for responsiveness
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingUpdateRef.current = null;
      setGlowState((prev) => ({ ...prev, intensity: 0 }));
    };

    // Use passive listeners since we don't call preventDefault() (Rule 4.2)
    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, targetRef]);

  return glowState;
}

interface Dimensions {
  width: number;
  height: number;
}

/** Tracks element dimensions via ResizeObserver. */
function useElementDimensions(ref: React.RefObject<HTMLElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, [ref]);

  useEffect(() => {
    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [updateDimensions, ref]);

  return dimensions;
}

/** Derives theme from time of day and weather condition. */
function useWeatherTheme(timeOfDay: number, condition: WeatherCondition): WeatherTheme {
  const [theme, setTheme] = useState<WeatherTheme>("dark");

  useEffect(() => {
    const brightness = getSceneBrightnessFromTimeOfDay(timeOfDay, condition);
    const newTheme = getWeatherTheme(brightness, theme);
    if (newTheme !== theme) {
      setTheme(newTheme);
    }
  }, [timeOfDay, condition, theme]);

  return theme;
}

/** Consolidates all theme-derived style values. */
function useThemeStyles(theme: WeatherTheme, timeOfDay: number) {
  return useMemo(() => {
    const isDark = theme === "dark";
    const peakIntensity = getPeakIntensity(timeOfDay);
    const midnightDistance = Math.min(timeOfDay, 1 - timeOfDay);

    // Text classes
    const text = {
      primary: isDark ? "text-white" : "text-black",
      secondary: isDark ? "text-white/80" : "text-black/80",
      muted: isDark ? "text-white/50" : "text-black/50",
      subtle: isDark ? "text-white/40" : "text-black/40",
    };

    // Glass card background
    const baseBgOpacity = 0.04;
    const baseBorderOpacity = isDark ? 0.03 : 0.15;
    const bgOpacity = baseBgOpacity * (1 - peakIntensity * 0.7);
    const borderOpacity = baseBorderOpacity + peakIntensity * 0.02;

    // Blur amount
    const baseBlur = isDark ? 2 + midnightDistance * 38 : 24;
    const blurAmount = isDark ? baseBlur : baseBlur - peakIntensity * (baseBlur - 8);

    // Text shadow for depth
    const shadowStyle = isDark
      ? "0 1px 8px rgba(0,0,0,0.3)"
      : "0 1px 8px rgba(255,255,255,0.3)";

    // Dawn text shadow for forecast readability
    const isDawn = timeOfDay > 0.1 && timeOfDay < 0.4;
    const dawnIntensity = isDawn ? 1 - Math.abs(timeOfDay - 0.25) * 4 : 0;
    const forecastTextShadow =
      dawnIntensity > 0
        ? `0 0.5px 1px rgba(0,0,0,${(dawnIntensity * 0.4).toFixed(2)})`
        : undefined;

    return {
      isDark,
      text,
      bgOpacity,
      borderOpacity,
      blurAmount,
      shadowStyle,
      forecastTextShadow,
    };
  }, [theme, timeOfDay]);
}

export interface GlassEffectParams {
  enabled?: boolean;
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  brightness?: number;
  saturation?: number;
}

export interface WeatherDataOverlayProps {
  location: string;
  condition: WeatherCondition;
  temperature: number;
  tempHigh: number;
  tempLow: number;
  humidity?: number;
  windSpeed?: number;
  visibility?: number;
  forecast?: ForecastDay[];
  unit?: TemperatureUnit;
  /**
   * Optional, pre-formatted string like "Updated 5 min ago".
   * Useful when embedding the overlay inside `WeatherWidget`.
   */
  updatedAtLabel?: string;
  /**
   * Provide either `timeOfDay` (0-1) or a `timestamp` ISO string.
   * If neither is provided, defaults to noon (0.5).
   */
  timeOfDay?: number;
  timestamp?: string;
  className?: string;
  /**
   * Glass refraction effect parameters for the forecast card.
   * When enabled, applies SVG displacement filter for realistic glass distortion.
   */
  glassParams?: GlassEffectParams;
}

export function WeatherDataOverlay({
  location,
  condition,
  temperature,
  tempHigh,
  tempLow,
  humidity,
  windSpeed,
  visibility: _visibility,
  forecast = [],
  unit = "fahrenheit",
  updatedAtLabel,
  timeOfDay: timeOfDayProp,
  timestamp,
  className,
  glassParams,
}: WeatherDataOverlayProps) {
  // Resolve time of day from prop, timestamp, or default to noon
  const timeOfDay = useMemo(() => {
    if (typeof timeOfDayProp === "number") return timeOfDayProp;
    if (typeof timestamp === "string") return getTimeOfDay(timestamp);
    return 0.5;
  }, [timeOfDayProp, timestamp]);

  // Refs for DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Custom hooks for state management
  const theme = useWeatherTheme(timeOfDay, condition);
  const cardDimensions = useElementDimensions(cardRef);
  const glowState = useGlowTracking(containerRef, cardRef);
  const styles = useThemeStyles(theme, timeOfDay);

  // Glass effect configuration
  const glassEnabled = glassParams?.enabled !== false;
  const glassStyles = useGlassStyles({
    width: cardDimensions.width,
    height: cardDimensions.height,
    depth: glassParams?.depth ?? 3,
    radius: 12,
    strength: glassParams?.strength ?? 75,
    chromaticAberration: glassParams?.chromaticAberration ?? 6,
    blur: glassParams?.blur ?? 1.5,
    brightness: glassParams?.brightness ?? 0.8,
    saturation: glassParams?.saturation ?? 1.3,
    enabled: glassEnabled,
  });

  const svgGlassActive = Boolean(glassStyles.backdropFilter);
  const unitSymbol = unit === "celsius" ? "C" : "F";
  const hasStats = humidity !== undefined || windSpeed !== undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-auto absolute inset-0 z-10 flex select-none flex-col p-4",
        className,
      )}
    >
      {/* Top-left: Location */}
      <div className="flex flex-col items-start gap-0.5">
        <h2
          className={cn("text-[15px] font-light tracking-tight", styles.text.secondary)}
          style={{
            fontFamily: '"SF Pro Display", system-ui, sans-serif',
            textShadow: styles.shadowStyle,
          }}
        >
          {location}
        </h2>
        {updatedAtLabel && (
          <p
            className={cn("text-[11px] font-light tracking-tight", styles.text.muted)}
            style={{
              fontFamily: '"SF Pro Display", system-ui, sans-serif',
              textShadow: styles.shadowStyle,
            }}
          >
            {updatedAtLabel}
          </p>
        )}
      </div>

      {/* Spacer - leaves room for celestial in top-right */}
      <div className="flex-1" />

      {/* Bottom-left: Main weather data */}
      <div className="flex flex-col gap-4">
        {/* Hero temperature */}
        <div className="flex flex-col items-start">
          <div className="relative flex items-start">
            <span
              className={cn(
                "text-[72px] font-[200] leading-none tracking-[-0.04em]",
                styles.text.primary,
              )}
              style={{
                fontFamily:
                  '"SF Pro Display", "Helvetica Neue", system-ui, sans-serif',
                fontFeatureSettings: '"tnum"',
                textShadow: styles.isDark
                  ? "0 2px 20px rgba(0,0,0,0.25)"
                  : "0 2px 20px rgba(255,255,255,0.3)",
              }}
              aria-label={`${Math.round(temperature)} degrees ${
                unit === "celsius" ? "Celsius" : "Fahrenheit"
              }`}
            >
              {Math.round(temperature)}
            </span>
            <span
              className={cn("mt-2 text-[28px] font-[200]", styles.text.muted)}
              style={{
                fontFamily: '"SF Pro Display", system-ui, sans-serif',
              }}
              aria-hidden="true"
            >
              °{unitSymbol}
            </span>
          </div>

          {/* High / Low range + Stats */}
          <div
            className="mt-2 flex items-center gap-5"
            style={{ fontFamily: '"SF Pro Display", system-ui, sans-serif' }}
          >
            {/* Temperature range with gradient bar */}
            <div className="flex items-center gap-2">
              <span
                className={cn("text-[15px] font-light tabular-nums", styles.text.secondary)}
              >
                {Math.round(tempLow)}°
              </span>
              <div
                className="h-[1.5px] w-12 rounded-full"
                style={{
                  background: styles.isDark
                    ? "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.5) 100%)"
                    : "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)",
                }}
              />
              <span
                className={cn("text-[15px] font-normal tabular-nums", styles.text.primary)}
              >
                {Math.round(tempHigh)}°
              </span>
            </div>

            {hasStats && (
              <>
                <div
                  className={cn("h-3 w-px", styles.isDark ? "bg-white/10" : "bg-black/10")}
                />

                <div className="flex items-center gap-4">
                  {humidity !== undefined && (
                    <div className="flex items-center gap-1">
                      <Droplets
                        className={cn("size-3", styles.text.subtle)}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span
                        className={cn("text-[12px] font-light tabular-nums", styles.text.muted)}
                      >
                        {Math.round(humidity)}%
                      </span>
                    </div>
                  )}
                  {windSpeed !== undefined && (
                    <div className="flex items-center gap-1">
                      <Wind
                        className={cn("size-3", styles.text.subtle)}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span
                        className={cn("text-[12px] font-light tabular-nums", styles.text.muted)}
                      >
                        {Math.round(windSpeed)} mph
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Forecast strip - hidden at small container sizes */}
        {forecast.length > 0 && (
          <div ref={cardRef} className="relative hidden @[280px]/weather:block">
            {/* Edge shine - outside overflow-hidden so it aligns with border */}
            <div
              className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-300 ease-out"
              style={{
                opacity: glowState.intensity,
                background: createRadialGlow(
                  glowState.x,
                  glowState.y,
                  100,
                  styles.isDark ? 0.6 : 1,
                ),
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
            <div
              className="relative overflow-hidden rounded-xl border p-3"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${styles.bgOpacity})`,
                borderColor: `rgba(255, 255, 255, ${styles.borderOpacity})`,
                // Apply SVG glass effect when supported, fall back to simple blur
                ...(svgGlassActive
                  ? glassStyles
                  : {
                      backdropFilter: `blur(${styles.blurAmount}px)`,
                      WebkitBackdropFilter: `blur(${styles.blurAmount}px)`,
                    }),
              }}
            >
              {/* Inner glow */}
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out mix-blend-color-dodge"
                style={{
                  opacity: glowState.intensity,
                  background: createRadialGlow(
                    glowState.x,
                    glowState.y,
                    120,
                    styles.isDark ? 0.06 : 0.15,
                  ),
                }}
              />
              <div className="relative flex items-center justify-between">
                {forecast.slice(0, 5).map((day, index) => {
                  const DayIcon = CONDITION_ICONS[day.condition];
                  return (
                    <div
                      key={day.day}
                      className={cn(
                        "flex flex-1 flex-col items-center gap-0.5 py-0.5",
                        index === 0 ? "opacity-100" : "opacity-60",
                      )}
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        textShadow: styles.forecastTextShadow,
                      }}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-medium uppercase tracking-[0.1em]",
                          styles.text.muted,
                        )}
                      >
                        {index === 0 ? "Now" : day.day}
                      </span>
                      <DayIcon
                        className={cn("my-0.5 size-5", styles.text.secondary)}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <div className="flex flex-col items-center leading-tight">
                        <span
                          className={cn(
                            "text-[14px] font-normal tabular-nums",
                            styles.text.primary,
                          )}
                        >
                          {Math.round(day.tempMax)}°
                        </span>
                        <span
                          className={cn(
                            "text-[12px] font-light tabular-nums",
                            styles.text.subtle,
                          )}
                        >
                          {Math.round(day.tempMin)}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

