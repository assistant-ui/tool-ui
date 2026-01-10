import { z } from "zod";
import type { ActionsProp } from "../shared";
import {
  ToolUIIdSchema,
  ToolUIRoleSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  parseWithSchema,
} from "../shared";

export const SliderConfigSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  min: z.number(),
  max: z.number(),
  step: z.number().positive().optional(),
  value: z.number(),
  unit: z.string().optional(),
  precision: z.number().int().min(0).optional(),
  trackClassName: z.string().optional(),
  fillClassName: z.string().optional(),
  handleClassName: z.string().optional(),
});

export type SliderConfig = z.infer<typeof SliderConfigSchema>;

export const SerializableParameterSliderSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  sliders: z.array(SliderConfigSchema).min(1),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
});

export type SerializableParameterSlider = z.infer<
  typeof SerializableParameterSliderSchema
>;

export function parseSerializableParameterSlider(
  input: unknown,
): SerializableParameterSlider {
  return parseWithSchema(
    SerializableParameterSliderSchema,
    input,
    "ParameterSlider",
  );
}

export interface SliderValue {
  id: string;
  value: number;
}

export interface ParameterSliderProps
  extends Omit<SerializableParameterSlider, "responseActions"> {
  className?: string;
  isLoading?: boolean;
  values?: SliderValue[];
  onChange?: (values: SliderValue[]) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (
    actionId: string,
    values: SliderValue[],
  ) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
  trackClassName?: string;
  fillClassName?: string;
  handleClassName?: string;
}
