import { z } from "zod";
import {
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
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
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  todos: z.array(PlanTodoSchema).min(1),
  maxVisibleTodos: z.number().min(1).optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type PlanProps = z.infer<typeof PlanPropsSchema> & {
  className?: string;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
};

export const SerializablePlanSchema = PlanPropsSchema;

export type SerializablePlan = z.infer<typeof SerializablePlanSchema>;

export function parseSerializablePlan(input: unknown): SerializablePlan {
  return parseWithSchema(SerializablePlanSchema, input, "Plan");
}
