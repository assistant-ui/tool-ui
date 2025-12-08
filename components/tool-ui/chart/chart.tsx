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

import {
  cn,
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
import type { ChartProps } from "./schema";

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function Chart({
  id,
  type,
  title,
  description,
  data,
  xKey,
  series,
  colors,
  showLegend = false,
  showGrid = true,
  className,
  onDataPointClick,
}: ChartProps) {
  const palette = colors?.length ? colors : DEFAULT_COLORS;
  const seriesColors = series.map(
    (s, i) => s.color ?? palette[i % palette.length],
  );

  const chartConfig: ChartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      {
        label: s.label,
        color: seriesColors[i],
      },
    ]),
  );

  const handleDataPointClick = (
    seriesKey: string,
    seriesLabel: string,
    payload: Record<string, unknown>,
    index: number,
  ) => {
    onDataPointClick?.({
      seriesKey,
      seriesLabel,
      xValue: payload[xKey],
      yValue: payload[seriesKey],
      index,
      payload,
    });
  };

  const ChartComponent = type === "bar" ? BarChart : LineChart;

  const chartContent = (
    <ChartContainer
      config={chartConfig}
      className="min-h-[200px] w-full"
      data-tool-ui-id={id}
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
          series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={seriesColors[i]}
              radius={4}
              onClick={(data) =>
                handleDataPointClick(s.key, s.label, data.payload, data.index)
              }
              cursor={onDataPointClick ? "pointer" : undefined}
            />
          ))}

        {type === "line" &&
          series.map((s, i) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={seriesColors[i]}
              strokeWidth={2}
              dot={{ r: 4, cursor: onDataPointClick ? "pointer" : undefined }}
              activeDot={{
                r: 6,
                cursor: onDataPointClick ? "pointer" : undefined,
                // Recharts types are incorrect - onClick receives (event, dotData) at runtime
                onClick: ((
                  _: unknown,
                  dotData: { payload: Record<string, unknown>; index: number },
                ) => {
                  handleDataPointClick(
                    s.key,
                    s.label,
                    dotData.payload,
                    dotData.index,
                  );
                }) as unknown as React.MouseEventHandler,
              }}
            />
          ))}
      </ChartComponent>
    </ChartContainer>
  );

  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-pretty">{title}</CardTitle>}
          {description && <CardDescription className="text-pretty">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
