import type { Platform } from "./schema";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Repeat2, Heart, Share, Bookmark, MoreHorizontal, Send, BarChart3 } from "lucide-react";

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
  brandColor: string;
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
      brandColor: "#0F1419",
      avatarShape: "circle",
      actionLayout: "row",
      typography: {
        name: "text-base font-semibold",
        handle: "text-base text-muted-foreground",
        body: "text-base leading-snug",
        stats: "text-xs text-muted-foreground",
        bodyLineHeight: "leading-snug",
      },
      spacing: {
        container: "p-3",
        gap: "gap-2",
        avatarSize: "w-10 h-10",
        actionGap: "gap-12",
      },
      borders: {
        container: "border border-border",
        containerHover: "",
        media: "rounded-2xl overflow-hidden",
        shadow: "shadow-xs",
      },
      background: {
        container: "bg-card",
        containerHover: "",
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
      views: "Views",
      bookmark: "Bookmark",
      share: "Share",
      menu: "More",
    },
    actionConfigs: [
      { id: "reply", label: "Reply", icon: MessageCircle, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "repost", label: "Repost", icon: Repeat2, hoverColor: "hover:bg-green-500/10 hover:text-green-500" },
      { id: "like", label: "Like", icon: Heart, hoverColor: "hover:bg-red-500/10 hover:text-red-500" },
      { id: "views", label: "Views", icon: BarChart3, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "bookmark", label: "Bookmark", icon: Bookmark, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
      { id: "share", label: "Share", icon: Share, hoverColor: "hover:bg-blue-500/10 hover:text-blue-500" },
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
      brandColor: "#C13584",
      avatarShape: "circle",
      actionLayout: "row",
      typography: {
        name: "text-sm font-semibold",
        handle: "text-sm text-muted-foreground",
        body: "text-sm leading-relaxed",
        stats: "text-sm font-semibold",
        bodyLineHeight: "leading-relaxed",
      },
      spacing: {
        container: "p-0",
        gap: "gap-3",
        avatarSize: "w-8 h-8",
        actionGap: "gap-4",
      },
      borders: {
        container: "border border-border",
        containerHover: "",
        media: "rounded-none",
        shadow: "shadow-xs",
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
      brandColor: "#EE1D52",
      avatarShape: "circle",
      actionLayout: "right-rail",
      typography: {
        name: "text-lg font-bold",
        handle: "text-base text-muted-foreground",
        body: "text-lg leading-snug font-medium",
        stats: "text-xs font-semibold",
        bodyLineHeight: "leading-snug",
      },
      spacing: {
        container: "p-2",
        gap: "gap-2",
        avatarSize: "w-10 h-10",
        actionGap: "gap-3",
      },
      borders: {
        container: "border border-border",
        containerHover: "",
        media: "rounded-lg",
        shadow: "shadow-xs",
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
      brandColor: "#0A66C2",
      avatarShape: "rounded",
      actionLayout: "row",
      typography: {
        name: "text-sm font-semibold",
        handle: "text-xs text-muted-foreground",
        body: "text-sm leading-relaxed",
        stats: "text-xs text-muted-foreground",
        bodyLineHeight: "leading-relaxed",
      },
      spacing: {
        container: "p-4",
        gap: "gap-3",
        avatarSize: "w-12 h-12",
        actionGap: "gap-2",
      },
      borders: {
        container: "border border-border",
        containerHover: "",
        media: "rounded-lg overflow-hidden",
        shadow: "shadow-xs",
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
      share: "Share",
    },
    actionConfigs: [
      {
        id: "like",
        label: "Like",
        icon: Heart,
        hoverColor: "hover:bg-blue-500/10 hover:text-blue-600",
      },
      {
        id: "share",
        label: "Share",
        icon: Share,
        hoverColor: "hover:bg-blue-500/10 hover:text-blue-600",
      },
    ],
  },
};
