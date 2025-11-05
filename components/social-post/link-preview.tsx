/* eslint-disable @next/next/no-img-element */
"use client";

import { useSocialPost } from "./context";
import { cn } from "./_cn";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function LinkPreview() {
  const { post, cfg } = useSocialPost();
  const preview = post.linkPreview;
  if (!preview || !cfg.layout.showLinkPreview) return null;
  const domain = preview.domain ?? (preview.url ? getDomain(preview.url) : undefined);

  return (
    <a
      href={preview.url}
      className="mt-3 block overflow-hidden rounded-lg border hover:bg-muted"
      onClick={(event) => event.stopPropagation()}
    >
      {preview.imageUrl ? (
        <img src={preview.imageUrl} alt="" className="h-48 w-full object-cover" />
      ) : null}
      <div className="p-3">
        {domain ? <div className={cn("text-xs", cfg.tokens.muted)}>{domain}</div> : null}
        {preview.title ? <div className="font-medium">{preview.title}</div> : null}
        {preview.description ? (
          <div className={cn("text-sm line-clamp-2", cfg.tokens.muted)}>{preview.description}</div>
        ) : null}
      </div>
    </a>
  );
}
