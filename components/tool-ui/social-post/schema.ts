import { z } from "zod";

export const platformEnum = z.enum(["x", "instagram", "linkedin"]);
export type Platform = z.infer<typeof platformEnum>;

export const aspectEnum = z
  .enum(["1:1", "4:3", "16:9", "9:16", "3:4"])
  .optional();

export const authorSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  avatarUrl: z.string().url(),
  verified: z.boolean().optional(),
  subtitle: z.string().optional(),
});

export const mediaItemSchema = z
  .object({
    kind: z.enum(["image", "video"]),
    url: z.string().url(),
    thumbUrl: z.string().url().optional(),
    alt: z.string().optional(),
    aspectHint: aspectEnum,
  })
  .superRefine((item, ctx) => {
    if (item.kind === "image" && !(item.alt && item.alt.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Images require alt text for accessibility.",
      });
    }
  });

export const linkPreviewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  domain: z.string().optional(),
});

export const statsSchema = z.object({
  likes: z.number().optional(),
  comments: z.number().optional(),
  reposts: z.number().optional(),
  shares: z.number().optional(),
  bookmarks: z.number().optional(),
  views: z.number().optional(),
});

export const entitiesSchema = z
  .object({
    mentions: z.array(z.string()).optional(),
    hashtags: z.array(z.string()).optional(),
    urls: z.array(z.string().url()).optional(),
  })
  .optional();

export const initialStateSchema = z
  .object({
    liked: z.boolean().optional(),
    reposted: z.boolean().optional(),
    saved: z.boolean().optional(),
    following: z.boolean().optional(),
    expanded: z.boolean().optional(),
    muted: z.boolean().optional(),
  })
  .optional();

export const actionSchema = z.object({
  id: z.string(),
  label: z.string(),
  variant: z.enum(["default", "secondary", "ghost", "destructive"]).optional(),
});

export const serializableSocialPostSchema: z.ZodType<SerializableSocialPost> =
  z.lazy(() =>
    z.object({
      id: z.string(),
      platform: platformEnum,
      author: authorSchema,
      text: z.string().optional(),
      entities: entitiesSchema,
      media: z.array(mediaItemSchema).optional(),
      linkPreview: linkPreviewSchema.optional(),
      quotedPost: serializableSocialPostSchema.optional(),
      stats: statsSchema.optional(),
      initialState: initialStateSchema,
      actions: z.array(actionSchema).optional(),
      createdAtISO: z.string().datetime().optional(),
      sourceUrl: z.string().url().optional(),
      visibility: z.enum(["public", "unlisted"]).optional(),
      language: z.string().optional(),
      locale: z.string().optional(),
      compact: z.boolean().optional(),
      messageId: z.string().optional(),
    }),
  );

export interface SerializableSocialPost {
  id: string;
  platform: Platform;
  author: z.infer<typeof authorSchema>;
  text?: string;
  entities?: z.infer<typeof entitiesSchema>;
  media?: z.infer<typeof mediaItemSchema>[];
  linkPreview?: z.infer<typeof linkPreviewSchema>;
  quotedPost?: SerializableSocialPost;
  stats?: z.infer<typeof statsSchema>;
  initialState?: z.infer<typeof initialStateSchema>;
  actions?: z.infer<typeof actionSchema>[];
  createdAtISO?: string;
  sourceUrl?: string;
  visibility?: "public" | "unlisted";
  language?: string;
  locale?: string;
  compact?: boolean;
  messageId?: string;
}

export function parseSerializableSocialPost(
  input: unknown,
): SerializableSocialPost {
  const res = serializableSocialPostSchema.safeParse(input);
  if (!res.success) {
    throw new Error(`Invalid SocialPost payload: ${res.error.message}`);
  }
  return res.data;
}
