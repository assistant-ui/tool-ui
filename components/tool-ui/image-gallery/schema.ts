import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

export const ImageGallerySourceSchema = z.object({
  label: z.string(),
  url: z.string().url().optional(),
});

export type ImageGallerySource = z.infer<typeof ImageGallerySourceSchema>;

export const ImageGalleryItemSchema = z.object({
  id: z.string().min(1),
  src: z.string().url(),
  alt: z.string().min(1, "Images require alt text for accessibility"),
  width: z.number().positive(),
  height: z.number().positive(),
  title: z.string().optional(),
  caption: z.string().optional(),
  source: ImageGallerySourceSchema.optional(),
});

export type ImageGalleryItem = z.infer<typeof ImageGalleryItemSchema>;

export const SerializableImageGallerySchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  images: z.array(ImageGalleryItemSchema).min(1),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type SerializableImageGallery = z.infer<
  typeof SerializableImageGallerySchema
>;

export interface ImageGalleryProps extends SerializableImageGallery {
  className?: string;
  onImageClick?: (imageId: string, image: ImageGalleryItem) => void;
}

export function parseSerializableImageGallery(
  input: unknown,
): SerializableImageGallery {
  return parseWithSchema(SerializableImageGallerySchema, input, "ImageGallery");
}
