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

const TICK_COUNT = 17;
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
    const labelLeft = (labelRect.left - trackRect.left) + TEXT_RELEASE_INSET;
    const labelRight = (labelRect.right - trackRect.left) - TEXT_RELEASE_INSET;
    const valueLeft = (valueRect.left - trackRect.left) + TEXT_RELEASE_INSET;
    const valueRight = (valueRect.right - trackRect.left) - TEXT_RELEASE_INSET;

    const thumbLeft = thumbCenterPx - thumbHalfWidth;
    const thumbRight = thumbCenterPx + thumbHalfWidth;

    const hitsLabel = thumbRight > labelLeft && thumbLeft < labelRight;
    const hitsValue = thumbRight > valueLeft && thumbLeft < valueRight;

    setIntersectsText(hitsLabel || hitsValue);

    // Calculate full separation gap for release state
    // Use the max gap of whichever text element(s) the handle intersects
    const labelFullGap = labelRect.height + TEXT_PADDING_Y * 2;
    const valueFullGap = valueRect.height + TEXT_PADDING_Y * 2;
    const releaseGap = hitsLabel && hitsValue
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
  const gap = isDragging ? dragGap : (intersectsText ? fullGap : 0);

  const ticks = useMemo(() => {
    const range = max - min;
    const stepCount = Math.round(range / step) + 1;

    // If too many steps, show every Nth tick to stay around TICK_COUNT
    const skipFactor =
      stepCount > TICK_COUNT ? Math.ceil(stepCount / TICK_COUNT) : 1;

    const result: { percent: number; isZero: boolean; isSubtick: boolean }[] = [];
    let lastPercent: number | null = null;

    for (let i = 0; i < stepCount; i++) {
      if (i % skipFactor !== 0 && i !== stepCount - 1) continue;

      const tickValue = min + i * step;
      const percent = ((tickValue - min) / range) * 100;
      const isZero = crossesZero && Math.abs(tickValue) < step * 0.5;

      // Add subtick at midpoint between this tick and the previous one
      if (lastPercent !== null) {
        const midPercent = (lastPercent + percent) / 2;
        result.push({ percent: midPercent, isZero: false, isSubtick: true });
      }

      result.push({ percent, isZero, isSubtick: false });
      lastPercent = percent;
    }
    return result;
  }, [min, max, step, crossesZero]);

  const zeroPercent = crossesZero ? ((0 - min) / (max - min)) * 100 : 0;
  const valuePercent = ((value - min) / (max - min)) * 100;

  const rangeStyle = useMemo(() => {
    if (crossesZero) {
      const left = Math.min(zeroPercent, valuePercent);
      const width = Math.abs(valuePercent - zeroPercent);
      return { left: `${left}%`, width: `${width}%` };
    }
    return { left: "0%", width: `${valuePercent}%` };
  }, [crossesZero, zeroPercent, valuePercent]);

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
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-valuetext={getAriaValueText(value, min, max, unit)}
      >
        <SliderPrimitive.Track
          ref={trackRef}
          className={cn(
            "relative h-12 w-full grow overflow-hidden rounded",
            "bg-muted ring-border ring-1 ring-inset",
            "dark:bg-black/40 dark:ring-white/10",
          )}
        >
          <div
            className="bg-primary/30 dark:bg-primary/40 absolute inset-0"
            style={{
              maskImage: crossesZero
                ? "linear-gradient(to right, rgba(0,0,0,0.4) 0%, black 50%, rgba(0,0,0,0.4) 100%)"
                : "linear-gradient(to right, black 0%, rgba(0,0,0,0.4) 100%)",
              WebkitMaskImage: crossesZero
                ? "linear-gradient(to right, rgba(0,0,0,0.4) 0%, black 50%, rgba(0,0,0,0.4) 100%)"
                : "linear-gradient(to right, black 0%, rgba(0,0,0,0.4) 100%)",
              clipPath: `inset(0 ${100 - parseFloat(rangeStyle.width || "0") - parseFloat(rangeStyle.left || "0")}% 0 ${parseFloat(rangeStyle.left || "0")}%)`,
            }}
          />

          {ticks.map((tick, i) => {
            const isEdge = !tick.isSubtick && (i === 0 || i === ticks.length - 1);
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
                      : tick.isZero
                        ? "bg-foreground/30 dark:bg-white/25"
                        : "bg-foreground/15 dark:bg-white/8",
                )}
                style={{ left: `${tick.percent}%` }}
              />
            );
          })}
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          style={{ left: `${valuePercent}%`, transform: "translateX(-50%)" }}
          className={cn(
            "group/thumb z-0 block h-[50px] w-3 shrink-0 cursor-grab rounded-sm",
            "relative bg-transparent",
            "transition-all duration-150 ease-[var(--cubic-ease-in-out)]",
            "hover:h-[54px]",
            "focus-visible:outline-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1",
            "active:cursor-grabbing",
            "active:h-[56px]",
            "disabled:pointer-events-none disabled:opacity-50",
            isDragging && "h-[56px]",
          )}
        >
          <span
            className={cn(
              "bg-primary absolute top-0 left-1/2 w-1 -translate-x-1/2 rounded-full",
              "transition-all duration-150 ease-[var(--cubic-ease-in-out)]",
              "group-hover/thumb:w-1.5",
              "group-active/thumb:w-2",
              isDragging && "w-2",
            )}
            style={{
              height: gap > 0 ? `calc(50% - ${gap / 2}px)` : "calc(50% + 3px)",
            }}
          />
          <span
            className={cn(
              "bg-primary absolute bottom-0 left-1/2 w-1 -translate-x-1/2 rounded-full",
              "transition-all duration-150 ease-[var(--cubic-ease-in-out)]",
              "group-hover/thumb:w-1.5",
              "group-active/thumb:w-2",
              isDragging && "w-2",
            )}
            style={{
              height: gap > 0 ? `calc(50% - ${gap / 2}px)` : "calc(50% + 3px)",
            }}
          />
        </SliderPrimitive.Thumb>

        <div className="pointer-events-none absolute inset-x-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between">
          <span
            ref={labelRef}
            className="text-primary rounded-full px-2 py-px text-sm font-medium"
          >
            {label}
          </span>
          <span
            ref={valueRef}
            className="text-foreground rounded-full px-2 py-px font-mono text-sm tabular-nums"
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
