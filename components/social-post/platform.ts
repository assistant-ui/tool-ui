import type { Platform } from "./schema";

export interface PlatformTokens {
  accent: string;
  verified: string;
  radius: string;
  muted: string;
  actionHover: string;
  avatarShape?: "circle" | "rounded" | "square";
  actionLayout?: "row" | "right-rail";
}

export interface PlatformLayout {
  mediaStrategy: "grid" | "single" | "verticalVideo";
  defaultAspect?: "1:1" | "4:3" | "16:9" | "9:16" | "3:4";
  showLinkPreview?: boolean;
  showViews?: boolean;
  showFollowInHeader?: boolean;
  showHandleWithAt?: boolean;
  contentMaxLines?: number;
}

export interface PlatformConfig {
  name: Platform;
  tokens: PlatformTokens;
  layout: PlatformLayout;
  actions: Record<string, string>;
}

export const PLATFORM: Record<Platform, PlatformConfig> = {
  x: {
    name: "x",
    tokens: {
      accent: "text-blue-500 dark:text-blue-400",
      verified: "text-blue-500",
      radius: "rounded-xl",
      muted: "text-muted-foreground",
      actionHover: "hover:bg-muted",
      avatarShape: "circle",
      actionLayout: "row",
    },
    layout: {
      mediaStrategy: "single",
      defaultAspect: "16:9",
      showLinkPreview: true,
      showViews: true,
      showFollowInHeader: false,
      showHandleWithAt: true,
      contentMaxLines: 8,
    },
    actions: {
      reply: "Reply",
      repost: "Repost",
      like: "Like",
      share: "Share",
      bookmark: "Bookmark",
      menu: "More",
    },
  },
  instagram: {
    name: "instagram",
    tokens: {
      accent: "text-pink-500 dark:text-pink-400",
      verified: "text-sky-500",
      radius: "rounded-lg",
      muted: "text-muted-foreground",
      actionHover: "hover:opacity-80",
      avatarShape: "circle",
      actionLayout: "row",
    },
    layout: {
      mediaStrategy: "grid",
      defaultAspect: "1:1",
      showLinkPreview: false,
      showViews: false,
      showFollowInHeader: true,
      showHandleWithAt: false,
      contentMaxLines: 6,
    },
    actions: {
      like: "Like",
      comment: "Comment",
      share: "Share",
      save: "Save",
      menu: "More",
    },
  },
  tiktok: {
    name: "tiktok",
    tokens: {
      accent: "text-rose-500 dark:text-rose-400",
      verified: "text-rose-500",
      radius: "rounded-none",
      muted: "text-muted-foreground",
      actionHover: "hover:opacity-80",
      avatarShape: "circle",
      actionLayout: "row",
    },
    layout: {
      mediaStrategy: "verticalVideo",
      defaultAspect: "9:16",
      showLinkPreview: false,
      showViews: true,
      showFollowInHeader: true,
      showHandleWithAt: false,
      contentMaxLines: 5,
    },
    actions: {
      like: "Like",
      comment: "Comment",
      share: "Share",
      follow: "Follow",
      menu: "More",
    },
  },
  linkedin: {
    name: "linkedin",
    tokens: {
      accent: "text-blue-600 dark:text-blue-400",
      verified: "text-blue-600",
      radius: "rounded-lg",
      muted: "text-muted-foreground",
      actionHover: "hover:bg-muted",
      avatarShape: "rounded",
      actionLayout: "row",
    },
    layout: {
      mediaStrategy: "single",
      defaultAspect: "16:9",
      showLinkPreview: true,
      showViews: false,
      showFollowInHeader: false,
      showHandleWithAt: false,
      contentMaxLines: 12,
    },
    actions: {
      like: "Like",
      comment: "Comment",
      repost: "Repost",
      send: "Send",
      menu: "More",
    },
  },
};
