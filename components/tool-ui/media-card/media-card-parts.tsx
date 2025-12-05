/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { cn, Badge } from "./_ui";
import { useMediaCard } from "./context";
import { Actions } from "./media-actions";

export function MediaCardHeader() {
  const { card, resolvedSourceUrl, handlers } = useMediaCard();
  const { source, domain } = card;

  if (!source && !domain) {
    return null;
  }

  const showDomain = domain && (!source || source.label !== domain);

  return (
    <div className="text-muted-foreground flex w-full items-start justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        {source?.iconUrl ? (
          <img
            src={source.iconUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="border-border/60 relative z-20 h-6 w-6 rounded-full border object-cover"
          />
        ) : domain ? (
          <div className="border-border/60 bg-muted relative z-20 flex h-6 w-6 items-center justify-center rounded-full border">
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
        ) : null}
        <div className="flex flex-col">
          {source?.label ? (
            <div className="text-foreground flex items-center gap-2 text-xs font-medium">
              <Badge
                variant="secondary"
                className="bg-muted text-foreground hover:bg-muted data-[state=open]:bg-muted"
              >
                {source.label}
              </Badge>
              {source.url ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const href = source.url;
                    if (!href) return;
                    if (handlers.onNavigate) {
                      handlers.onNavigate(href, card);
                    } else if (typeof window !== "undefined") {
                      window.open(href, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="underline-offset-2 hover:underline"
                >
                  Tool details
                </button>
              ) : null}
            </div>
          ) : null}
          {showDomain ? (
            <span className="text-muted-foreground">{domain}</span>
          ) : null}
        </div>
      </div>
      {resolvedSourceUrl ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (handlers.onNavigate) {
              handlers.onNavigate(resolvedSourceUrl, card);
            } else if (typeof window !== "undefined") {
              window.open(resolvedSourceUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="text-primary focus-visible:ring-ring relative z-20 text-[11px] font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          View source
        </button>
      ) : null}
    </div>
  );
}

export function MediaCardBody() {
  const { card, resolvedSourceUrl, handlers } = useMediaCard();
  const title = card.title ?? card.og?.title;
  const description = card.description ?? card.og?.description;
  const isLinkCard = card.kind === "link";

  if (!title && !description) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-1">
      {isLinkCard && resolvedSourceUrl && card.domain ? (
        <a
          href={resolvedSourceUrl}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (handlers.onNavigate) {
              handlers.onNavigate(resolvedSourceUrl, card);
            } else if (typeof window !== "undefined") {
              window.open(resolvedSourceUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="text-muted-foreground focus-visible:ring-ring relative z-20 w-fit text-xs underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {card.domain}
        </a>
      ) : null}
      {title ? (
        <h3 className="text-foreground text-base font-medium">
          <span className={cn("line-clamp-2")}>{title}</span>
        </h3>
      ) : null}
      {description ? (
        <p className="text-muted-foreground leading-snug">
          <span className="line-clamp-2">{description}</span>
        </p>
      ) : null}
    </div>
  );
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.round(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

export function MediaCardFooter() {
  const { card, locale } = useMediaCard();
  const isLink = card.kind === "link";

  const meta: React.ReactNode[] = [];

  if (!isLink && card.durationMs) {
    meta.push(<span key="duration">{formatDuration(card.durationMs)}</span>);
  }

  if (!isLink && card.fileSizeBytes) {
    meta.push(<span key="size">{formatFileSize(card.fileSizeBytes)}</span>);
  }

  if (card.createdAtISO) {
    const date = new Date(card.createdAtISO);
    if (!Number.isNaN(date.getTime())) {
      const formatter = new Intl.DateTimeFormat(locale ?? "en-US", {
        dateStyle: "medium",
        timeStyle: isLink ? undefined : "short",
      });
      meta.push(
        <time
          key="created"
          dateTime={card.createdAtISO}
          title={date.toISOString()}
        >
          {formatter.format(date)}
        </time>,
      );
    }
  }

  if (!isLink && card.domain && meta.length === 0) {
    meta.push(<span key="domain">{card.domain}</span>);
  }

  const hasActions = card.kind !== "link";
  const hasMeta = meta.length > 0;

  if (!hasMeta && !hasActions) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {hasMeta && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {meta.map((node, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  &bull;
                </span>
              )}
              {node}
            </React.Fragment>
          ))}
        </div>
      )}
      {hasActions && <Actions />}
    </div>
  );
}
