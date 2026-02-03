import { z } from "zod";
import type { ActionsProp } from "../shared";
import {
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

const PreferenceItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["switch", "toggle", "select"]),
  defaultChecked: z.boolean().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(2)
    .optional(),
  defaultValue: z.string().optional(),
  selectOptions: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .min(5)
    .optional(),
  defaultSelected: z.string().optional(),
});

const PreferenceSectionSchema = z.object({
  heading: z.string().min(1).optional(),
  items: z.array(PreferenceItemSchema).min(1),
});

const PreferencesPanelBaseSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  title: z.string().min(1).optional(),
  sections: z.array(PreferenceSectionSchema).min(1),
});

export const SerializablePreferencesPanelSchema = PreferencesPanelBaseSchema.extend({
  responseActions: z
    .union([
      z.array(SerializableActionSchema),
      SerializableActionsConfigSchema,
    ])
    .optional(),
});

export type SerializablePreferencesPanel = z.infer<
  typeof SerializablePreferencesPanelSchema
>;

export const SerializablePreferencesPanelReceiptSchema =
  PreferencesPanelBaseSchema.extend({
    choice: z.record(z.string(), z.union([z.string(), z.boolean()])),
    error: z.record(z.string(), z.string()).optional(),
  });

export type SerializablePreferencesPanelReceipt = z.infer<
  typeof SerializablePreferencesPanelReceiptSchema
>;

export function parseSerializablePreferencesPanel(
  input: unknown,
): SerializablePreferencesPanel {
  return parseWithSchema(
    SerializablePreferencesPanelSchema,
    input,
    "PreferencesPanel",
  );
}

export function parseSerializablePreferencesPanelReceipt(
  input: unknown,
): SerializablePreferencesPanelReceipt {
  return parseWithSchema(
    SerializablePreferencesPanelReceiptSchema,
    input,
    "PreferencesPanelReceipt",
  );
}

export interface PreferencesValue {
  [itemId: string]: string | boolean;
}

export interface PreferencesPanelProps
  extends Omit<SerializablePreferencesPanel, "responseActions"> {
  className?: string;
  isLoading?: boolean;
  value?: PreferencesValue;
  onChange?: (value: PreferencesValue) => void;
  onSave?: (value: PreferencesValue) => void | Promise<void>;
  onCancel?: () => void;
  responseActions?: ActionsProp;
  onResponseAction?: (
    actionId: string,
    value: PreferencesValue,
  ) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export interface PreferencesPanelReceiptProps
  extends SerializablePreferencesPanelReceipt {
  className?: string;
}

export type PreferenceItem = z.infer<typeof PreferenceItemSchema>;
export type PreferenceSection = z.infer<typeof PreferenceSectionSchema>;
