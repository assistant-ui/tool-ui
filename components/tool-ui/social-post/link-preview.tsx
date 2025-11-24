/* eslint-disable @next/next/no-img-element */
"use client";

import { useSocialPost } from "./context";
import { cn } from "./_cn";
import { safeHref } from "./utils";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function LinkPreview() {
  const { post, cfg, handlers, allowExternalNavigation } = useSocialPost();
  const preview = post.linkPreview;
  if (!preview || !cfg.layout.showLinkPreview) return null;
  const href = safeHref(preview.url);
  if (!href) return null;
  const domain = preview.domain ?? getDomain(href);

  return (
    <a
      href={href}
      target={allowExternalNavigation ? "_blank" : undefined}
      rel={allowExternalNavigation ? "noopener noreferrer" : undefined}
      className="hover:bg-muted mt-3 block overflow-hidden rounded-lg border"
      onClick={(event) => {
        event.stopPropagation();
        handlers.onNavigate?.(href, post);
      }}
    >
      {preview.imageUrl ? (
        <img
          src={preview.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-48 w-full object-cover"
        />
      ) : null}
      <div className="p-3">
        {domain ? (
          <div className={cn("text-xs", cfg.tokens.muted)}>{domain}</div>
        ) : null}
        {preview.title ? (
          <div className="font-medium">{preview.title}</div>
        ) : null}
        {preview.description ? (
          <div className={cn("line-clamp-2 text-sm", cfg.tokens.muted)}>
            {preview.description}
          </div>
        ) : null}
      </div>
    </a>
  );
}
