import { z } from "zod";
import type { ReactNode } from "react";

export const DecisionPromptActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  confirmLabel: z.string().optional(),
  variant: z.enum(["default", "destructive", "secondary", "ghost"]).optional(),
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
  description: z.string().optional(),
  onAction: z.function().args(z.string()).returns(z.union([z.void(), z.promise(z.void())])).optional(),
  onBeforeAction: z.function().args(z.string()).returns(z.union([z.boolean(), z.promise(z.boolean())])).optional(),
  confirmTimeout: z.number().positive().optional(),
  className: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

export type DecisionPromptProps = Omit<z.infer<typeof DecisionPromptPropsSchema>, "onAction" | "onBeforeAction"> & {
  onAction?: (actionId: string) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
};

export const SerializableDecisionPromptSchema = DecisionPromptPropsSchema.omit({
  onAction: true,
  onBeforeAction: true,
}).extend({
  actions: z.array(DecisionPromptActionSchema.omit({ icon: true })),
});

export type SerializableDecisionPrompt = z.infer<typeof SerializableDecisionPromptSchema>;
