import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  parseWithSchema,
} from "../shared";

export const mediaKind = z.enum(["image", "video", "audio", "link"]);
export type MediaCardKind = z.infer<typeof mediaKind>;

export const aspect = z
  .enum(["auto", "1:1", "4:3", "16:9", "9:16"])
  .default("auto");
export type Aspect = z.infer<typeof aspect>;

export const fit = z.enum(["cover", "contain"]).default("cover");
export type Fit = z.infer<typeof fit>;

export const SerializableMediaCardSchema = z
  .object({
    /**
     * Unique identifier for this tool UI instance in the conversation.
     *
     * Used for:
     * - Assistant referencing ("the image above")
     * - Receipt generation (linking actions to their source)
     * - Narration context
     *
     * Should be stable across re-renders, meaningful, and unique within the conversation.
     *
     * @example "media-card-hero-image", "link-preview-article-123"
     */
    id: ToolUIIdSchema,
    role: ToolUIRoleSchema.optional(),
    receipt: ToolUIReceiptSchema.optional(),
    /**
     * The media asset's persistent identifier (e.g., database ID, CDN asset ID, URL hash).
     *
     * Used for:
     * - Caching and deduplication
     * - Tracking the same asset across multiple surfaces
     * - Backend references
     *
     * @example "asset-img-12345", "cdn-video-abc", "url-hash-xyz"
     */
    assetId: z.string(),
    kind: mediaKind,
    title: z.string().optional(),
    description: z.string().optional(),
    createdAtISO: z.string().datetime().optional(),
    locale: z.string().optional(),
    href: z.string().url().optional(),
    domain: z.string().optional(),
    source: z
      .object({
        label: z.string(),
        iconUrl: z.string().url().optional(),
        url: z.string().url().optional(),
      })
      .optional(),
    ratio: aspect.optional(),
    fit: fit.optional(),
    src: z.string().url().optional(),
    thumb: z.string().url().optional(),
    alt: z.string().optional(),
    durationMs: z.number().int().positive().optional(),
    fileSizeBytes: z.number().int().positive().optional(),
    og: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "image" && !(value.alt && value.alt.trim())) {
      ctx.addIssue({
        code: "custom",
        message: "Images require alt text.",
      });
    }
    if (
      (value.kind === "image" ||
        value.kind === "video" ||
        value.kind === "audio") &&
      !value.src
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${value.kind} requires src.`,
      });
    }
    if (value.kind === "link" && !value.href && !value.src) {
      ctx.addIssue({
        code: "custom",
        message: "link requires href or src.",
      });
    }
  });

export type SerializableMediaCard = z.infer<typeof SerializableMediaCardSchema>;

export function parseSerializableMediaCard(input: unknown) {
  return parseWithSchema(SerializableMediaCardSchema, input, "MediaCard");
}
