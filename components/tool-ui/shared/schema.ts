import { z } from "zod";
import type { ReactNode } from "react";

export const ActionSchema = z.object({
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

export type Action = z.infer<typeof ActionSchema>;

export const ActionButtonsPropsSchema = z.object({
  actions: z.array(ActionSchema).min(1),
  align: z.enum(["left", "center", "right"]).optional(),
  layout: z.enum(["inline", "stack"]).optional(),
  confirmTimeout: z.number().positive().optional(),
  className: z.string().optional(),
});

export const SerializableActionSchema = ActionSchema.omit({ icon: true });
export const SerializableActionsSchema =
  ActionButtonsPropsSchema.extend({
    actions: z.array(SerializableActionSchema),
  }).omit({ className: true });

export type ActionsConfig = {
  items: Action[];
  align?: "left" | "center" | "right";
  layout?: "inline" | "stack";
  confirmTimeout?: number;
};

export type SerializableAction = z.infer<typeof SerializableActionSchema>;
