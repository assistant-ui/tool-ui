/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "./_ui";
import { useSocialPost } from "./context";
import { formatRelativeTime } from "./formatters";
import { BadgeCheck } from "lucide-react";

export function QuotedPost() {
  const { post, cfg, locale } = useSocialPost();

  if (!post.quotedPost) return null;

  const quotedPost = post.quotedPost;
  const handle = quotedPost.author.handle
    ? cfg.layout.showHandleWithAt
      ? `@${quotedPost.author.handle.replace(/^@/, "")}`
      : quotedPost.author.handle
    : undefined;

  return (
    <div
      className={cn(
        "border-border hover:bg-muted/30 mt-3 cursor-pointer rounded-lg border p-3 transition-colors",
      )}
      onClick={(event) => {
        event.stopPropagation();
        // Could navigate to quoted post
      }}
    >
      <div className="flex items-start gap-2">
        <img
          src={quotedPost.author.avatarUrl}
          alt={`${quotedPost.author.name} avatar`}
          className="size-5 shrink-0 rounded-full object-cover"
          width={20}
          height={20}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className={cn("truncate text-lg font-semibold")}>
              {quotedPost.author.name}
            </span>
            {quotedPost.author.verified ? (
              <BadgeCheck
                aria-label="Verified"
                className={cn("h-4 w-4 shrink-0", cfg.tokens.verified)}
              />
            ) : null}
            {handle ? (
              <span className={cn("text-muted-foreground truncate")}>
                {handle}
              </span>
            ) : null}
            {quotedPost.createdAtISO ? (
              <>
                <span className="text-muted-foreground">·</span>
                <span className={cn("text-muted-foreground text-sm")}>
                  {formatRelativeTime(quotedPost.createdAtISO, locale)}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {quotedPost.text ? <div>{quotedPost.text}</div> : null}

      {quotedPost.media && quotedPost.media.length > 0 ? (
        <div className="mt-2">
          <div className={cn("overflow-hidden", cfg.tokens.borders.media)}>
            <img
              src={quotedPost.media[0].url}
              alt={quotedPost.media[0].alt || ""}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      ) : null}

      {quotedPost.linkPreview && cfg.layout.showLinkPreview ? (
        <div className="mt-2">
          <div className="border-border overflow-hidden rounded-lg border">
            {quotedPost.linkPreview.imageUrl ? (
              <img
                src={quotedPost.linkPreview.imageUrl}
                alt={quotedPost.linkPreview.title || ""}
                className="h-auto w-full object-cover"
              />
            ) : null}
            <div className="p-3">
              {quotedPost.linkPreview.domain ? (
                <div className="text-muted-foreground text-sm">
                  {quotedPost.linkPreview.domain}
                </div>
              ) : null}
              {quotedPost.linkPreview.title ? (
                <div className="mt-1 line-clamp-1 font-medium">
                  {quotedPost.linkPreview.title}
                </div>
              ) : null}
              {quotedPost.linkPreview.description ? (
                <div className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                  {quotedPost.linkPreview.description}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
