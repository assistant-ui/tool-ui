"use client";

import * as React from "react";
import { cn } from "./_cn";
import { PLATFORM } from "./platform";
import { SocialPostProvider, type SocialPostContextValue } from "./context";
import type { SerializableSocialPost } from "./schema";
import type { SocialPostClientProps, SocialPostState } from "./context";
import { XRenderer } from "./renderers/x-renderer";
import { InstagramRenderer } from "./renderers/instagram-renderer";
import { TikTokRenderer } from "./renderers/tiktok-renderer";
import { LinkedInRenderer } from "./renderers/linkedin-renderer";

export const DEFAULT_LOCALE = "en-US" as const;

const RENDERERS = {
  x: XRenderer,
  instagram: InstagramRenderer,
  tiktok: TikTokRenderer,
  linkedin: LinkedInRenderer,
} as const;

export type SocialPostProps = SerializableSocialPost & SocialPostClientProps;

export function SocialPost(props: SocialPostProps) {
  const {
    platform,
    className,
    isLoading,
    variant = "card",
    maxWidth,
    defaultState,
    state: controlledState,
    onStateChange,
    onBeforeAction,
    onAction,
    onEntityClick,
    onMediaEvent,
    onNavigate,
    allowExternalNavigation = true,
    actionOverrides = [],
    locale: explicitLocale,
    ...serializable
  } = props;

  const cfg = PLATFORM[platform];
  const locale = explicitLocale ?? DEFAULT_LOCALE;

  if (process.env.NODE_ENV !== "production") {
    serializable.media?.forEach((item, index) => {
      if (item.kind === "image" && (item.alt ?? "").trim() === "") {
        console.warn(
          `[SocialPost] Missing alt text on media[${index}] for post ${serializable.id}`,
        );
      }
    });
  }

  const [uncontrolledState, setUncontrolledState] =
    React.useState<SocialPostState>(
      serializable.initialState ?? defaultState ?? {},
    );

  const effectiveState = controlledState ?? uncontrolledState;

  const updateState = React.useCallback(
    (patch: Partial<SocialPostState>) => {
      if (controlledState) {
        const next = { ...controlledState, ...patch };
        onStateChange?.(next);
        return;
      }
      setUncontrolledState((prev) => {
        const next = { ...prev, ...patch };
        onStateChange?.(next);
        return next;
      });
    },
    [controlledState, onStateChange],
  );

  const postPayload = {
    ...serializable,
    platform,
    locale,
  } as SerializableSocialPost;

  const value: SocialPostContextValue = {
    post: postPayload,
    cfg,
    locale,
    state: effectiveState,
    allowExternalNavigation,
    actionOverrides,
    setState: updateState,
    handlers: {
      onBeforeAction,
      onAction,
      onEntityClick,
      onMediaEvent,
      onNavigate,
    },
  };

  const Renderer = RENDERERS[platform];

  return (
    <article
      className={cn(
        "text-card-foreground @container",
        cfg.tokens.radius,
        cfg.tokens.spacing.container,
        cfg.tokens.borders.container,
        cfg.tokens.borders.containerHover,
        cfg.tokens.borders.shadow,
        cfg.tokens.background.container,
        cfg.tokens.background.containerHover,
        variant === "inline" ? "rounded-none border-0 p-0" : "",
        className,
      )}
      style={maxWidth ? { maxWidth } : undefined}
      role="article"
      aria-labelledby={`post-${serializable.id}-author`}
      lang={serializable.language}
      dir={
        serializable.language?.startsWith("ar") ||
        serializable.language?.startsWith("he")
          ? "rtl"
          : undefined
      }
    >
      <SocialPostProvider value={value}>
        {isLoading ? (
          <div className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
            </div>
            <div className="mt-3 h-48 w-full rounded bg-muted" />
          </div>
        ) : (
          <Renderer />
        )}
      </SocialPostProvider>
    </article>
  );
}
