import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIRoleSchema,
} from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

export const MetadataItemSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export type MetadataItem = z.infer<typeof MetadataItemSchema>;

export const ApprovalDecisionSchema = z.enum(["approved", "denied"]);

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

export const SerializableApprovalCardSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),

  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  metadata: z.array(MetadataItemSchema).optional(),

  variant: z.enum(["default", "destructive"]).optional(),

  confirmLabel: z.string().optional(),
  cancelLabel: z.string().optional(),
});

export type SerializableApprovalCard = z.infer<
  typeof SerializableApprovalCardSchema
>;

export const SerializableApprovalCardReceiptSchema =
  SerializableApprovalCardSchema.extend({
    choice: ApprovalDecisionSchema,
  });

export type SerializableApprovalCardReceipt = z.infer<
  typeof SerializableApprovalCardReceiptSchema
>;

export function parseSerializableApprovalCard(
  input: unknown,
): SerializableApprovalCard {
  return parseWithSchema(SerializableApprovalCardSchema, input, "ApprovalCard");
}

export function parseSerializableApprovalCardReceipt(
  input: unknown,
): SerializableApprovalCardReceipt {
  return parseWithSchema(
    SerializableApprovalCardReceiptSchema,
    input,
    "ApprovalCardReceipt",
  );
}

export interface ApprovalCardProps extends SerializableApprovalCard {
  className?: string;
  isLoading?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
}

export interface ApprovalCardReceiptProps
  extends SerializableApprovalCardReceipt {
  className?: string;
}
