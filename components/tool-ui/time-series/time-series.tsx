"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ChartContainer,
  type ChartConfig,
} from "./_adapter";
import type {
  TimeSeriesProps,
  TimeSeriesStatus,
  TimePoint,
} from "./schema";

type TimeSeriesVariant = "compact" | "standard" | "detailed";

type ChartDatum = {
  t: string;
  value: number;
  baseline?: number;
  upper?: number;
  lower?: number;
};

const STATUS_STYLES: Record<
  TimeSeriesStatus,
  { badge: string; text: string }
> = {
  neutral: {
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
    text: "text-slate-600 dark:text-slate-400",
  },
  positive: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  negative: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
  },
};

function formatUnitValue(value: number, unit?: string) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: abs >= 100 ? 0 : 1,
  }).format(value);

  if (!unit) return formatted;
  if (unit === "%") return `${formatted}%`;
  if (unit.startsWith("$")) return `${unit}${formatted}`;
  return `${formatted} ${unit}`;
}

function formatUnitParts(value: number, unit?: string) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: abs >= 100 ? 0 : 1,
  }).format(value);

  if (!unit) return { prefix: "", value: formatted, suffix: "" };
  if (unit === "%") return { prefix: "", value: formatted, suffix: "%" };
  if (unit.startsWith("$")) return { prefix: unit, value: formatted, suffix: "" };
  return { prefix: "", value: formatted, suffix: ` ${unit}` };
}

function formatDelta(value: number, unit?: string) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const parts = formatUnitParts(Math.abs(value), unit);
  return {
    sign,
    ...parts,
  };
}

