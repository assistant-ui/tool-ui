/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { cn } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import { RATIO_CLASS_MAP, getFitClass, sanitizeHref } from "../shared/media";
import type { SerializableLinkPreview } from "./schema";

const FALLBACK_LOCALE = "en-US";
const CONTENT_SPACING = "px-5 py-4 gap-2";

function LinkPreviewProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col">
      <div className="bg-muted aspect-[5/3] w-full" />
      <div className={cn("flex flex-col", CONTENT_SPACING)}>
        <div className="flex items-center gap-2">
          <div className="bg-muted size-4 rounded-full" />
          <div className="bg-muted h-3 w-24 rounded" />
        </div>
        <div className="bg-muted h-5 w-3/4 rounded" />
        <div className="bg-muted h-4 w-full rounded" />
      </div>
    </div>
  );
}

export interface LinkPreviewProps extends SerializableLinkPreview {
  className?: string;
  isLoading?: boolean;
  onNavigate?: (href: string, preview: SerializableLinkPreview) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export function LinkPreview(props: LinkPreviewProps) {
  const {
    className,
    isLoading,
    onNavigate,
    responseActions,
    onResponseAction,
    onBeforeResponseAction,
    ...serializable
  } = props;

  const {
    id,
    href: rawHref,
    title,
    description,
    image,
    domain,
    favicon,
    ratio = "16:9",
    fit = "cover",
    locale: providedLocale,
  } = serializable;

  const locale = providedLocale ?? FALLBACK_LOCALE;
  const sanitizedHref = sanitizeHref(rawHref);

  const previewData: SerializableLinkPreview = {
    ...serializable,
    href: sanitizedHref ?? rawHref,
    locale,
  };

  const normalizedActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const handleClick = () => {
    if (!sanitizedHref) return;
    if (onNavigate) {
      onNavigate(sanitizedHref, previewData);
    } else if (typeof window !== "undefined") {
      window.open(sanitizedHref, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article
      className={cn("relative w-full min-w-80 max-w-md", className)}
      lang={locale}
      aria-busy={isLoading}
      data-tool-ui-id={id}
      data-slot="link-preview"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
          sanitizedHref && "cursor-pointer",
        )}
        onClick={sanitizedHref ? handleClick : undefined}
        role={sanitizedHref ? "link" : undefined}
        tabIndex={sanitizedHref ? 0 : undefined}
        onKeyDown={
          sanitizedHref
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
      >
        {isLoading ? (
          <LinkPreviewProgress />
        ) : (
          <div className="flex flex-col">
            {image && (
              <div
                className={cn(
                  "bg-muted relative w-full overflow-hidden",
                  ratio !== "auto" ? RATIO_CLASS_MAP[ratio] : "aspect-[5/3]",
                )}
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full",
                    getFitClass(fit),
                    "object-center transition-transform duration-300 group-hover:scale-[1.01]",
                  )}
                />
              </div>
            )}
            <div className={cn("flex flex-col", CONTENT_SPACING)}>
              {domain && (
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt=""
                      aria-hidden="true"
                      className="size-4 rounded-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="border-border/60 bg-muted flex size-4 shrink-0 items-center justify-center rounded-full border">
                      <Globe className="h-2.5 w-2.5" aria-hidden="true" />
                    </div>
                  )}
                  <span>{domain}</span>
                </div>
              )}
              {title && (
                <h3 className="text-foreground text-pretty text-base font-medium">
                  <span className="line-clamp-2">{title}</span>
                </h3>
              )}
              {description && (
                <p className="text-muted-foreground text-pretty leading-snug">
                  <span className="line-clamp-2">{description}</span>
                </p>
              )}
            </div>
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
