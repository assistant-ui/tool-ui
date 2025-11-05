/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "./_cn";
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
        "mt-3 cursor-pointer rounded-xl border border-border p-3 transition-colors hover:bg-muted/30",
      )}
      onClick={(event) => {
        event.stopPropagation();
        // Could navigate to quoted post
      }}
    >
      {/* Quoted post header */}
      <div className="flex items-start gap-2">
        <img
          src={quotedPost.author.avatarUrl}
          alt={`${quotedPost.author.name} avatar`}
          className="h-5 w-5 shrink-0 rounded-full object-cover"
          width={20}
          height={20}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className={cn("truncate text-[15px] font-semibold")}>
              {quotedPost.author.name}
            </span>
            {quotedPost.author.verified ? (
              <BadgeCheck aria-label="Verified" className={cn("h-4 w-4 shrink-0", cfg.tokens.verified)} />
            ) : null}
            {handle ? (
              <span className={cn("truncate text-[15px] text-muted-foreground")}>
                {handle}
              </span>
            ) : null}
            {quotedPost.createdAtISO ? (
              <>
                <span className="text-muted-foreground">·</span>
                <span className={cn("text-[15px] text-muted-foreground")}>
                  {formatRelativeTime(quotedPost.createdAtISO, locale)}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Quoted post body - simplified, no state management */}
      {quotedPost.text ? (
        <div className="mt-2 text-[15px] leading-snug">
          {quotedPost.text}
        </div>
      ) : null}

      {/* Quoted post media */}
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

      {/* Quoted post link preview */}
      {quotedPost.linkPreview && cfg.layout.showLinkPreview ? (
        <div className="mt-2">
          <div className="overflow-hidden rounded-xl border border-border">
            {quotedPost.linkPreview.imageUrl ? (
              <img
                src={quotedPost.linkPreview.imageUrl}
                alt={quotedPost.linkPreview.title || ""}
                className="h-auto w-full object-cover"
              />
            ) : null}
            <div className="p-3">
              {quotedPost.linkPreview.domain ? (
                <div className="text-sm text-muted-foreground">
                  {quotedPost.linkPreview.domain}
                </div>
              ) : null}
              {quotedPost.linkPreview.title ? (
                <div className="mt-1 font-medium line-clamp-1">
                  {quotedPost.linkPreview.title}
                </div>
              ) : null}
              {quotedPost.linkPreview.description ? (
                <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
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
