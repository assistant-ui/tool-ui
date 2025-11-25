import { z } from "zod";

export const xPostAuthorSchema = z.object({
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string().url(),
  verified: z.boolean().optional(),
});

export const xPostMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url(),
  alt: z.string(),
  aspectRatio: z.enum(["1:1", "4:3", "16:9", "9:16"]).optional(),
});

export const xPostLinkPreviewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  domain: z.string().optional(),
});

export const xPostStatsSchema = z.object({
  likes: z.number().optional(),
});

export interface XPostData {
  id: string;
  author: z.infer<typeof xPostAuthorSchema>;
  text?: string;
  media?: z.infer<typeof xPostMediaSchema>[];
  linkPreview?: z.infer<typeof xPostLinkPreviewSchema>;
  quotedPost?: XPostData;
  stats?: z.infer<typeof xPostStatsSchema>;
  createdAt?: string;
}

export const xPostSchema: z.ZodType<XPostData> = z.object({
  id: z.string(),
  author: xPostAuthorSchema,
  text: z.string().optional(),
  media: z.array(xPostMediaSchema).optional(),
  linkPreview: xPostLinkPreviewSchema.optional(),
  quotedPost: z.lazy(() => xPostSchema).optional(),
  stats: xPostStatsSchema.optional(),
  createdAt: z.string().optional(),
});
export type XPostAuthor = z.infer<typeof xPostAuthorSchema>;
export type XPostMedia = z.infer<typeof xPostMediaSchema>;
export type XPostLinkPreview = z.infer<typeof xPostLinkPreviewSchema>;
export type XPostStats = z.infer<typeof xPostStatsSchema>;

export function parseXPost(input: unknown): XPostData {
  return xPostSchema.parse(input);
}
