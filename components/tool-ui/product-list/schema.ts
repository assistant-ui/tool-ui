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
  image: z.url().optional(),
  color: z.string().optional(),
  actions: z.array(ActionSchema).optional(),
});

export const ProductListPropsSchema = z.object({
  id: ToolUIIdSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  products: z.array(ProductSchema),
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
  products: z.array(SerializableProductSchema),
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
