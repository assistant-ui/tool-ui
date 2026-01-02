/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Globe,
  Code2,
  Newspaper,
  Database,
  File,
} from "lucide-react";
import { cn } from "./_adapter";
import { ActionButtons, normalizeActionsConfig, type ActionsProp } from "../shared";
import { sanitizeHref } from "../shared/media";
import type { SerializableCitation, CitationType } from "./schema";

const FALLBACK_LOCALE = "en-US";

const TYPE_ICONS: Record<CitationType, LucideIcon> = {
  webpage: Globe,
  document: FileText,
  article: Newspaper,
  api: Database,
  code: Code2,
  other: File,
};

function CitationProgress() {
  return (
    <div className="flex w-full motion-safe:animate-pulse flex-col gap-2 p-4">
      <div className="flex items-center gap-1.5">
        <div className="bg-muted size-3.5 rounded" />
        <div className="bg-muted h-3 w-32 rounded" />
      </div>
      <div className="bg-muted h-5 w-3/4 rounded" />
      <div className="space-y-1.5">
        <div className="bg-muted h-3.5 w-full rounded" />
        <div className="bg-muted h-3.5 w-5/6 rounded" />
      </div>
    </div>
  );
}

function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function formatDate(isoString: string, locale: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return isoString;
  }
}

export interface CitationProps extends SerializableCitation {
  className?: string;
  isLoading?: boolean;
  onNavigate?: (href: string, citation: SerializableCitation) => void;
  responseActions?: ActionsProp;
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export function Citation(props: CitationProps) {
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
    snippet,
    domain: providedDomain,
    favicon,
    author,
    publishedAt,
    type = "webpage",
    locale: providedLocale,
  } = serializable;

  const locale = providedLocale ?? FALLBACK_LOCALE;
  const sanitizedHref = sanitizeHref(rawHref);
  const domain = providedDomain ?? extractDomain(rawHref);

  const citationData: SerializableCitation = {
    ...serializable,
    href: sanitizedHref ?? rawHref,
    domain,
    locale,
  };

  const normalizedActions = React.useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const TypeIcon = TYPE_ICONS[type] ?? Globe;

  const handleClick = () => {
    if (!sanitizedHref) return;
    if (onNavigate) {
      onNavigate(sanitizedHref, citationData);
    } else if (typeof window !== "undefined") {
      window.open(sanitizedHref, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sanitizedHref && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={cn("relative w-full min-w-72 max-w-md", className)}
      lang={locale}
      aria-busy={isLoading}
      data-tool-ui-id={id}
      data-slot="citation"
    >
      <div
        className={cn(
          "group @container relative isolate flex w-full min-w-0 flex-col overflow-hidden rounded-xl",
          "border border-border bg-card text-sm shadow-xs",
          "transition-colors duration-150",
          sanitizedHref && [
            "cursor-pointer",
            "hover:border-foreground/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          ],
        )}
        onClick={sanitizedHref ? handleClick : undefined}
        role={sanitizedHref ? "link" : undefined}
        tabIndex={sanitizedHref ? 0 : undefined}
        onKeyDown={handleKeyDown}
      >
        {isLoading ? (
          <CitationProgress />
        ) : (
          <div className="flex flex-col gap-2 p-4">
            <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
              {favicon ? (
                <img
                  src={favicon}
                  alt=""
                  aria-hidden="true"
                  className="size-3.5 shrink-0 rounded object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <TypeIcon className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
              )}
              <span className="truncate font-medium">{domain}</span>
              {(author || publishedAt) && (
                <span className="opacity-70">
                  <span className="opacity-60"> — </span>
                  {author}
                  {author && publishedAt && ", "}
                  {publishedAt && (
                    <time dateTime={publishedAt} className="tabular-nums">
                      {formatDate(publishedAt, locale)}
                    </time>
                  )}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-foreground text-pretty text-[15px] font-medium leading-snug">
              <span className="line-clamp-2 group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-2">
                {title}
              </span>
            </h3>

            {/* Snippet */}
            {snippet && (
              <p className="text-muted-foreground text-pretty text-[13px] leading-relaxed">
                <span className="line-clamp-3">{snippet}</span>
              </p>
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
