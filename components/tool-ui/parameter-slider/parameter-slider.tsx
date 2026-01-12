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
import {
  generateHourglassClipPath,
  calculateGap,
  type HitboxConfig,
} from "./geometry";

// ─────────────────────────────────────────────────────────────────────────────
// Layout Constants
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_HEIGHT = 48;
const TRACK_EDGE_INSET = 4;
const TEXT_VERTICAL_OFFSET = 0.5;
const TEXT_RELEASE_INSET = 8;
const TICK_COUNT = 16;

// ─────────────────────────────────────────────────────────────────────────────
// Text Hitbox Configuration
// ─────────────────────────────────────────────────────────────────────────────

const HITBOX_CONFIG: HitboxConfig = {
  paddingX: 4,
  paddingXOuter: 0,
  paddingY: 2,
  marginX: 12,
  marginXOuter: 4,
  marginY: 12,
  outerEdgeRadiusFactor: 0.3,
};

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Utilities
// ─────────────────────────────────────────────────────────────────────────────

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

function toInsetPosition(percent: number): string {
  return `calc(${TRACK_EDGE_INSET}px + (100% - ${TRACK_EDGE_INSET * 2}px) * ${percent / 100})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hourglass Handle
// ─────────────────────────────────────────────────────────────────────────────

interface HourglassHandleProps {
  valuePercent: number;
  gap: number;
  isHovered: boolean;
  isDragging: boolean;
  className?: string;
}

const EDGE_THRESHOLD = 3;
const MAX_GAP = 20;
const WAIST_Y = 49;

function HourglassHandle({
  valuePercent,
  gap,
  isHovered,
  isDragging,
  className,
}: HourglassHandleProps) {
  const isActive = isHovered || isDragging;
  const atEdge =
    valuePercent <= EDGE_THRESHOLD || valuePercent >= 100 - EDGE_THRESHOLD;
  const restOpacity = atEdge ? 0 : 0.25;
  const pinch = isActive ? Math.min(1, gap / MAX_GAP) : 0;
  const clipPath = generateHourglassClipPath(pinch, WAIST_Y);

  return (
    <span
      className={cn(
        "absolute top-0 left-1/2 h-full",
        isActive
          ? "transition-[clip-path,width,opacity] duration-100 ease-out"
          : "transition-[clip-path,width,opacity] duration-150 ease-out",
        className ?? "bg-primary",
      )}
      style={{
        clipPath,
        width: isDragging ? 8 : isActive ? 6 : 1,
        transform: "translateX(-50%)",
        opacity: isActive ? 1 : restOpacity,
      }}
    />
  );
}

interface SliderRowProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  trackClassName?: string;
  fillClassName?: string;
  handleClassName?: string;
}

function SliderRow({ config, value, onChange, disabled, trackClassName, fillClassName, handleClassName }: SliderRowProps) {
  const { id, label, min, max, step = 1, unit, precision } = config;
  // Per-slider theming overrides component-level theming
  const resolvedTrackClassName = config.trackClassName ?? trackClassName;
  const resolvedFillClassName = config.fillClassName ?? fillClassName;
  const resolvedHandleClassName = config.handleClassName ?? handleClassName;
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
    const thumbCenterPx = TRACK_EDGE_INSET + ((trackWidth - TRACK_EDGE_INSET * 2) * valuePercent / 100);
    const thumbHalfWidth = 6;

    const trackCenterY = TRACK_HEIGHT / 2 - TEXT_VERTICAL_OFFSET;

    const labelGap = calculateGap(
      thumbCenterPx,
      {
        left: labelRect.left - trackRect.left,
        right: labelRect.right - trackRect.left,
        height: labelRect.height,
        centerY: trackCenterY,
      },
      true,
      HITBOX_CONFIG,
    );

    const valueGap = calculateGap(
      thumbCenterPx,
      {
        left: valueRect.left - trackRect.left,
        right: valueRect.right - trackRect.left,
        height: valueRect.height,
        centerY: trackCenterY,
      },
      false,
      HITBOX_CONFIG,
    );

    setDragGap(Math.max(labelGap, valueGap));

    const labelLeft = labelRect.left - trackRect.left + TEXT_RELEASE_INSET;
    const labelRight = labelRect.right - trackRect.left - TEXT_RELEASE_INSET;
    const valueLeft = valueRect.left - trackRect.left + TEXT_RELEASE_INSET;
    const valueRight = valueRect.right - trackRect.left - TEXT_RELEASE_INSET;

    const thumbLeft = thumbCenterPx - thumbHalfWidth;
    const thumbRight = thumbCenterPx + thumbHalfWidth;

    const hitsLabel = thumbRight > labelLeft && thumbLeft < labelRight;
    const hitsValue = thumbRight > valueLeft && thumbLeft < valueRight;

    setIntersectsText(hitsLabel || hitsValue);

    const labelFullGap = labelRect.height + HITBOX_CONFIG.paddingY * 2;
    const valueFullGap = valueRect.height + HITBOX_CONFIG.paddingY * 2;
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

  // Gap drives the hourglass pinch: more gap = more pinch
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

  // Fill clip-path - uses same inset coordinate system as thumb and ticks
  // At terminal values (0% or 100%), extend fill all the way to the edge
  const fillClipPath = useMemo(() => {
    // Convert percentage to inset position for clip-path
    // Clip from right = 100% - insetPosition(valuePercent)
    const toClipFromRight = (percent: number) => {
      if (percent >= 100) return '0'; // Extend to right edge at 100%
      return `calc(100% - ${TRACK_EDGE_INSET}px - (100% - ${TRACK_EDGE_INSET * 2}px) * ${percent / 100})`;
    };
    const toClipFromLeft = (percent: number) => {
      if (percent <= 0) return '0'; // Extend to left edge at 0%
      return `calc(${TRACK_EDGE_INSET}px + (100% - ${TRACK_EDGE_INSET * 2}px) * ${percent / 100})`;
    };

    if (crossesZero) {
      const zeroClipLeft = toClipFromLeft(zeroPercent);
      if (valuePercent >= zeroPercent) {
        return `inset(0 ${toClipFromRight(valuePercent)} 0 ${zeroClipLeft})`;
      } else {
        const zeroClipRight = toClipFromRight(zeroPercent);
        return `inset(0 ${zeroClipRight} 0 ${toClipFromLeft(valuePercent)})`;
      }
    }
    return `inset(0 ${toClipFromRight(valuePercent)} 0 0)`;
  }, [crossesZero, zeroPercent, valuePercent]);

  const fillMaskImage = crossesZero
    ? "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)"
    : "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)";

  // Metallic reflection gradient that follows the handle position
  // Visible while dragging OR when resting at edges (0%/100%)
  const reflectionStyle = useMemo(() => {
    // At terminal values, position gradient at actual edge for clean alignment
    const atLeftEdge = valuePercent <= 0;
    const atRightEdge = valuePercent >= 100;
    const edgeThreshold = 3;
    const nearEdge = valuePercent <= edgeThreshold || valuePercent >= 100 - edgeThreshold;

    // Narrower spread when stationary at edges (~35% narrower)
    const spread = nearEdge && !isDragging ? 6.5 : 10;

    // Position: at terminal values use actual edge, otherwise use inset formula
    let handlePos: number;
    if (atLeftEdge) {
      handlePos = 0;
    } else if (atRightEdge) {
      handlePos = 100;
    } else {
      // Approximate the inset: map 0-100% to ~1-99% for gradient
      const insetApprox = 1;
      handlePos = insetApprox + (100 - insetApprox * 2) * (valuePercent / 100);
    }

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
  }, [valuePercent, isDragging]);

  // Opacity scales with handle size: rest → hover → drag
  const reflectionOpacity = useMemo(() => {
    const edgeThreshold = 3;
    const atEdge = valuePercent <= edgeThreshold || valuePercent >= 100 - edgeThreshold;

    if (isDragging || atEdge) {
      return 1;
    }
    if (isHovered) {
      return 0.6;
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
            "ring-border ring-1 ring-inset",
            "dark:ring-white/10",
            resolvedTrackClassName ?? "bg-muted dark:bg-black/40",
          )}
        >
          <div
            className={cn("absolute inset-0", resolvedFillClassName ?? "bg-primary/30 dark:bg-primary/40")}
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
                style={{
                  left: toInsetPosition(tick.percent),
                  transform: "translateX(-50%)",
                }}
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
            mixBlendMode: 'overlay',
          }}
        />

        <SliderPrimitive.Thumb
          style={{
            left: toInsetPosition(valuePercent),
            transform: "translateX(-50%)",
          }}
          className={cn(
            "group/thumb z-0 block w-3 shrink-0 cursor-grab rounded-sm",
            "relative bg-transparent outline-none",
            "transition-[height,opacity] duration-150 ease-[var(--cubic-ease-in-out)]",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-1",
            "active:cursor-grabbing",
            "disabled:pointer-events-none disabled:opacity-50",
            isDragging ? "h-[56px]" : isHovered ? "h-[54px]" : "h-12",
          )}
        >
          <HourglassHandle
            valuePercent={valuePercent}
            gap={gap}
            isHovered={isHovered}
            isDragging={isDragging}
            className={resolvedHandleClassName}
          />
        </SliderPrimitive.Thumb>

        <div
          className="pointer-events-none absolute inset-x-3 top-1/2 z-10 flex items-center justify-between"
          style={{ transform: `translateY(calc(-50% - ${TEXT_VERTICAL_OFFSET}px))` }}
        >
          <span
            ref={labelRef}
            className="text-primary -mt-px rounded-full px-2 py-px text-sm font-normal tracking-wide [text-shadow:0.5px_0.5px_0_rgba(0,0,0,0.35)]"
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
  trackClassName,
  fillClassName,
  handleClassName,
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
            trackClassName={trackClassName}
            fillClassName={fillClassName}
            handleClassName={handleClassName}
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
