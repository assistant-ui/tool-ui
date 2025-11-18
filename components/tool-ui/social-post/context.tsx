"use client";
import * as React from "react";
import type { ReactNode } from "react";
import type { SerializableSocialPost } from "./schema";
import type { PlatformConfig } from "./platform";

export interface SocialPostState {
  liked?: boolean;
  reposted?: boolean;
  saved?: boolean;
  following?: boolean;
  expanded?: boolean;
  muted?: boolean;
}

export interface SocialPostActionOverride {
  id: string;
  label?: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  icon?: ReactNode;
  srLabel?: string;
  hotkey?: string;
  onClick?: (post: SerializableSocialPost) => void;
}

export interface SocialPostClientProps {
  isLoading?: boolean;
  className?: string;
  variant?: "card" | "inline";
  maxWidth?: string;
  allowExternalNavigation?: boolean;
  actionOverrides?: SocialPostActionOverride[];
  defaultState?: SocialPostState;
  state?: SocialPostState;
  onStateChange?: (next: SocialPostState) => void;
  onBeforeAction?: (args: {
    action: string;
    post: SerializableSocialPost;
    messageId?: string;
  }) => boolean | Promise<boolean>;
  onAction?: (
    action: string,
    post: SerializableSocialPost,
    ctx?: { messageId?: string },
  ) => void;
  onEntityClick?: (type: "mention" | "hashtag" | "url", value: string) => void;
  onMediaEvent?: (type: "open" | "play" | "pause", payload?: unknown) => void;
  onNavigate?: (href: string, post: SerializableSocialPost) => void;
}

export interface SocialPostContextValue {
  post: SerializableSocialPost;
  cfg: PlatformConfig;
  locale: string;
  state: SocialPostState;
  allowExternalNavigation: boolean;
  actionOverrides: SocialPostActionOverride[];
  setState: (patch: Partial<SocialPostState>) => void;
  handlers: Pick<
    SocialPostClientProps,
    | "onBeforeAction"
    | "onAction"
    | "onEntityClick"
    | "onMediaEvent"
    | "onNavigate"
  >;
}

const Ctx = React.createContext<SocialPostContextValue | null>(null);
export function useSocialPost() {
  const value = React.useContext(Ctx);
  if (!value) {
    throw new Error("useSocialPost must be used within <SocialPostProvider />");
  }
  return value;
}

export function SocialPostProvider({
  value,
  children,
}: {
  value: SocialPostContextValue;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
