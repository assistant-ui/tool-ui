"use client";

import { useSocialPost } from "../context";
import { cn } from "../_ui";
import { Body } from "../body";
import { Media } from "../media";
import { QuotedPost } from "../quoted-post";
import { Actions } from "../post-actions";
import { LinkPreview } from "../link-preview";
import { BadgeCheck } from "lucide-react";
import { PlatformLogo } from "../platform-brand";

export function XRenderer() {
  const { post, cfg } = useSocialPost();
  const handle = post.author.handle
    ? `@${post.author.handle.replace(/^@/, "")}`
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-start gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.author.avatarUrl}
          alt={`${post.author.name} avatar`}
          className={cn(
            "shrink-0 rounded-full object-cover",
            cfg.tokens.spacing.avatarSize,
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-2">
            <span
              id={`post-${post.postId}-author`}
              className={cn("truncate", cfg.tokens.typography.name)}
            >
              {post.author.name}
            </span>
            {post.author.verified ? (
              <BadgeCheck
                aria-label="Verified"
                className={cn("h-4 w-4 shrink-0", cfg.tokens.verified)}
              />
            ) : null}
          </div>
          {handle ? (
            <span className={cn("truncate", cfg.tokens.typography.handle)}>
              {handle}
            </span>
          ) : null}
        </div>
        <PlatformLogo
          platform={cfg.name}
          className={cn(
            "bg-muted/10 dark-bg-white h-5 w-5 shrink-0 rounded-full",
          )}
        />
      </header>

      <Body />
      <Media />
      <QuotedPost />
      <LinkPreview />
      <Actions />
    </div>
  );
}
