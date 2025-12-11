import { z } from "zod";
import {
  ActionSchema,
  SerializableActionSchema,
  ToolUIIdSchema,
} from "../shared";

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1),
  image: z.string().url(),
  available: z.boolean().optional(),
  actions: z.array(ActionSchema).optional(),
});

export const ProductListPropsSchema = z.object({
  id: ToolUIIdSchema,
  products: z.array(ProductSchema).min(1),
  className: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export type ProductListProps = z.infer<typeof ProductListPropsSchema> & {
  onProductClick?: (productId: string) => void;
  onProductAction?: (productId: string, actionId: string) => void;
};

export const SerializableProductSchema = ProductSchema.extend({
  actions: z.array(SerializableActionSchema).optional(),
});

export const SerializableProductListSchema = ProductListPropsSchema.extend({
  products: z.array(SerializableProductSchema).min(1),
});

export type SerializableProduct = z.infer<typeof SerializableProductSchema>;
export type SerializableProductList = z.infer<
  typeof SerializableProductListSchema
>;

export function parseSerializableProductList(
  input: unknown,
): SerializableProductList {
  const res = SerializableProductListSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid ProductList payload: ${res.error.message}`);
  }
  return res.data;
}
