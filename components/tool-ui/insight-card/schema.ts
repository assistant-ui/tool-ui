import { z } from "zod";
import {
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  ToolUIIdSchema,
  ToolUIRoleSchema,
} from "../shared/schema";
import { parseWithSchema } from "../shared/parse";
import type { ActionsProp, Action } from "../shared";

export const InsightSeveritySchema = z.enum([
  "info",
  "success",
  "warning",
  "critical",
]);

export type InsightSeverity = z.infer<typeof InsightSeveritySchema>;

export const InsightConfidenceSchema = z.object({
  score: z.number().min(0).max(1),
  label: z.string().min(1).optional(),
});

export type InsightConfidence = z.infer<typeof InsightConfidenceSchema>;

export const InsightCitationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source: z.string().min(1),
  url: z.string().url().optional(),
  excerpt: z.string().min(1).optional(),
});

export type InsightCitation = z.infer<typeof InsightCitationSchema>;

export const InsightActionSchema = SerializableActionSchema;

export type InsightAction = z.infer<typeof InsightActionSchema>;

export const SerializableInsightCardSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),

  title: z.string().min(1),
  summary: z.string().min(1),
  severity: InsightSeveritySchema.optional(),

  confidence: InsightConfidenceSchema.optional(),
  citations: z.array(InsightCitationSchema).min(1).optional(),

  action: InsightActionSchema.optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),

  footer: z.string().optional(),
});

export type SerializableInsightCard = z.infer<typeof SerializableInsightCardSchema>;

export function parseSerializableInsightCard(
  input: unknown,
): SerializableInsightCard {
  return parseWithSchema(SerializableInsightCardSchema, input, "InsightCard");
}

export interface InsightCardProps extends SerializableInsightCard {
  className?: string;
  isLoading?: boolean;
  responseActions?: ActionsProp;
  action?: Action;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}
