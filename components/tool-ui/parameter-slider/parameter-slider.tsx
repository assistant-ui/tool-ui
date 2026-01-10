"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ParameterSliderProps, SliderConfig, SliderValue } from "./schema";
import { ActionButtons, normalizeActionsConfig } from "../shared";
import type { Action } from "../shared";
import { cn } from "./_adapter";

function formatSignedValue(
  value: number,
  min: number,
  max: number,
  precision?: number,
  unit?: string,
): string {
  const crossesZero = min < 0 && max > 0;
  const fixed =
    precision !== undefined ? value.toFixed(precision) : String(value);
  const numericPart = crossesZero && value >= 0 ? `+${fixed}` : fixed;
  return unit ? `${numericPart} ${unit}` : numericPart;
}

function getAriaValueText(
  value: number,
  min: number,
  max: number,
  unit?: string,
): string {
  const crossesZero = min < 0 && max > 0;
  if (crossesZero) {
    if (value > 0) {
      return unit ? `plus ${value} ${unit}` : `plus ${value}`;
    } else if (value < 0) {
      return unit
        ? `minus ${Math.abs(value)} ${unit}`
        : `minus ${Math.abs(value)}`;
    }
  }
  return unit ? `${value} ${unit}` : String(value);
}

const TICK_COUNT = 16;
const TEXT_PADDING_X = -16;
const TEXT_PADDING_Y = -2;
const DETECTION_MARGIN_X = 20;
const DETECTION_MARGIN_Y = 12;
const TRACK_HEIGHT = 48;
const TEXT_RELEASE_INSET = 8;

function signedDistanceToRoundedRect(
  px: number,
  py: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  radius: number,
): number {
  const innerLeft = left + radius;
  const innerRight = right - radius;
  const innerTop = top + radius;
  const innerBottom = bottom - radius;

  const inCornerX = px < innerLeft || px > innerRight;
  const inCornerY = py < innerTop || py > innerBottom;

  if (inCornerX && inCornerY) {
    const cornerX = px < innerLeft ? innerLeft : innerRight;
    const cornerY = py < innerTop ? innerTop : innerBottom;
    const distToCornerCenter = Math.hypot(px - cornerX, py - cornerY);
    return distToCornerCenter - radius;
  }

  const dx = Math.max(left - px, px - right, 0);
  const dy = Math.max(top - py, py - bottom, 0);

  if (dx === 0 && dy === 0) {
    return -Math.min(px - left, right - px, py - top, bottom - py);
  }

  return Math.max(dx, dy);
}

function calculateGap(
  thumbCenterX: number,
  textRect: { left: number; right: number; height: number; centerY: number },
): number {
  const { left, right, height, centerY } = textRect;
  const paddingX = TEXT_PADDING_X;
  const paddingY = TEXT_PADDING_Y;
  const marginX = DETECTION_MARGIN_X;
  const marginY = DETECTION_MARGIN_Y;
  const thumbCenterY = centerY;

  // Inner boundary (where max gap occurs)
  const innerLeft = left - paddingX;
  const innerRight = right + paddingX;
  const innerTop = centerY - height / 2 - paddingY;
  const innerBottom = centerY + height / 2 + paddingY;
  const innerHeight = height + paddingY * 2;
  const innerRadius = innerHeight / 2;

  // Outer boundary (where effect starts) - proportionally larger
  const outerLeft = left - paddingX - marginX;
  const outerRight = right + paddingX + marginX;
  const outerTop = centerY - height / 2 - paddingY - marginY;
  const outerBottom = centerY + height / 2 + paddingY + marginY;
  const outerHeight = height + paddingY * 2 + marginY * 2;
  const outerRadius = outerHeight / 2;

  const outerDist = signedDistanceToRoundedRect(
    thumbCenterX,
    thumbCenterY,
    outerLeft,
    outerRight,
    outerTop,
    outerBottom,
    outerRadius,
  );

  // Outside outer boundary - no gap
  if (outerDist > 0) return 0;

  const innerDist = signedDistanceToRoundedRect(
    thumbCenterX,
    thumbCenterY,
    innerLeft,
    innerRight,
    innerTop,
    innerBottom,
    innerRadius,
  );

  // Inside inner boundary - max gap
  const maxGap = height + paddingY * 2;
  if (innerDist <= 0) return maxGap;

  // Between boundaries - linear interpolation
  // outerDist is negative (inside outer), innerDist is positive (outside inner)
  const totalDist = Math.abs(outerDist) + innerDist;
  const t = Math.abs(outerDist) / totalDist;

  return maxGap * t;
}

