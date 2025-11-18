import { z } from "zod";
import type { ReactNode } from "react";

export const DecisionPromptActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  confirmLabel: z.string().optional(),
  variant: z
    .enum(["default", "destructive", "secondary", "ghost", "outline"])
    .optional(),
  icon: z.custom<ReactNode>().optional(),
  loading: z.boolean().optional(),
  disabled: z.boolean().optional(),
  shortcut: z.string().optional(),
});

export type DecisionPromptAction = z.infer<typeof DecisionPromptActionSchema>;

export const DecisionPromptPropsSchema = z.object({
  prompt: z.string().min(1),
  actions: z.array(DecisionPromptActionSchema).min(1),
  selectedAction: z.string().optional(),
  selectedActions: z.array(z.string()).optional(),
  description: z.string().optional(),
  onAction: z.custom<(actionId: string) => void | Promise<void>>().optional(),
  onMultiAction: z
    .custom<(actionIds: string[]) => void | Promise<void>>()
    .optional(),
  onBeforeAction: z
    .custom<(actionId: string) => boolean | Promise<boolean>>()
    .optional(),
  confirmTimeout: z.number().positive().optional(),
  className: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  layout: z.enum(["inline", "stack"]).optional(),
  multiSelect: z.boolean().optional(),
  confirmLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
  minSelections: z.number().min(0).optional(),
  maxSelections: z.number().min(1).optional(),
});

export type DecisionPromptProps = Omit<
  z.infer<typeof DecisionPromptPropsSchema>,
  "onAction" | "onBeforeAction" | "onMultiAction"
> & {
  onAction?: (actionId: string) => void | Promise<void>;
  onMultiAction?: (actionIds: string[]) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
};

export const SerializableDecisionPromptSchema = DecisionPromptPropsSchema.omit({
  onAction: true,
  onMultiAction: true,
  onBeforeAction: true,
}).extend({
  actions: z.array(DecisionPromptActionSchema.omit({ icon: true })),
});

export type SerializableDecisionPrompt = z.infer<
  typeof SerializableDecisionPromptSchema
>;

export function parseSerializableDecisionPrompt(
  input: unknown,
): SerializableDecisionPrompt {
  const res = SerializableDecisionPromptSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid DecisionPrompt payload: ${res.error.message}`);
  }
  return res.data;
}
