"use client";

import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { cn } from "./_cn";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  type ChartConfig,
} from "./_ui";
import type { ChartProps, ChartDataPoint } from "./schema";

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function Chart({
  surfaceId,
  type,
  title,
  description,
  data,
  xKey,
  series,
  showLegend = false,
  showGrid = true,
  className,
  onDataPointClick,
}: ChartProps) {
  const chartConfig: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      {
        label: s.label,
        color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      },
    ])
  );

  const handleClick = (seriesKey: string, seriesLabel: string) => {
    if (!onDataPointClick) return undefined;

    return (payload: Record<string, unknown>, index: number) => {
      onDataPointClick({
        seriesKey,
        seriesLabel,
        xValue: payload[xKey],
        yValue: payload[seriesKey],
        index,
        payload,
      } satisfies ChartDataPoint);
    };
  };

  const ChartComponent = type === "bar" ? BarChart : LineChart;

  const chartContent = (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
      data-surface-id={surfaceId}
    >
      <ChartComponent data={data} accessibilityLayer>
        {showGrid && <CartesianGrid vertical={false} />}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}

        {type === "bar" &&
          series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={`var(--color-${s.key})`}
              radius={4}
              onClick={handleClick(s.key, s.label)}
              cursor={onDataPointClick ? "pointer" : undefined}
            />
          ))}

        {type === "line" &&
          series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={`var(--color-${s.key})`}
              strokeWidth={2}
              dot={{ r: 4, cursor: onDataPointClick ? "pointer" : undefined }}
              activeDot={{
                r: 6,
                cursor: onDataPointClick ? "pointer" : undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick: ((_event: any, dotData: any) => {
                  if (!onDataPointClick || !dotData?.payload) return;
                  onDataPointClick({
                    seriesKey: s.key,
                    seriesLabel: s.label,
                    xValue: dotData.payload[xKey],
                    yValue: dotData.payload[s.key],
                    index: dotData.index ?? 0,
                    payload: dotData.payload,
                  });
                }) as never,
              }}
            />
          ))}
      </ChartComponent>
    </ChartContainer>
  );

  if (!title && !description) {
    return <div className={cn("w-full", className)}>{chartContent}</div>;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
