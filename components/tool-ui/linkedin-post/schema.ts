import { z } from "zod";
import { parseWithSchema } from "../shared";

export const LinkedInPostAuthorSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
  headline: z.string().optional(),
});

export const LinkedInPostMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
  alt: z.string(),
});

export const LinkedInPostLinkPreviewSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  domain: z.string().optional(),
});

export const LinkedInPostStatsSchema = z.object({
  likes: z.number().optional(),
  isLiked: z.boolean().optional(),
});

export interface LinkedInPostData {
  id: string;
  author: z.infer<typeof LinkedInPostAuthorSchema>;
  text?: string;
  media?: z.infer<typeof LinkedInPostMediaSchema>[];
  linkPreview?: z.infer<typeof LinkedInPostLinkPreviewSchema>;
  stats?: z.infer<typeof LinkedInPostStatsSchema>;
  createdAt?: string;
}

export const SerializableLinkedInPostSchema: z.ZodType<LinkedInPostData> =
  z.object({
    id: z.string(),
    author: LinkedInPostAuthorSchema,
    text: z.string().optional(),
    media: z.array(LinkedInPostMediaSchema).optional(),
    linkPreview: LinkedInPostLinkPreviewSchema.optional(),
    stats: LinkedInPostStatsSchema.optional(),
    createdAt: z.string().optional(),
  });

export type LinkedInPostAuthor = z.infer<typeof LinkedInPostAuthorSchema>;
export type LinkedInPostMedia = z.infer<typeof LinkedInPostMediaSchema>;
export type LinkedInPostLinkPreview = z.infer<
  typeof LinkedInPostLinkPreviewSchema
>;
export type LinkedInPostStats = z.infer<typeof LinkedInPostStatsSchema>;

export function parseSerializableLinkedInPost(
  input: unknown,
): LinkedInPostData {
  return parseWithSchema(SerializableLinkedInPostSchema, input, "LinkedInPost");
}