function formatTick(value: string, variant: TimeSeriesVariant) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  if (variant === "standard") {
    return formatter.format(date);
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function buildChartData(
  points: TimePoint[],
  baseline?: TimePoint[],
  band?: { upper: TimePoint[]; lower: TimePoint[] },
): ChartDatum[] {
  const baselineMap = new Map(baseline?.map((point) => [point.t, point.v]));
  const upperMap = new Map(band?.upper?.map((point) => [point.t, point.v]));
  const lowerMap = new Map(band?.lower?.map((point) => [point.t, point.v]));

  return points.map((point) => ({
    t: point.t,
    value: point.v,
    baseline: baselineMap.get(point.t),
    upper: upperMap.get(point.t),
    lower: lowerMap.get(point.t),
  }));
}

function TimeSeriesSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full min-w-72", className)}
      data-slot="time-series"
      aria-busy="true"
    >
      <Card className="w-full py-4">
        <CardHeader className="space-y-1.5 px-5">
          <div className="h-3.5 w-28 rounded bg-muted" />
          <div className="h-3 w-40 rounded bg-muted" />
        </CardHeader>
        <CardContent className="px-5">
          <div className="h-24 w-full rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

export function TimeSeries({
  id,
  title,
  subtitle,
  unit,
  points,
  baseline,
  band,
  delta,
  status = "neutral",
  annotations,
  className,
  isLoading,
}: TimeSeriesProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [variant, setVariant] = React.useState<TimeSeriesVariant>("standard");

  const resolveVariant = React.useCallback(
    (width: number, height: number): TimeSeriesVariant => {
      if (width >= 560 && height >= 220) return "detailed";
      if (width <= 360 || height <= 140) return "compact";
      return "standard";
    },
    [],
  );

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateVariant = (width: number, height: number) => {
      setVariant(resolveVariant(width, height));
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        updateVariant(entry.contentRect.width, entry.contentRect.height);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    const updateFromClient = () => {
      updateVariant(node.clientWidth, node.clientHeight);
    };

    updateFromClient();
    window.addEventListener("resize", updateFromClient);
    return () => window.removeEventListener("resize", updateFromClient);
  }, [resolveVariant]);

  const chartData = React.useMemo(
    () => buildChartData(points, baseline, band),
    [points, baseline, band],
  );

  const lastPoint = points[points.length - 1];
  const lastValue = lastPoint?.v;
  const lastParts =
    lastValue !== undefined ? formatUnitParts(lastValue, unit) : null;
  const formattedLast =
    lastValue !== undefined ? formatUnitValue(lastValue, unit) : "—";

  const statusStyles = STATUS_STYLES[status];
  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = {
      series: {
        label: title ?? "Series",
        color: "var(--chart-1)",
      },
    };
    if (baseline) {
      config.baseline = { label: "Baseline", color: "var(--chart-3)" };
    }
    if (band) {
      config.band = { label: band.label ?? "Range", color: "var(--chart-2)" };
    }
    return config;
  }, [title, baseline, band]);

  if (isLoading) {
    return <TimeSeriesSkeleton className={className} />;
  }

  return (
    <div
      className={cn("w-full min-w-72", className)}
      data-tool-ui-id={id}
      data-slot="time-series"
      ref={containerRef}
    >
      <Card className={cn("w-full", variant === "compact" ? "py-3" : "py-4")}>
        {(title || subtitle || delta) && (
          <CardHeader
            className={cn(
              "flex flex-row items-start justify-between gap-3",
              variant === "compact" ? "px-4 py-2" : "px-5 py-3",
            )}
          >
            <div className="space-y-1">
              {title && (
                <CardTitle
                  className={cn(
                    "text-pretty",
                    variant === "compact" ? "text-xs" : "text-sm",
                  )}
                >
                  {title}
                </CardTitle>
              )}
              {subtitle && variant !== "compact" && (
                <CardDescription className="text-pretty text-[11px] text-muted-foreground/80">
                  {subtitle}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span
                className={cn(
                  "flex items-baseline gap-1 tabular-nums",
                  variant === "compact" ? "text-xs" : "text-sm",
                  statusStyles.text,
                )}
              >
                {lastParts ? (
                  <>
                    {lastParts.prefix && (
                      <span className="text-muted-foreground/70">
                        {lastParts.prefix}
                      </span>
                    )}
                    <span className="font-semibold tracking-tight">
                      {lastParts.value}
                    </span>
                    {lastParts.suffix && (
                      <span className="text-muted-foreground/70">
                        {lastParts.suffix}
                      </span>
                    )}
                  </>
                ) : (
                  formattedLast
                )}
              </span>
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    "tabular-nums",
                    statusStyles.badge,
                  )}
                >
                  {(() => {
                    const parts = formatDelta(delta.value, unit);
                    return (
                      <>
                        <span>{parts.sign}</span>
                        {parts.prefix && <span>{parts.prefix}</span>}
                        <span>{parts.value}</span>
                        {parts.suffix && <span>{parts.suffix}</span>}
                      </>
                    );
                  })()}
                  {delta.label ? ` ${delta.label}` : ""}
                </span>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent
          className={cn(
            variant === "compact" ? "px-4 pt-0" : "px-5 pt-0.5",
          )}
        >
          <ChartContainer
            id={id}
            config={chartConfig}
            className={cn(
              "aspect-auto w-full",
              variant === "compact" && "h-20",
              variant === "standard" && "h-28",
              variant === "detailed" && "h-32",
            )}
          >
            <LineChart
              data={chartData}
              margin={{ left: 8, right: 8, top: 8, bottom: 4 }}
            >
            {variant !== "compact" && (
              <CartesianGrid
                vertical={false}
                strokeDasharray="2 4"
                strokeOpacity={0.4}
              />
            )}
              {variant !== "compact" && (
                <XAxis
                  dataKey="t"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => formatTick(value, variant)}
                />
              )}
              {variant === "detailed" && (
                <YAxis tickLine={false} axisLine={false} width={32} />
              )}

            {band && (
              <Area
                type="monotone"
                dataKey="upper"
                baseLine={(datum: ChartDatum) => datum.lower ?? 0}
                stroke="none"
                fill="var(--color-band)"
                fillOpacity={0.08}
                isAnimationActive={false}
              />
            )}

            {baseline && (
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="var(--color-baseline)"
                strokeWidth={1.25}
                dot={false}
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                isAnimationActive={false}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-series)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={false}
            />

              {variant === "detailed" &&
                annotations?.map((annotation) => (
                  <ReferenceLine
                    key={annotation.t}
                    x={annotation.t}
                    stroke="var(--color-series)"
                    strokeOpacity={0.2}
                    strokeDasharray="2 4"
                    label={{
                      position: "top",
                      value: annotation.label,
                      fill: "currentColor",
                      fontSize: 10,
                    }}
                  />
                ))}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export function TimeSeriesProgress({ className }: { className?: string }) {
  return <TimeSeriesSkeleton className={className} />;
}
