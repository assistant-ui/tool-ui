"use client";

import type { CSSProperties } from "react";
import { cn } from "./_cn";
import { useSocialPost } from "./context";
import { splitText } from "./formatters";

export function Body() {
  const { post, cfg, handlers, state, setState } = useSocialPost();
  const parts = splitText(post.text);
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
          return (
            <a
              key={index}
              href={part.value}
              onClick={(event) => {
                event.stopPropagation();
                handlers.onEntityClick?.("url", part.value);
              }}
              className="text-accent-foreground underline underline-offset-2"
            >
              {part.value}
            </a>
          );
        }
        if (part.type === "mention") {
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