interface SliderRowProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function SliderRow({ config, value, onChange, disabled }: SliderRowProps) {
  const { id, label, min, max, step = 1, unit, precision } = config;
  const crossesZero = min < 0 && max > 0;
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const trackRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const [dragGap, setDragGap] = useState(0);
  const [fullGap, setFullGap] = useState(0);
  const [intersectsText, setIntersectsText] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handlePointerUp = () => setIsDragging(false);
    document.addEventListener("pointerup", handlePointerUp);
    return () => document.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const labelEl = labelRef.current;
    const valueEl = valueRef.current;

    if (!track || !labelEl || !valueEl) return;

    const trackRect = track.getBoundingClientRect();
    const labelRect = labelEl.getBoundingClientRect();
    const valueRect = valueEl.getBoundingClientRect();

    const trackWidth = trackRect.width;
    const valuePercent = ((value - min) / (max - min)) * 100;
    const thumbCenterPx = (valuePercent / 100) * trackWidth;
    const thumbHalfWidth = 6;

    const trackCenterY = TRACK_HEIGHT / 2;

    const labelGap = calculateGap(thumbCenterPx, {
      left: labelRect.left - trackRect.left,
      right: labelRect.right - trackRect.left,
      height: labelRect.height,
      centerY: trackCenterY,
    });

    const valueGap = calculateGap(thumbCenterPx, {
      left: valueRect.left - trackRect.left,
      right: valueRect.right - trackRect.left,
      height: valueRect.height,
      centerY: trackCenterY,
    });

    setDragGap(Math.max(labelGap, valueGap));

    // Tight intersection check for release state
    // Inset by px-2 (8px) padding to check against actual text, not padded container
    const labelLeft = labelRect.left - trackRect.left + TEXT_RELEASE_INSET;
    const labelRight = labelRect.right - trackRect.left - TEXT_RELEASE_INSET;
    const valueLeft = valueRect.left - trackRect.left + TEXT_RELEASE_INSET;
    const valueRight = valueRect.right - trackRect.left - TEXT_RELEASE_INSET;

    const thumbLeft = thumbCenterPx - thumbHalfWidth;
    const thumbRight = thumbCenterPx + thumbHalfWidth;

    const hitsLabel = thumbRight > labelLeft && thumbLeft < labelRight;
    const hitsValue = thumbRight > valueLeft && thumbLeft < valueRight;

    setIntersectsText(hitsLabel || hitsValue);

