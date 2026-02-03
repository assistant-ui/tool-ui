import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

export const TimePointSchema = z.object({
  t: z.string().datetime(),
  v: z.number(),
});

export type TimePoint = z.infer<typeof TimePointSchema>;

export const TimeSeriesBandSchema = z.object({
  label: z.string().min(1).optional(),
  upper: z.array(TimePointSchema).min(2),
  lower: z.array(TimePointSchema).min(2),
});

export type TimeSeriesBand = z.infer<typeof TimeSeriesBandSchema>;

export const TimeSeriesAnnotationSchema = z.object({
  t: z.string().datetime(),
  label: z.string().min(1),
});

export type TimeSeriesAnnotation = z.infer<typeof TimeSeriesAnnotationSchema>;

export const TimeSeriesDeltaSchema = z.object({
  value: z.number(),
  label: z.string().min(1).optional(),
});

export type TimeSeriesDelta = z.infer<typeof TimeSeriesDeltaSchema>;

export const TimeSeriesStatusSchema = z.enum([
  "neutral",
  "positive",
  "negative",
  "warning",
]);

export type TimeSeriesStatus = z.infer<typeof TimeSeriesStatusSchema>;

export const SerializableTimeSeriesSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),

  title: z.string().optional(),
  subtitle: z.string().optional(),
  unit: z.string().optional(),

  points: z.array(TimePointSchema).min(2),
  baseline: z.array(TimePointSchema).optional(),
  band: TimeSeriesBandSchema.optional(),

  delta: TimeSeriesDeltaSchema.optional(),
  status: TimeSeriesStatusSchema.optional(),
  annotations: z.array(TimeSeriesAnnotationSchema).optional(),
});

export type SerializableTimeSeries = z.infer<typeof SerializableTimeSeriesSchema>;

export function parseSerializableTimeSeries(
  input: unknown,
): SerializableTimeSeries {
  return parseWithSchema(SerializableTimeSeriesSchema, input, "TimeSeries");
}

export interface TimeSeriesProps extends SerializableTimeSeries {
  className?: string;
  isLoading?: boolean;
}
