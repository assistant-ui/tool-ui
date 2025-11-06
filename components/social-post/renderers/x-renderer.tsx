"use client";

import { useSocialPost } from "../context";
import { cn } from "../_cn";
import { Body } from "../body";
import { Media } from "../media";
import { QuotedPost } from "../quoted-post";
import { Actions } from "../actions";
import { LinkPreview } from "../link-preview";
import { BadgeCheck } from "lucide-react";
import { PlatformLogo } from "../platform-brand";

export function XRenderer() {
  const { post, cfg } = useSocialPost();
  const handle = post.author.handle ? `@${post.author.handle.replace(/^@/, "")}` : undefined;

  return (
    <div className="flex gap-2">
      {/* Left column: Avatar */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.author.avatarUrl}
        alt={`${post.author.name} avatar`}
        className={cn("shrink-0 object-cover rounded-full", cfg.tokens.spacing.avatarSize)}
        width={40}
        height={40}
      />

      {/* Right column: All other content */}
      <div className="min-w-0 flex-1">
        {/* Header (name, handle, logo) */}
        <header className="flex items-start gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span
              id={`post-${post.id}-author`}
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
            {handle ? (
              <span className={cn("truncate", cfg.tokens.typography.handle)}>{handle}</span>
            ) : null}
          </div>
          <PlatformLogo
            platform={cfg.name}
            color={cfg.tokens.brandColor}
            className={cn("bg-muted/10 h-5 w-5 rounded-full shrink-0")}
          />
        </header>

        <Body />
        <Media />
        <QuotedPost />
        <LinkPreview />
        <Actions />
      </div>
    </div>
  );
}
