"use client";

import { useState, useId, useRef, useEffect, useCallback, type CSSProperties } from "react";
import { useControls, button, Leva } from "leva";
import type { StagingConfig } from "../types";
import { cn, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/tool-ui/stats-display/_adapter";
import type { StatsDisplayProps, StatItem, StatFormat, StatDiff } from "@/components/tool-ui/stats-display/schema";

interface SparklineAnimationParams {
  slideDuration: number;
  slideDistance: number;
  fadeDuration: number;
  fillFadeDuration: number;
  fillOpacity: number;
  baseStrokeOpacity: number;
  glintDuration: number;
  glintDashSize: number;
  glintGapSize: number;
  glintStrokeWidth: number;
  glintPeakOpacity: number;
  slowGlintDashSize: number;
  slowGlintGapSize: number;
  slowGlintStrokeWidth: number;
  slowGlintPeakOpacity: number;
}

interface StatCardAnimationParams {
  staggerOffset: number;
  labelDelay: number;
  labelDuration: number;
  labelSlide: number;
  valueDuration: number;
  valueDelay: number;
  valueSlide: number;
}

interface TunableSparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  showFill?: boolean;
  animation: SparklineAnimationParams;
}

function TunableSparkline({
  data,
  color = "currentColor",
  width = 64,
  height = 24,
  className,
  style,
  showFill = false,
  animation,
}: TunableSparklineProps) {
  const gradientId = useId();
  const polylineRef = useRef<SVGPolylineElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (polylineRef.current) {
      setPathLength(polylineRef.current.getTotalLength());
    }
  }, [data]);

  if (data.length < 2) {
    return null;
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  const padding = 0;
  const usableWidth = width;
  const usableHeight = height;

  const linePoints = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * usableWidth;
    const y = padding + usableHeight - ((value - minVal) / range) * usableHeight;
    return { x, y };
  });

  const linePointsString = linePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPointsString = [
    `${padding},${height}`,
    ...linePoints.map((p) => `${p.x},${p.y}`),
    `${width - padding},${height}`,
  ].join(" ");

  const animationDelay = style?.animationDelay ?? "0ms";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={cn("h-full w-full shrink-0", className)}
      style={{
        ...style,
        "--slide-duration": `${animation.slideDuration}ms`,
        "--slide-distance": `${animation.slideDistance}px`,
      } as CSSProperties}
      preserveAspectRatio="none"
    >
      {showFill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={animation.fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon
            points={areaPointsString}
            fill={`url(#${gradientId})`}
            className="animate-in fade-in fill-mode-both"
            style={{
              animationDelay,
              animationDuration: `${animation.fillFadeDuration}ms`,
              animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </>
      )}
      <polyline
        ref={polylineRef}
        points={linePointsString}
        fill="none"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={animation.baseStrokeOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {pathLength > 0 && (
        <>
          <polyline
            points={linePointsString}
            fill="none"
            stroke={color}
            strokeWidth={animation.slowGlintStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={`${animation.slowGlintDashSize} ${animation.slowGlintGapSize}`}
            strokeDashoffset={pathLength}
            style={{
              animationDelay,
              animation: `glint-slow-tunable ${animation.glintDuration}s ease-out forwards`,
            }}
          />
          <polyline
            points={linePointsString}
            fill="none"
            stroke={color}
            strokeWidth={animation.glintStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={`${animation.glintDashSize} ${animation.glintGapSize}`}
            strokeDashoffset={pathLength}
            style={{
              animationDelay,
              animation: `glint-tunable ${animation.glintDuration}s ease-out forwards`,
            }}
          />
        </>
      )}
      <style>{`
        @keyframes glint-tunable {
          0% { stroke-dashoffset: ${pathLength}; stroke-opacity: 0; }
          20% { stroke-opacity: ${animation.glintPeakOpacity}; }
          100% { stroke-dashoffset: ${-pathLength}; stroke-opacity: 0; }
        }
        @keyframes glint-slow-tunable {
          0% { stroke-dashoffset: ${pathLength}; stroke-opacity: 0; }
          20% { stroke-opacity: ${animation.slowGlintPeakOpacity}; }
          100% { stroke-dashoffset: ${-pathLength}; stroke-opacity: 0; }
        }
      `}</style>
    </svg>
  );
}

interface FormattedValueProps {
  value: string | number;
  format?: StatFormat;
  locale?: string;
}

function FormattedValue({ value, format, locale }: FormattedValueProps) {
  if (typeof value === "string" || !format) {
    return <span className="font-light tabular-nums">{String(value)}</span>;
  }

  switch (format.kind) {
    case "number": {
      const decimals = format.decimals ?? 0;
      if (format.compact) {
        const parts = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          notation: "compact",
        }).formatToParts(value);
        const fullNumber = new Intl.NumberFormat(locale).format(value);
        return (
          <span className="font-light tabular-nums" aria-label={fullNumber}>
            {parts.map((part, i) =>
              part.type === "compact" ? (
                <span key={i} className="ml-0.5 text-[0.65em] opacity-80" aria-hidden="true">{part.value}</span>
              ) : (
                <span key={i}>{part.value}</span>
              )
            )}
          </span>
        );
      }
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      return <span className="font-light tabular-nums">{formatted}</span>;
    }
    case "currency": {
      const currency = format.currency;
      const decimals = format.decimals ?? 2;
      const formatted = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      const spokenValue = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        currencyDisplay: "name",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      return <span className="font-light tabular-nums" aria-label={spokenValue}>{formatted}</span>;
    }
    case "percent": {
      const decimals = format.decimals ?? 2;
      const basis = format.basis ?? "fraction";
      const numeric = basis === "fraction" ? value * 100 : value;
      const formatted = numeric.toFixed(decimals);
      return (
        <span className="font-light tabular-nums" aria-label={`${formatted} percent`}>
          {formatted}
          <span className="ml-0.5 text-[0.65em] opacity-80" aria-hidden="true">%</span>
        </span>
      );
    }
    case "text":
    default:
      return <span className="font-light tabular-nums">{String(value)}</span>;
  }
}

interface DeltaValueProps {
  diff: StatDiff;
}

function DeltaValue({ diff }: DeltaValueProps) {
  const { value, decimals = 1, upIsPositive = true, label } = diff;

  const isPositive = value > 0;
  const isNegative = value < 0;

  const isGood = upIsPositive ? isPositive : isNegative;
  const isBad = upIsPositive ? isNegative : isPositive;

  const colorClass = isGood
    ? "text-green-600 dark:text-green-500"
    : isBad
      ? "text-red-600 dark:text-red-500"
      : "text-muted-foreground";

  const bgClass = isGood
    ? "bg-green-500/10 dark:bg-green-500/15"
    : isBad
      ? "bg-red-500/10 dark:bg-red-500/15"
      : "bg-muted";

  const formatted = Math.abs(value).toFixed(decimals);
  const sign = isNegative ? "−" : "+";
  const display = `${sign}${formatted}%`;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums", colorClass, bgClass)}>
      {!upIsPositive && <span className="text-[0.9em]">{isGood ? "↓" : "↑"}</span>}
      {display}
      {label && <span className="text-muted-foreground font-normal">{label}</span>}
    </span>
  );
}

