"use client";

import * as React from "react";
import { cn } from "./_cn";
import { Card } from "./_ui";
import {
  MediaCardProvider,
  type MediaCardClientProps,
  type MediaCardContextValue,
  type MediaCardUIState,
} from "./context";
import type { SerializableMediaCard } from "./schema";
import { MediaCardHeader } from "./header";
import { MediaFrame } from "./frame";
import { MediaCardBody } from "./body";
import { MediaCardFooter } from "./footer";
import { LinkOverlay } from "./link-overlay";
import { MediaCardProgress } from "./progress";

const BASE_CARD_STYLE = "border border-border bg-card text-sm shadow-xs";
const DEFAULT_CONTENT_SPACING = "gap-4 p-5";
const LINK_CONTENT_SPACING = "px-5 py-4 gap-3";

export const DEFAULT_LOCALE = "en-US" as const;

export type MediaCardProps = SerializableMediaCard & MediaCardClientProps;

function sanitizeHref(href?: string) {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function MediaCard(props: MediaCardProps) {
  const {
    className,
    maxWidth,
    isLoading,
    state: controlledState,
    defaultState,
    onStateChange,
    onNavigate,
    onAction,
    onBeforeAction,
    onMediaEvent,
    locale: providedLocale,
    ...serializable
  } = props;

  const { href: rawHref, source, ...rest } = serializable;
  const locale = providedLocale ?? DEFAULT_LOCALE;

  const sanitizedHref = sanitizeHref(rawHref);
  const sanitizedSourceUrl = sanitizeHref(source?.url);

  const cardPayload: SerializableMediaCard = {
    ...rest,
    href: sanitizedHref,
    source: source
      ? {
          ...source,
          url: sanitizedSourceUrl,
        }
      : undefined,
    locale,
  };

  if (process.env.NODE_ENV !== "production" && cardPayload.kind === "image") {
    if (!(cardPayload.alt && cardPayload.alt.trim())) {
      console.warn(
        `[MediaCard] Missing alt text for image card ${cardPayload.id}`,
      );
    }
  }

  const [uncontrolledState, setUncontrolledState] =
    React.useState<MediaCardUIState>(() => defaultState ?? {});
  const effectiveState = controlledState ?? uncontrolledState;

  const updateState = React.useCallback(
    (patch: Partial<MediaCardUIState>) => {
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

  const [mediaElement, setMediaElement] =
    React.useState<HTMLMediaElement | null>(null);

  const resolvedHref = React.useMemo(() => {
    if (cardPayload.kind === "link") {
      return cardPayload.href ?? sanitizeHref(cardPayload.src);
    }
    return cardPayload.href;
  }, [cardPayload.href, cardPayload.kind, cardPayload.src]);

  const value: MediaCardContextValue = {
    card: cardPayload,
    locale,
    resolvedHref,
    resolvedSourceUrl: sanitizedSourceUrl,
    state: effectiveState,
    setState: updateState,
    handlers: {
      onNavigate,
      onAction,
      onBeforeAction,
      onMediaEvent,
    },
    mediaElement,
    setMediaElement,
  };

  const containerStyle: React.CSSProperties = maxWidth
    ? { maxWidth, width: "100%" }
    : { width: "100%" };

  const isImageCard = cardPayload.kind === "image";
  const isVideoCard = cardPayload.kind === "video";
  const isAudioCard = cardPayload.kind === "audio";
  const isLinkCard = cardPayload.kind === "link";
  const cardSpacingClass =
    isImageCard || isVideoCard || isLinkCard || isAudioCard
      ? "p-0"
      : DEFAULT_CONTENT_SPACING;
  const linkContentPadding = LINK_CONTENT_SPACING;

  return (
    <article
      className="relative w-full"
      style={containerStyle}
      lang={locale}
      aria-busy={isLoading}
      data-media-card-kind={cardPayload.kind}
    >
      <MediaCardProvider value={value}>
        <Card
          className={cn(
            "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-lg shadow-xs",
            BASE_CARD_STYLE,
            cardSpacingClass,
            className,
          )}
        >
          {!isLoading && resolvedHref ? (
            <LinkOverlay
              label={cardPayload.title ?? cardPayload.domain ?? undefined}
            />
          ) : null}
          {isLoading ? (
            <div className="relative flex flex-col gap-4">
              <MediaCardProgress />
            </div>
          ) : isImageCard || isVideoCard ? (
            <MediaFrame />
          ) : isLinkCard ? (
            <div className="flex flex-col">
              <MediaFrame />
              <div className={cn("flex flex-col", linkContentPadding)}>
                <MediaCardBody />
                <MediaCardFooter />
              </div>
            </div>
          ) : isAudioCard ? (
            <div className="flex flex-col gap-3 p-3">
              <MediaFrame />
            </div>
          ) : (
            <div className="relative flex flex-col gap-4">
              <MediaCardHeader />
              <MediaFrame />
              <MediaCardBody />
              <MediaCardFooter />
            </div>
          )}
        </Card>
      </MediaCardProvider>
    </article>
  );
}
