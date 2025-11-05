import type { Platform } from "./schema";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Repeat2, Heart, Share, Bookmark, MoreHorizontal, Send } from "lucide-react";

export interface PlatformTypography {
  name: string;
  handle: string;
  body: string;
  stats: string;
  bodyLineHeight: string;
}

export interface PlatformSpacing {
  container: string;
  gap: string;
  avatarSize: string;
  actionGap: string;
}

export interface PlatformBorders {
  container: string;
  containerHover: string;
  media: string;
  shadow: string;
}

export interface PlatformBackground {
  container: string;
  containerHover: string;
  actionHover: string;
}

export interface PlatformTokens {
  accent: string;
  verified: string;
  radius: string;
  muted: string;
  actionHover: string;
  avatarShape?: "circle" | "rounded" | "square";
  actionLayout?: "row" | "right-rail";
  typography: PlatformTypography;
  spacing: PlatformSpacing;
  borders: PlatformBorders;
  background: PlatformBackground;
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

export interface PlatformActionConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  hoverColor?: string;
}

export interface PlatformConfig {
  name: Platform;
  tokens: PlatformTokens;
  layout: PlatformLayout;
  actions: Record<string, string>;
  actionConfigs?: PlatformActionConfig[];
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
      typography: {
        name: "text-[15px] font-semibold",
        handle: "text-[15px] text-muted-foreground",
        body: "text-[15px] leading-snug",
        stats: "text-[13px] text-muted-foreground",
        bodyLineHeight: "leading-snug",
      },
      spacing: {
        container: "p-3",
        gap: "gap-2",
        avatarSize: "w-10 h-10",
        actionGap: "gap-12",
      },
      borders: {
        container: "border border-transparent",
        containerHover: "hover:border-border",
        media: "rounded-2xl overflow-hidden",
        shadow: "hover:shadow-sm",
      },
      background: {
        container: "bg-card",
        containerHover: "hover:bg-muted/50 transition-colors",
        actionHover: "hover:bg-blue-500/10",
      },
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
    actionConfigs: [
      { id: "reply", label: "Reply", icon: MessageCircle, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "repost", label: "Repost", icon: Repeat2, hoverColor: "hover:bg-green-500/10 hover:text-green-500" },
      { id: "like", label: "Like", icon: Heart, hoverColor: "hover:bg-red-500/10 hover:text-red-500" },
      { id: "share", label: "Share", icon: Share, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "bookmark", label: "Bookmark", icon: Bookmark, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "menu", label: "More", icon: MoreHorizontal, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
    ],
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
      typography: {
        name: "text-[14px] font-semibold",
        handle: "text-[14px] text-muted-foreground",
        body: "text-[14px] leading-relaxed",
        stats: "text-[14px] font-semibold",
        bodyLineHeight: "leading-relaxed",
      },
      spacing: {
        container: "p-0",
        gap: "gap-3",
        avatarSize: "w-8 h-8",
        actionGap: "gap-4",
      },
      borders: {
        container: "border-0",
        containerHover: "",
        media: "rounded-none",
        shadow: "",
      },
      background: {
        container: "bg-card",
        containerHover: "",
        actionHover: "hover:opacity-60 transition-opacity",
      },
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
    actionConfigs: [
      { id: "like", label: "Like", icon: Heart, hoverColor: "hover:opacity-60" },
      { id: "comment", label: "Comment", icon: MessageCircle, hoverColor: "hover:opacity-60" },
      { id: "share", label: "Share", icon: Send, hoverColor: "hover:opacity-60" },
      { id: "save", label: "Save", icon: Bookmark, hoverColor: "hover:opacity-60" },
      { id: "menu", label: "More", icon: MoreHorizontal, hoverColor: "hover:opacity-60" },
    ],
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
      typography: {
        name: "text-[16px] font-bold",
        handle: "text-[14px] text-muted-foreground",
        body: "text-[16px] leading-snug font-medium",
        stats: "text-[12px] font-semibold",
        bodyLineHeight: "leading-snug",
      },
      spacing: {
        container: "p-2",
        gap: "gap-2",
        avatarSize: "w-10 h-10",
        actionGap: "gap-3",
      },
      borders: {
        container: "border-0",
        containerHover: "",
        media: "rounded-lg",
        shadow: "shadow-lg",
      },
      background: {
        container: "bg-card",
        containerHover: "",
        actionHover: "hover:opacity-70 transition-opacity",
      },
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
      typography: {
        name: "text-[14px] font-semibold",
        handle: "text-[12px] text-muted-foreground",
        body: "text-[14px] leading-relaxed",
        stats: "text-[12px] text-muted-foreground",
        bodyLineHeight: "leading-relaxed",
      },
      spacing: {
        container: "p-4",
        gap: "gap-3",
        avatarSize: "w-12 h-12",
        actionGap: "gap-2",
      },
      borders: {
        container: "border border-border/50",
        containerHover: "",
        media: "rounded-lg overflow-hidden",
        shadow: "shadow-sm",
      },
      background: {
        container: "bg-card",
        containerHover: "",
        actionHover: "hover:bg-muted/80",
      },
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
