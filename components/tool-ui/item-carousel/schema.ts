import { z } from "zod";
import {
  ActionSchema,
  SerializableActionSchema,
  ToolUIIdSchema,
} from "../shared";

export const ItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  subtitle: z.string().optional(),
  image: z.url().optional(),
  color: z.string().optional(),
  actions: z.array(ActionSchema).optional(),
});

export const ItemCarouselPropsSchema = z.object({
  id: ToolUIIdSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(ItemSchema),
  className: z.string().optional(),
});

export type Item = z.infer<typeof ItemSchema>;

export type ItemCarouselProps = z.infer<typeof ItemCarouselPropsSchema> & {
  onItemClick?: (itemId: string) => void;
  onItemAction?: (itemId: string, actionId: string) => void;
};

export const SerializableItemSchema = ItemSchema.extend({
  actions: z.array(SerializableActionSchema).optional(),
});

export const SerializableItemCarouselSchema = ItemCarouselPropsSchema.extend({
  items: z.array(SerializableItemSchema),
});

export type SerializableItem = z.infer<typeof SerializableItemSchema>;
export type SerializableItemCarousel = z.infer<
  typeof SerializableItemCarouselSchema
>;

export function parseSerializableItemCarousel(
  input: unknown,
): SerializableItemCarousel {
  const res = SerializableItemCarouselSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid ItemCarousel payload: ${res.error.message}`);
  }
  return res.data;
}