    // Calculate full separation gap for release state
    // Use the max gap of whichever text element(s) the handle intersects
    const labelFullGap = labelRect.height + TEXT_PADDING_Y * 2;
    const valueFullGap = valueRect.height + TEXT_PADDING_Y * 2;
    const releaseGap =
      hitsLabel && hitsValue
        ? Math.max(labelFullGap, valueFullGap)
        : hitsLabel
          ? labelFullGap
          : hitsValue
            ? valueFullGap
            : 0;
    setFullGap(releaseGap);
  }, [value, min, max]);

  // While dragging: gradual separation based on distance
  // On release: fully open if intersecting text, fully closed otherwise
  const gap = isDragging ? dragGap : intersectsText ? fullGap : 0;

  const ticks = useMemo(() => {
    // Generate equidistant ticks regardless of step value
    const majorTickCount = TICK_COUNT;
    const result: { percent: number; isCenter: boolean; isSubtick: boolean }[] =
      [];

    for (let i = 0; i <= majorTickCount; i++) {
      const percent = (i / majorTickCount) * 100;
      const isCenter = !crossesZero && percent === 50;

      // Skip the center tick (50%) for crossesZero sliders
      if (crossesZero && percent === 50) continue;

      // Add subtick at midpoint before this tick (except for first)
      if (i > 0) {
        const prevPercent = ((i - 1) / majorTickCount) * 100;
        // Don't add subtick if it would be at 50% for crossesZero
        const midPercent = (prevPercent + percent) / 2;
        if (!(crossesZero && midPercent === 50)) {
          result.push({ percent: midPercent, isCenter: false, isSubtick: true });
        }
      }

      result.push({ percent, isCenter, isSubtick: false });
    }

    return result;
  }, [crossesZero]);

  const zeroPercent = crossesZero ? ((0 - min) / (max - min)) * 100 : 0;
  const valuePercent = ((value - min) / (max - min)) * 100;

  const HANDLE_HALF_WIDTH = 2; // half of visual w-1 pill (4px)

  const fillClipPath = useMemo(() => {
    if (crossesZero) {
      if (valuePercent >= zeroPercent) {
        // Positive: reveal from zeroPercent to right edge of handle
        return `inset(0 calc(${100 - valuePercent}% - ${HANDLE_HALF_WIDTH}px) 0 ${zeroPercent}%)`;
      } else {
        // Negative: reveal from left edge of handle to zeroPercent
        return `inset(0 ${100 - zeroPercent}% 0 calc(${valuePercent}% - ${HANDLE_HALF_WIDTH}px))`;
      }
    }
    // Non-crossesZero: reveal from 0 to right edge of handle
    return `inset(0 calc(${100 - valuePercent}% - ${HANDLE_HALF_WIDTH}px) 0 0)`;
  }, [crossesZero, zeroPercent, valuePercent]);

  const fillMaskImage = crossesZero
    ? "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)"
    : "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)";

  // Metallic reflection gradient that follows the handle position
  // Unified gradient with consistent appearance - only opacity changes
  // Visible while dragging OR when resting at edges (0%/100%)
  const reflectionStyle = useMemo(() => {
    const handlePos = valuePercent;
    const spread = 10; // Consistent spread for all states

    const start = Math.max(0, handlePos - spread);
    const end = Math.min(100, handlePos + spread);

    const gradient = `linear-gradient(to right,
      transparent ${start}%,
      white ${handlePos}%,
      transparent ${end}%)`;

    return {
      background: gradient,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      padding: '1px',
    };
  }, [valuePercent]);

  // Opacity scales with handle size: rest → hover → drag
  const reflectionOpacity = useMemo(() => {
    const edgeThreshold = 3;
    const atEdge = valuePercent <= edgeThreshold || valuePercent >= 100 - edgeThreshold;

    if (isDragging || atEdge) {
      return 0.4;
    }
    if (isHovered) {
      return 0.2;
    }
    return 0;
  }, [valuePercent, isDragging, isHovered]);

  const handleValueChange = useCallback(
    (values: number[]) => {
      if (values[0] !== undefined) {
        onChange(values[0]);
      }
    },
    [onChange],
  );

  return (
    <div className="py-2">
      <SliderPrimitive.Root
        id={id}
        className={cn(
          "group/slider relative flex w-full touch-none items-center select-none",
          "h-12",
          disabled && "pointer-events-none opacity-50",
        )}
        value={[value]}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-valuetext={getAriaValueText(value, min, max, unit)}
      >
        <SliderPrimitive.Track
          ref={trackRef}
          className={cn(
            "squircle relative h-12 w-full grow overflow-hidden rounded-sm",
            "bg-muted ring-border ring-1 ring-inset",
            "dark:bg-black/40 dark:ring-white/10",
          )}
        >
          <div
            className="bg-primary/30 dark:bg-primary/40 absolute inset-0"
            style={{
              maskImage: fillMaskImage,
              WebkitMaskImage: fillMaskImage,
              clipPath: fillClipPath,
            }}
          />

          {ticks.map((tick, i) => {
            const isEdge =
              !tick.isSubtick && (tick.percent === 0 || tick.percent === 100);
            return (
              <span
                key={i}
                className={cn(
                  "pointer-events-none absolute bottom-px w-px",
                  tick.isSubtick ? "h-1.5" : "h-2",
                  isEdge
                    ? "bg-transparent"
                    : tick.isSubtick
                      ? "bg-foreground/8 dark:bg-white/5"
                      : tick.isCenter
                        ? "bg-foreground/30 dark:bg-white/25"
                        : "bg-foreground/15 dark:bg-white/8",
                )}
                style={{ left: `${tick.percent}%` }}
              />
            );
          })}
        </SliderPrimitive.Track>

        {/* Metallic reflection overlay - follows handle, brightness scales with interaction */}
        <div
          className="pointer-events-none absolute inset-0 rounded-sm squircle transition-[opacity] duration-200 ease-[var(--cubic-ease-in-out)]"
          style={{
            ...reflectionStyle,
            opacity: reflectionOpacity,
            filter: 'blur(1px)',
          }}
        />

        <SliderPrimitive.Thumb
          style={{ left: `${valuePercent}%`, transform: "translateX(-50%)" }}
          className={cn(
            "group/thumb z-0 block w-3 shrink-0 cursor-grab rounded-sm",
            "relative bg-transparent outline-none",
            "transition-[height,opacity] duration-150 ease-[var(--cubic-ease-in-out)]",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-1",
            "active:cursor-grabbing",
            "disabled:pointer-events-none disabled:opacity-50",
            // Height morphs: rest (track height) → hover → active
            isDragging ? "h-[56px]" : isHovered ? "h-[54px]" : "h-12",
          )}
        >
          {(() => {
            // Calculate morph state
            const isActive = isHovered || isDragging;

            // Offset to align with fill edge - same position for both rest and active states
            // This prevents horizontal jitter when transitioning between states
            const fillEdgeOffset = crossesZero && valuePercent < zeroPercent
              ? -HANDLE_HALF_WIDTH  // Negative fill: edge is to the left
              : HANDLE_HALF_WIDTH;   // Positive fill: edge is to the right

            // Hide rest-state indicator at edges (0% or 100%) - the reflection gradient handles this
            const edgeThreshold = 3;
            const atEdge = valuePercent <= edgeThreshold || valuePercent >= 100 - edgeThreshold;
            const restOpacity = atEdge ? 0 : 0.25;

            return (
              <>
                <span
                  className={cn(
                    "bg-primary absolute top-0 left-1/2",
                    "transition-all duration-150 ease-[var(--cubic-ease-in-out)]",
                    isActive
                      ? gap > 0 ? "rounded-full" : "rounded-t-full"
                      : "rounded-t-sm",
                    isDragging ? "w-2" : isActive ? "w-1.5" : "w-px",
                  )}
                  style={{
                    transform: `translateX(calc(-50% + ${fillEdgeOffset}px))`,
                    height: isActive && gap > 0 ? `calc(50% - ${gap / 2}px)` : "50%",
                    opacity: isActive ? 1 : restOpacity,
                  }}
                />
                <span
                  className={cn(
                    "bg-primary absolute bottom-0 left-1/2",
                    "transition-all duration-150 ease-[var(--cubic-ease-in-out)]",
                    isActive
                      ? gap > 0 ? "rounded-full" : "rounded-b-full"
                      : "rounded-b-sm",
                    isDragging ? "w-2" : isActive ? "w-1.5" : "w-px",
                  )}
                  style={{
                    transform: `translateX(calc(-50% + ${fillEdgeOffset}px))`,
                    height: isActive && gap > 0 ? `calc(50% - ${gap / 2}px)` : "50%",
                    opacity: isActive ? 1 : restOpacity,
                  }}
                />
              </>
            );
          })()}
        </SliderPrimitive.Thumb>

        <div className="pointer-events-none absolute inset-x-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between">
          <span
            ref={labelRef}
            className="text-primary -mt-0.5 rounded-full px-2 py-px text-sm font-normal tracking-wide [text-shadow:0.5px_0.5px_0_rgba(0,0,0,0.35)]"
          >
            {label}
          </span>
          <span
            ref={valueRef}
            className="text-foreground -mt-px -mb-0.5 flex h-6 items-center rounded-full px-2 font-mono text-xs tabular-nums [text-shadow:0.5px_0.5px_0_rgba(0,0,0,0.35)]"
          >
            {formatSignedValue(value, min, max, precision, unit)}
          </span>
        </div>
      </SliderPrimitive.Root>
    </div>
  );
}

