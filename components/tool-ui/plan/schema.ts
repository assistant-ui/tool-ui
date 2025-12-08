import { z } from "zod";
import {
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  ToolUIIdSchema,
} from "../shared";

export const PlanTodoStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const PlanTodoSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: PlanTodoStatusSchema,
  description: z.string().optional(),
});

export type PlanTodoStatus = z.infer<typeof PlanTodoStatusSchema>;
export type PlanTodo = z.infer<typeof PlanTodoSchema>;

export const PlanPropsSchema = z.object({
  id: ToolUIIdSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  todos: z.array(PlanTodoSchema).min(1),
  maxVisibleTodos: z.number().min(1).optional(),
  showProgress: z.boolean().optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
  className: z.string().optional(),
});

export type PlanProps = z.infer<typeof PlanPropsSchema>;

export const SerializablePlanSchema = PlanPropsSchema;

export type SerializablePlan = z.infer<typeof SerializablePlanSchema>;

export function parseSerializablePlan(input: unknown): SerializablePlan {
  const result = SerializablePlanSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid Plan payload: ${result.error.message}`);
  }
  return result.data;
}
