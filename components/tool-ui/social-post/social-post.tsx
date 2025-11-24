"use client";

import * as React from "react";
import { cn } from "./_cn";
import { PLATFORM } from "./platform";
import { SocialPostProvider, type SocialPostContextValue } from "./context";
import type { SerializableSocialPost } from "./schema";
import type { SocialPostClientProps, SocialPostState } from "./context";
import { XRenderer } from "./renderers/x-renderer";
import { InstagramRenderer } from "./renderers/instagram-renderer";
import { LinkedInRenderer } from "./renderers/linkedin-renderer";
import { ActionButtons, normalizeActionsConfig } from "../shared";

export const DEFAULT_LOCALE = "en-US" as const;

const RENDERERS = {
  x: XRenderer,
  instagram: InstagramRenderer,
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
    footerActions,
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

  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(footerActions),
    [footerActions],
  );

  const handleFooterAction = React.useCallback(
    async (actionId: string) => {
      const proceed =
        (await onBeforeAction?.({
          action: actionId,
          post: postPayload,
          messageId: postPayload.messageId,
        })) ?? true;
      if (!proceed) return;
      onAction?.(actionId, postPayload, { messageId: postPayload.messageId });
    },
    [onAction, onBeforeAction, postPayload],
  );

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
    <div className={cn("flex flex-col gap-3", className)} style={maxWidth ? { maxWidth } : undefined}>
      <article
        className={cn(
          "text-card-foreground bg-background @container",
          cfg.tokens.radius,
          cfg.tokens.spacing.container,
          cfg.tokens.borders.container,
          cfg.tokens.borders.containerHover,
          cfg.tokens.borders.shadow,
          cfg.tokens.background.container,
          cfg.tokens.background.containerHover,
          variant === "inline" ? "rounded-none border-0 p-0" : "",
        )}
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
                <div className="bg-muted h-10 w-10 rounded-full" />
                <div className="bg-muted h-4 w-32 rounded" />
              </div>
              <div className="bg-muted mt-3 h-48 w-full rounded" />
            </div>
          ) : (
            <Renderer />
          )}
        </SocialPostProvider>
      </article>

      {normalizedFooterActions ? (
        <div className="mt-1">
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            layout={normalizedFooterActions.layout}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={handleFooterAction}
            onBeforeAction={undefined}
          />
        </div>
      ) : null}
    </div>
  );
}
