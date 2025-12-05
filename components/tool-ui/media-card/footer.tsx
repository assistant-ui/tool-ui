"use client";

import * as React from "react";
import { Actions } from "./media-actions";
import { useMediaCard } from "./context";

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
