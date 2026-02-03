import { z } from "zod";
import type { ReactNode } from "react";
import type { ActionsProp } from "../shared";
import {
  ActionSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

const OptionListSelectionSchema = z.union([
  z.array(z.string()),
  z.string(),
  z.null(),
]);

export const OptionListOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.custom<ReactNode>().optional(),
  disabled: z.boolean().optional(),
});

const OptionListBaseSchema = z.object({
  /**
   * Unique identifier for this tool UI instance in the conversation.
   *
   * Used for:
   * - Assistant referencing ("the options above")
   * - Receipt generation (linking selections to their source)
   * - Narration context
   *
   * Should be stable across re-renders, meaningful, and unique within the conversation.
   *
   * @example "option-list-deploy-target", "format-selection"
   */
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  options: z.array(OptionListOptionSchema).min(1),
  selectionMode: z.enum(["multi", "single"]).optional(),
  minSelections: z.number().min(0).optional(),
  maxSelections: z.number().min(1).optional(),
});

export const OptionListPropsSchema = OptionListBaseSchema.extend({
  /**
   * Controlled selection value (advanced / runtime only).
   *
   * For Tool UI tool payloads, prefer `defaultValue` (initial selection).
   * Controlled `value` is intentionally excluded from `SerializableOptionListSchema`
   * to avoid accidental "controlled but non-interactive" states when an LLM
   * includes `value` in args.
   */
  value: OptionListSelectionSchema.optional(),
  defaultValue: OptionListSelectionSchema.optional(),
  responseActions: z
    .union([z.array(ActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type OptionListSelection = string[] | string | null;

export type OptionListOption = z.infer<typeof OptionListOptionSchema>;

export type OptionListProps = Omit<
  z.infer<typeof OptionListPropsSchema>,
  "value" | "defaultValue"
> & {
  /** @see OptionListPropsSchema.id */
  id: string;
  value?: OptionListSelection;
  defaultValue?: OptionListSelection;
  onChange?: (value: OptionListSelection) => void;
  onConfirm?: (value: OptionListSelection) => void | Promise<void>;
  onCancel?: () => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
  className?: string;
};

export type OptionListReceiptProps = Omit<
  SerializableOptionListReceipt,
  "options"
> & {
  options: OptionListOption[];
  className?: string;
};

export const SerializableOptionListSchema = OptionListBaseSchema.extend({
  options: z.array(OptionListOptionSchema.omit({ icon: true })),
  defaultValue: OptionListSelectionSchema.optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export const SerializableOptionListReceiptSchema = OptionListBaseSchema.extend({
  options: z.array(OptionListOptionSchema.omit({ icon: true })),
  choice: OptionListSelectionSchema,
});

export type SerializableOptionList = z.infer<
  typeof SerializableOptionListSchema
>;

export type SerializableOptionListReceipt = z.infer<
  typeof SerializableOptionListReceiptSchema
>;

export function parseSerializableOptionList(
  input: unknown,
): SerializableOptionList {
  return parseWithSchema(SerializableOptionListSchema, input, "OptionList");
}

export function parseSerializableOptionListReceipt(
  input: unknown,
): SerializableOptionListReceipt {
  return parseWithSchema(
    SerializableOptionListReceiptSchema,
    input,
    "OptionListReceipt",
  );
}