interface TunableStatCardProps {
  stat: StatItem;
  locale?: string;
  isSingle?: boolean;
  diagonalIndex?: number;
  sparklineAnimation: SparklineAnimationParams;
  cardAnimation: StatCardAnimationParams;
}

function TunableStatCard({
  stat,
  locale,
  isSingle = false,
  diagonalIndex = 0,
  sparklineAnimation,
  cardAnimation,
}: TunableStatCardProps) {
  const sparklineColor = stat.sparkline?.color ?? "var(--muted-foreground)";
  const hasSparkline = Boolean(stat.sparkline);
  const baseDelay = diagonalIndex * cardAnimation.staggerOffset;

  return (
    <div
      className={cn(
        "relative flex min-h-28 flex-col gap-1 px-6",
        isSingle ? "justify-center" : "justify-end"
      )}
    >
      {hasSparkline && (
        <TunableSparkline
          data={stat.sparkline!.data}
          color={sparklineColor}
          showFill
          animation={sparklineAnimation}
          className="pointer-events-none absolute inset-x-0 top-2 bottom-2"
          style={{
            opacity: 0,
            transform: `translateY(${sparklineAnimation.slideDistance}px)`,
            animation: `slide-in-tunable ${sparklineAnimation.slideDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay}ms forwards, fade-in-tunable ${sparklineAnimation.fadeDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay}ms forwards`,
          }}
        />
      )}
      <span
        className="text-muted-foreground relative text-xs font-normal tracking-wider uppercase opacity-0"
        style={{
          animation: `slide-in-label ${cardAnimation.labelDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + cardAnimation.labelDelay}ms forwards, fade-in-tunable ${cardAnimation.labelDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + cardAnimation.labelDelay}ms forwards`,
        }}
      >
        {stat.label}
      </span>
      <div
        className="relative flex items-baseline gap-2 pb-2 opacity-0"
        style={{
          animation: `slide-in-value ${cardAnimation.valueDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + cardAnimation.valueDelay}ms forwards, fade-in-tunable ${cardAnimation.valueDuration}ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + cardAnimation.valueDelay}ms forwards`,
        }}
      >
        <span className={cn(
          "font-light tracking-normal",
          isSingle ? "text-5xl" : "text-3xl"
        )}>
          <FormattedValue
            value={stat.value}
            format={stat.format}
            locale={locale}
          />
        </span>
        {stat.diff && <DeltaValue diff={stat.diff} />}
      </div>
      <style>{`
        @keyframes slide-in-tunable {
          from { transform: translateY(${sparklineAnimation.slideDistance}px); }
          to { transform: translateY(0); }
        }
        @keyframes slide-in-label {
          from { transform: translateY(${cardAnimation.labelSlide}px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.9; }
        }
        @keyframes slide-in-value {
          from { transform: translateY(${cardAnimation.valueSlide}px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in-tunable {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface TunableStatsDisplayProps extends StatsDisplayProps {
  sparklineAnimation: SparklineAnimationParams;
  cardAnimation: StatCardAnimationParams;
}

function TunableStatsDisplay({
  id,
  title,
  description,
  stats,
  className,
  isLoading = false,
  locale: localeProp,
  sparklineAnimation,
  cardAnimation,
}: TunableStatsDisplayProps) {
  const locale = localeProp ?? (typeof navigator !== "undefined" ? navigator.language : undefined);
  const hasHeader = Boolean(title || description);
  const isSingle = stats.length === 1;

  // Calculate diagonal index for ripple effect (row + col)
  // Assumes 2 columns when container is wide enough
  const columns = stats.length <= 2 ? stats.length : 2;
  const getDiagonalIndex = (index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return row + col;
  };

  return (
    <article
      data-slot="stats-display"
      data-tool-ui-id={id}
      aria-busy={isLoading}
      className={cn(
        "w-full min-w-80 max-w-xl",
        isSingle && "max-w-sm",
        className
      )}
    >
      <Card className={cn("overflow-clip !pb-0 !pt-2", hasHeader && "!gap-0")}>
        {hasHeader && (
          <CardHeader className="border-b border-border !pt-3 !pb-4">
            {title && <CardTitle className="text-pretty">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-pretty">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="@container overflow-hidden p-0">
          <div
            className="grid @[440px]:-ml-px @[440px]:-mt-px"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={cn(
                  "overflow-clip py-3 first:pt-0 @[440px]:py-3 @[440px]:first:pt-3 @[440px]:border-l @[440px]:border-t @[440px]:border-border",
                  index > 0 && "border-border border-t"
                )}
              >
                <TunableStatCard
                  stat={stat}
                  locale={locale}
                  isSingle={isSingle}
                  diagonalIndex={getDiagonalIndex(index)}
                  sparklineAnimation={sparklineAnimation}
                  cardAnimation={cardAnimation}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

interface TuningPanelProps {
  data: StatsDisplayProps;
}

function TuningPanel({ data }: TuningPanelProps) {
  const [key, setKey] = useState(0);

  const loopControls = useControls("Playback", {
    autoLoop: { value: false, label: "Auto Loop" },
    loopInterval: { value: 3000, min: 1000, max: 10000, step: 500, label: "Interval (ms)" },
  });

  const replay = useCallback(() => setKey(k => k + 1), []);

  useEffect(() => {
    if (!loopControls.autoLoop) return;

    replay();
    const intervalId = setInterval(replay, loopControls.loopInterval);
    return () => clearInterval(intervalId);
  }, [loopControls.autoLoop, loopControls.loopInterval, replay]);

  const sparklineAnimation = useControls("Sparkline", {
    slideDuration: { value: 1000, min: 100, max: 3000, step: 50, label: "Slide Duration (ms)" },
    slideDistance: { value: 48, min: 0, max: 100, step: 4, label: "Slide Distance (px)" },
    fadeDuration: { value: 1500, min: 100, max: 3000, step: 50, label: "Fade Duration (ms)" },
    fillFadeDuration: { value: 1000, min: 100, max: 3000, step: 50, label: "Fill Fade Duration" },
    fillOpacity: { value: 0.09, min: 0, max: 0.5, step: 0.01, label: "Fill Opacity" },
    baseStrokeOpacity: { value: 0.15, min: 0, max: 1, step: 0.05, label: "Base Stroke Opacity" },
  });

  const glintAnimation = useControls("Glint Effect", {
    glintDuration: { value: 0.8, min: 0.1, max: 3, step: 0.1, label: "Duration (s)" },
    glintDashSize: { value: 74, min: 4, max: 150, step: 2, label: "Dash Size" },
    glintGapSize: { value: 110, min: 20, max: 400, step: 10, label: "Gap Size" },
    glintStrokeWidth: { value: 1.0, min: 0.5, max: 6, step: 0.25, label: "Stroke Width" },
    glintPeakOpacity: { value: 0.8, min: 0, max: 1, step: 0.05, label: "Peak Opacity" },
  });

  const slowGlintAnimation = useControls("Slow Glint", {
    slowGlintDashSize: { value: 80, min: 10, max: 200, step: 5, label: "Dash Size" },
    slowGlintGapSize: { value: 200, min: 50, max: 600, step: 25, label: "Gap Size" },
    slowGlintStrokeWidth: { value: 3.5, min: 0.5, max: 6, step: 0.25, label: "Stroke Width" },
    slowGlintPeakOpacity: { value: 0.4, min: 0, max: 1, step: 0.05, label: "Peak Opacity" },
  });

  const cardAnimation = useControls("Stat Cards", {
    staggerOffset: { value: 175, min: 0, max: 500, step: 25, label: "Stagger (ms)" },
    labelDelay: { value: 75, min: 0, max: 500, step: 25, label: "Label Delay (ms)" },
    labelDuration: { value: 500, min: 100, max: 2000, step: 50, label: "Label Duration" },
    labelSlide: { value: 4, min: 0, max: 32, step: 2, label: "Label Slide (px)" },
    valueDelay: { value: 150, min: 0, max: 500, step: 25, label: "Value Delay (ms)" },
    valueDuration: { value: 500, min: 100, max: 2000, step: 50, label: "Value Duration" },
    valueSlide: { value: 8, min: 0, max: 32, step: 2, label: "Value Slide (px)" },
  });

  useControls({
    "Replay Animation": button(replay),
  });

  const mergedSparklineAnimation: SparklineAnimationParams = {
    slideDuration: sparklineAnimation.slideDuration,
    slideDistance: sparklineAnimation.slideDistance,
    fadeDuration: sparklineAnimation.fadeDuration,
    fillFadeDuration: sparklineAnimation.fillFadeDuration,
    fillOpacity: sparklineAnimation.fillOpacity,
    baseStrokeOpacity: sparklineAnimation.baseStrokeOpacity,
    glintDuration: glintAnimation.glintDuration,
    glintDashSize: glintAnimation.glintDashSize,
    glintGapSize: glintAnimation.glintGapSize,
    glintStrokeWidth: glintAnimation.glintStrokeWidth,
    glintPeakOpacity: glintAnimation.glintPeakOpacity,
    slowGlintDashSize: slowGlintAnimation.slowGlintDashSize,
    slowGlintGapSize: slowGlintAnimation.slowGlintGapSize,
    slowGlintStrokeWidth: slowGlintAnimation.slowGlintStrokeWidth,
    slowGlintPeakOpacity: slowGlintAnimation.slowGlintPeakOpacity,
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <TunableStatsDisplay
          key={key}
          {...data}
          sparklineAnimation={mergedSparklineAnimation}
          cardAnimation={cardAnimation}
        />
      </div>
      <Leva
        flat
        hideCopyButton
        titleBar={{ title: "Animation Tuning" }}
      />
    </div>
  );
}

export const statsDisplayStagingConfig: StagingConfig = {
  supportedDebugLevels: ["off"],
  renderDebugOverlay: () => null,
  renderTuningPanel: ({ data }) => (
    <TuningPanel data={data as unknown as StatsDisplayProps} />
  ),
};
