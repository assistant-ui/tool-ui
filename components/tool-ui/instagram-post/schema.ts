import { z } from "zod";

export const instagramPostAuthorSchema = z.object({
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string(),
  verified: z.boolean().optional(),
});

export const instagramPostMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string(),
  alt: z.string(),
});

export const instagramPostStatsSchema = z.object({
  likes: z.number().optional(),
});

export interface InstagramPostData {
  id: string;
  author: z.infer<typeof instagramPostAuthorSchema>;
  text?: string;
  media?: z.infer<typeof instagramPostMediaSchema>[];
  stats?: z.infer<typeof instagramPostStatsSchema>;
  createdAt?: string;
}

export const instagramPostSchema: z.ZodType<InstagramPostData> = z.object({
  id: z.string(),
  author: instagramPostAuthorSchema,
  text: z.string().optional(),
  media: z.array(instagramPostMediaSchema).optional(),
  stats: instagramPostStatsSchema.optional(),
  createdAt: z.string().optional(),
});

export type InstagramPostAuthor = z.infer<typeof instagramPostAuthorSchema>;
export type InstagramPostMedia = z.infer<typeof instagramPostMediaSchema>;
export type InstagramPostStats = z.infer<typeof instagramPostStatsSchema>;

export function parseInstagramPost(input: unknown): InstagramPostData {
  return instagramPostSchema.parse(input);
}
