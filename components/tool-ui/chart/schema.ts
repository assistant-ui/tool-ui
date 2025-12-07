import { z } from "zod";
import { ToolUIIdSchema } from "../shared";

export const ChartSeriesSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  color: z.string().optional(),
});

export type ChartSeries = z.infer<typeof ChartSeriesSchema>;

export const ChartPropsSchema = z.object({
  id: ToolUIIdSchema,
  type: z.enum(["bar", "line"]),
  title: z.string().optional(),
  description: z.string().optional(),
  data: z.array(z.record(z.string(), z.unknown())).min(1),
  xKey: z.string().min(1),
  series: z.array(ChartSeriesSchema).min(1),
  /** Color palette applied to series in order. Individual series.color takes precedence. */
  colors: z.array(z.string().min(1)).min(1).optional(),
  showLegend: z.boolean().optional(),
  showGrid: z.boolean().optional(),
});

export type ChartDataPoint = {
  seriesKey: string;
  seriesLabel: string;
  xValue: unknown;
  yValue: unknown;
  index: number;
  payload: Record<string, unknown>;
};

export type ChartClientProps = {
  className?: string;
  onDataPointClick?: (point: ChartDataPoint) => void;
};

export type ChartProps = z.infer<typeof ChartPropsSchema> & ChartClientProps;

export const SerializableChartSchema = ChartPropsSchema;

export type SerializableChart = z.infer<typeof SerializableChartSchema>;

export function parseSerializableChart(input: unknown): SerializableChart {
  const res = SerializableChartSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid Chart payload: ${res.error.message}`);
  }
  return res.data;
}
