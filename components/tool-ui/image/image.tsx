/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import {
  RATIO_CLASS_MAP,
  getFitClass,
  OVERLAY_GRADIENT,
  sanitizeHref,
} from "../shared/media";
import type { SerializableImage, Source } from "./schema";

const FALLBACK_LOCALE = "en-US";

function ImageProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-3 p-5">
      <div className="flex items-center gap-3 text-xs">
        <div className="bg-muted h-6 w-6 rounded-full" />
        <div className="bg-muted h-3 w-28 rounded" />
      </div>
      <div className="bg-muted h-40 w-full rounded-lg" />
      <div className="bg-muted h-4 w-3/4 rounded" />
    </div>
  );
}

export interface ImageProps extends SerializableImage {
  className?: string;
  maxWidth?: string;
  isLoading?: boolean;
  onNavigate?: (href: string, image: SerializableImage) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export function Image(props: ImageProps) {
  const {
    className,
    maxWidth,
    isLoading,
    onNavigate,
    responseActions,
    onResponseAction,
    onBeforeResponseAction,
    ...serializable
  } = props;

  const {
    id,
    src,
    alt,
    title,
    href: rawHref,
    domain,
    ratio = "auto",
    fit = "cover",
    source,
    locale: providedLocale,
  } = serializable;

  const locale = providedLocale ?? FALLBACK_LOCALE;
  const sanitizedHref = sanitizeHref(rawHref);
  const resolvedSourceUrl = sanitizeHref(source?.url);

  const imageData: SerializableImage = {
    ...serializable,
    href: sanitizedHref,
    source: source
      ? { ...source, url: resolvedSourceUrl }
      : undefined,
    locale,
  };

  const normalizedActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const containerStyle: React.CSSProperties = maxWidth
    ? { maxWidth, width: "100%" }
    : { width: "100%" };

  const sourceLabel = source?.label ?? domain;
  const fallbackInitial = (sourceLabel ?? "").trim().charAt(0).toUpperCase();
  const hasSource = Boolean(sourceLabel || source?.iconUrl);

  const handleSourceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const targetUrl = resolvedSourceUrl ?? source?.url ?? sanitizedHref ?? src;
    if (!targetUrl) return;
    if (onNavigate) {
      onNavigate(targetUrl, imageData);
    } else if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleImageClick = () => {
    if (!sanitizedHref) return;
    if (onNavigate) {
      onNavigate(sanitizedHref, imageData);
    } else if (typeof window !== "undefined") {
      window.open(sanitizedHref, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      className="relative w-full"
      style={containerStyle}
      lang={locale}
      aria-busy={isLoading}
      data-tool-ui-id={id}
      data-slot="image"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
          className,
        )}
      >
        {isLoading ? (
          <ImageProgress />
        ) : (
          <div
            className={cn(
              "bg-muted group relative w-full overflow-hidden",
              ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "min-h-[160px]",
              sanitizedHref && "cursor-pointer",
            )}
            onClick={sanitizedHref ? handleImageClick : undefined}
            role={sanitizedHref ? "link" : undefined}
            tabIndex={sanitizedHref ? 0 : undefined}
            onKeyDown={
              sanitizedHref
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleImageClick();
                    }
                  }
                : undefined
            }
          >
            <img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full",
                getFitClass(fit),
                "transition-transform duration-300 group-hover:scale-[1.01]",
              )}
            />
            {(title || hasSource) && (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{ backgroundImage: OVERLAY_GRADIENT }}
                />
                <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 px-5 pt-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {title && (
                      <div className="line-clamp-2 font-semibold text-white drop-shadow-sm">
                        {title}
                      </div>
                    )}
                    {hasSource && (
                      <SourceAttribution
                        source={source}
                        sourceLabel={sourceLabel}
                        fallbackInitial={fallbackInitial}
                        hasClickableUrl={Boolean(resolvedSourceUrl)}
                        onSourceClick={handleSourceClick}
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {normalizedActions && (
        <div className="@container/actions mt-3">
          <ActionButtons
            actions={normalizedActions.items}
            align={normalizedActions.align}
            confirmTimeout={normalizedActions.confirmTimeout}
            onAction={(actionId: string) => onResponseAction?.(actionId)}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </article>
  );
}

interface SourceAttributionProps {
  source?: Source;
  sourceLabel?: string;
  fallbackInitial: string;
  hasClickableUrl: boolean;
  onSourceClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function SourceAttribution({
  source,
  sourceLabel,
  fallbackInitial,
  hasClickableUrl,
  onSourceClick,
}: SourceAttributionProps) {
  const content = (
    <div className="flex items-center gap-2">
      {source?.iconUrl ? (
        <img
          src={source.iconUrl}
          alt=""
          aria-hidden="true"
          className="h-6 w-6 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : fallbackInitial ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white uppercase">
          {fallbackInitial}
        </div>
      ) : null}
      {sourceLabel && (
        <span className="text-sm font-medium text-white/90 drop-shadow-sm">
          {sourceLabel}
        </span>
      )}
    </div>
  );

  if (hasClickableUrl) {
    return (
      <button
        type="button"
        onClick={onSourceClick}
        className="inline-flex w-fit items-center gap-2 text-left focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        {content}
      </button>
    );
  }

  return <div className="inline-flex w-fit items-center gap-2">{content}</div>;
}