export function ParameterSlider({
  id,
  sliders,
  values: controlledValues,
  onChange,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  className,
  isLoading,
}: ParameterSliderProps) {
  const initialValuesRef = useRef<SliderValue[]>(
    sliders.map((s) => ({ id: s.id, value: s.value })),
  );

  const [uncontrolledValues, setUncontrolledValues] = useState<SliderValue[]>(
    () => sliders.map((s) => ({ id: s.id, value: s.value })),
  );

  const currentValues = controlledValues ?? uncontrolledValues;

  const valueMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of currentValues) {
      map.set(v.id, v.value);
    }
    return map;
  }, [currentValues]);

  const updateValue = useCallback(
    (sliderId: string, newValue: number) => {
      const next = currentValues.map((v) =>
        v.id === sliderId ? { ...v, value: newValue } : v,
      );
      if (controlledValues === undefined) {
        setUncontrolledValues(next);
      }
      onChange?.(next);
    },
    [currentValues, controlledValues, onChange],
  );

  const handleReset = useCallback(() => {
    const initial = initialValuesRef.current;
    if (controlledValues === undefined) {
      setUncontrolledValues(initial);
    }
    onChange?.(initial);
  }, [controlledValues, onChange]);

  const handleAction = useCallback(
    async (actionId: string) => {
      if (actionId === "reset") {
        handleReset();
        return;
      }
      await onResponseAction?.(actionId, currentValues);
    },
    [handleReset, onResponseAction, currentValues],
  );

  const normalizedActions = useMemo(() => {
    const normalized = normalizeActionsConfig(responseActions);
    if (normalized) return normalized;
    return {
      items: [
        { id: "reset", label: "Reset", variant: "ghost" as const },
        { id: "apply", label: "Apply", variant: "default" as const },
      ],
      align: "right" as const,
    };
  }, [responseActions]);

  const actionsWithState = useMemo((): Action[] => {
    return normalizedActions.items.map((action) => ({
      ...action,
      loading: action.id === "apply" && isLoading,
      disabled: action.disabled || isLoading,
    }));
  }, [normalizedActions.items, isLoading]);

  return (
    <article
      className={cn(
        "@container/parameter-slider flex w-full max-w-md min-w-80 flex-col gap-3",
        "text-foreground",
        className,
      )}
      data-slot="parameter-slider"
      data-tool-ui-id={id}
      aria-busy={isLoading}
    >
      <div
        className={cn(
          "bg-card flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-3 shadow-xs",
        )}
      >
        {sliders.map((slider) => (
          <SliderRow
            key={slider.id}
            config={slider}
            value={valueMap.get(slider.id) ?? slider.value}
            onChange={(v) => updateValue(slider.id, v)}
            disabled={isLoading}
          />
        ))}
      </div>

      <div className="@container/actions">
        <ActionButtons
          actions={actionsWithState}
          align={normalizedActions.align}
          confirmTimeout={normalizedActions.confirmTimeout}
          onAction={handleAction}
          onBeforeAction={onBeforeResponseAction}
        />
      </div>
    </article>
  );
}

export function ParameterSliderProgress({ className }: { className?: string }) {
  return (
    <div
      data-slot="parameter-slider-progress"
      aria-busy={true}
      className={cn("flex w-full max-w-md min-w-80 flex-col gap-3", className)}
    >
      <div className="bg-card flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-3 shadow-xs">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-2">
            <div className="bg-muted/60 ring-border/50 relative h-12 w-full animate-pulse rounded-md ring-1 ring-inset">
              <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
                <div className="bg-muted-foreground/20 h-3.5 w-16 rounded" />
                <div className="bg-muted-foreground/20 h-3.5 w-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <div className="bg-muted h-9 w-16 animate-pulse rounded-full" />
        <div className="bg-muted h-9 w-16 animate-pulse rounded-full" />
      </div>
    </div>
  );
}
