import { z } from "zod";
import type { ReactNode } from "react";
import type { Action, ActionsConfig, ActionsProp } from "../shared";
import {
  ActionSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
} from "../shared";

export const OptionListOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.custom<ReactNode>().optional(),
  disabled: z.boolean().optional(),
});

export const OptionListPropsSchema = z.object({
  options: z.array(OptionListOptionSchema).min(1),
  selectionMode: z.enum(["multi", "single"]).optional(),
  value: z
    .union([z.array(z.string()), z.string(), z.null()])
    .optional(),
  defaultValue: z
    .union([z.array(z.string()), z.string(), z.null()])
    .optional(),
  footerActions: z
    .union([z.array(ActionSchema), SerializableActionsConfigSchema])
    .optional(),
  minSelections: z.number().min(0).optional(),
  maxSelections: z.number().min(1).optional(),
  className: z.string().optional(),
});

export type OptionListSelection = string[] | string | null;

export type OptionListOption = z.infer<typeof OptionListOptionSchema>;

export type OptionListProps = Omit<
  z.infer<typeof OptionListPropsSchema>,
  "value" | "defaultValue"
> & {
  value?: OptionListSelection;
  defaultValue?: OptionListSelection;
  onChange?: (value: OptionListSelection) => void;
  onConfirm?: (value: OptionListSelection) => void | Promise<void>;
  onCancel?: () => void;
  footerActions?: ActionsProp;
};

export const SerializableOptionListSchema = OptionListPropsSchema.extend({
  options: z.array(OptionListOptionSchema.omit({ icon: true })),
  footerActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type SerializableOptionList = z.infer<typeof SerializableOptionListSchema>;

export function parseSerializableOptionList(
  input: unknown,
): SerializableOptionList {
  const res = SerializableOptionListSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid OptionList payload: ${res.error.message}`);
  }
  return res.data;
}
