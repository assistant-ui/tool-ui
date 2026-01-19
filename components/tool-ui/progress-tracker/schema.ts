import { z } from "zod";
import {
  ToolUISurfaceSchema,
  ToolUIReceiptSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  parseWithSchema,
} from "../shared";
import type { ActionsProp, ToolUIReceipt } from "../shared";

/**
 * Receipt state for ProgressTracker showing the outcome of a workflow.
 */
export type ProgressTrackerChoice = ToolUIReceipt;

export const ProgressStepSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "failed"]),
});

export type ProgressStep = z.infer<typeof ProgressStepSchema>;

export const SerializableProgressTrackerSchema = ToolUISurfaceSchema.extend({
  steps: z.array(ProgressStepSchema).min(1),
  elapsedTime: z.number().optional(),
  /**
   * When set, renders the component in receipt state showing the workflow outcome.
   */
  choice: ToolUIReceiptSchema.optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type SerializableProgressTracker = z.infer<
  typeof SerializableProgressTrackerSchema
>;

export function parseSerializableProgressTracker(
  input: unknown,
): SerializableProgressTracker {
  return parseWithSchema(
    SerializableProgressTrackerSchema,
    input,
    "ProgressTracker",
  );
}

export interface ProgressTrackerProps extends SerializableProgressTracker {
  className?: string;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}
