import { z } from "zod";

export const linkedInPostAuthorSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
  headline: z.string().optional(),
});

export const linkedInPostMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
  alt: z.string(),
});

export const linkedInPostLinkPreviewSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  domain: z.string().optional(),
});

export const linkedInPostStatsSchema = z.object({
  likes: z.number().optional(),
});

export interface LinkedInPostData {
  id: string;
  author: z.infer<typeof linkedInPostAuthorSchema>;
  text?: string;
  media?: z.infer<typeof linkedInPostMediaSchema>[];
  linkPreview?: z.infer<typeof linkedInPostLinkPreviewSchema>;
  stats?: z.infer<typeof linkedInPostStatsSchema>;
  createdAt?: string;
}

export const linkedInPostSchema: z.ZodType<LinkedInPostData> = z.object({
  id: z.string(),
  author: linkedInPostAuthorSchema,
  text: z.string().optional(),
  media: z.array(linkedInPostMediaSchema).optional(),
  linkPreview: linkedInPostLinkPreviewSchema.optional(),
  stats: linkedInPostStatsSchema.optional(),
  createdAt: z.string().optional(),
});

export type LinkedInPostAuthor = z.infer<typeof linkedInPostAuthorSchema>;
export type LinkedInPostMedia = z.infer<typeof linkedInPostMediaSchema>;
export type LinkedInPostLinkPreview = z.infer<typeof linkedInPostLinkPreviewSchema>;
export type LinkedInPostStats = z.infer<typeof linkedInPostStatsSchema>;

export function parseLinkedInPost(input: unknown): LinkedInPostData {
  return linkedInPostSchema.parse(input);
}
