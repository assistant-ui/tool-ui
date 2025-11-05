"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { cn } from "./_cn";
import { useSocialPost } from "./context";
import { splitText } from "./formatters";
import { safeHref } from "./utils";

export function Body() {
  const { post, cfg, handlers, state, setState, allowExternalNavigation } =
    useSocialPost();
  const entitySets = React.useMemo(() => {
    if (!post.entities) return null;
    return {
      urls: new Set((post.entities.urls ?? []).map((url) => url.trim())),
      mentions: new Set(
        (post.entities.mentions ?? []).map((mention) =>
          mention.replace(/^@/, "").toLowerCase(),
        ),
      ),
      hashtags: new Set(
        (post.entities.hashtags ?? []).map((tag) =>
          tag.replace(/^#/, "").toLowerCase(),
        ),
      ),
    };
  }, [post.entities]);
  const parts = React.useMemo(() => splitText(post.text), [post.text]);
  const maxLines = post.compact ? (cfg.layout.contentMaxLines ?? 6) : undefined;
  const isClamped = typeof maxLines === "number" && !state.expanded;

  return (
    <div
      className={cn(
        "mt-3 break-words whitespace-pre-wrap",
        cfg.tokens.typography.body,
        cfg.tokens.typography.bodyLineHeight,
        isClamped && "line-clamp-[var(--social-post-clamp)]",
      )}
      style={
        isClamped
          ? ({ "--social-post-clamp": String(maxLines) } as CSSProperties)
          : undefined
      }
    >
      {parts.map((part, index) => {
        if (part.type === "url") {
          const href = safeHref(part.value);
          const urlSet = entitySets?.urls;
          const matchesEntity =
            !entitySets ||
            (href
              ? Boolean(
                  urlSet?.has(part.value.trim()) ||
                    urlSet?.has(href) ||
                    urlSet?.has(href.replace(/\/$/, "")),
                )
              : false);
          if (!href || !matchesEntity) {
            return <span key={index}>{part.value}</span>;
          }
          return (
            <a
              key={index}
              href={href}
              onClick={(event) => {
                event.stopPropagation();
                handlers.onEntityClick?.("url", part.value);
                handlers.onNavigate?.(href, post);
              }}
              target={allowExternalNavigation ? "_blank" : undefined}
              rel={allowExternalNavigation ? "noopener noreferrer" : undefined}
              className="text-accent-foreground underline underline-offset-2"
            >
              {part.value}
            </a>
          );
        }
        if (part.type === "mention") {
          const normalized = part.value.replace(/^@/, "").toLowerCase();
          const isEntity = !entitySets || entitySets.mentions?.has(normalized);
          if (!isEntity) {
            return <span key={index}>@{part.value}</span>;
          }
          return (
            <button
              key={index}
              type="button"
              className="underline underline-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                handlers.onEntityClick?.("mention", part.value);
              }}
            >
              @{part.value}
            </button>
          );
        }
        if (part.type === "hashtag") {
          const normalized = part.value.replace(/^#/, "").toLowerCase();
          const isEntity = !entitySets || entitySets.hashtags?.has(normalized);
          if (!isEntity) {
            return <span key={index}>#{part.value}</span>;
          }
          return (
            <button
              key={index}
              type="button"
              className="underline underline-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                handlers.onEntityClick?.("hashtag", part.value);
              }}
            >
              #{part.value}
            </button>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}

      {isClamped ? (
        <button
          type="button"
          className="ml-2 underline underline-offset-2"
          onClick={(event) => {
            event.stopPropagation();
            setState({ expanded: true });
          }}
        >
          Show more
        </button>
      ) : null}
    </div>
  );
}
