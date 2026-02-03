import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const PricingSchema = z.object({
  subtotal: z.number(),
  tax: z.number().optional(),
  taxLabel: z.string().optional(),
  shipping: z.number().optional(),
  discount: z.number().optional(),
  discountLabel: z.string().optional(),
  total: z.number(),
  currency: z.string().optional(),
});

export type Pricing = z.infer<typeof PricingSchema>;

export const OrderDecisionSchema = z.object({
  action: z.literal("confirm"),
  orderId: z.string().optional(),
  confirmedAt: z.string().datetime().optional(),
});

export type OrderDecision = z.infer<typeof OrderDecisionSchema>;

export const SerializableOrderSummarySchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  title: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  pricing: PricingSchema,
  choice: OrderDecisionSchema.optional(),
});

export type SerializableOrderSummary = z.infer<
  typeof SerializableOrderSummarySchema
>;

export function parseSerializableOrderSummary(
  input: unknown
): SerializableOrderSummary {
  return parseWithSchema(SerializableOrderSummarySchema, input, "OrderSummary");
}

export interface OrderSummaryProps extends SerializableOrderSummary {
  className?: string;
  responseActions?: Array<{
    id: string;
    label: string;
    variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  onResponseAction?: (actionId: string) => void;
}
