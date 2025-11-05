/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "./_cn";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./_ui";
import { useSocialPost } from "./context";
import { formatRelativeTime } from "./formatters";
import { BadgeCheck, MoreHorizontal } from "lucide-react";

export function Header() {
  const { post, cfg, locale, state, setState } = useSocialPost();
  const handle = post.author.handle
    ? cfg.layout.showHandleWithAt
      ? `@${post.author.handle.replace(/^@/, "")}`
      : post.author.handle
    : undefined;

  return (
    <header className={cn("flex items-start", cfg.tokens.spacing.gap)}>
      <img
        src={post.author.avatarUrl}
        alt={`${post.author.name} avatar`}
        className={cn(
          "shrink-0 object-cover",
          cfg.tokens.spacing.avatarSize,
          cfg.tokens.avatarShape === "circle" && "rounded-full",
          cfg.tokens.avatarShape === "rounded" && "rounded-md",
          cfg.tokens.avatarShape === "square" && "rounded-none",
        )}
        width={40}
        height={40}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span id={`post-${post.id}-author`} className={cn("truncate", cfg.tokens.typography.name)}>
            {post.author.name}
          </span>
          {post.author.verified ? (
            <BadgeCheck aria-label="Verified" className={cn("h-4 w-4 shrink-0", cfg.tokens.verified)} />
          ) : null}
          {handle ? (
            <span className={cn("truncate", cfg.tokens.typography.handle)}>·</span>
          ) : null}
          {handle ? <span className={cn("truncate", cfg.tokens.typography.handle)}>{handle}</span> : null}
          {cfg.layout.showFollowInHeader && !state.following ? (
            <>
              <span className={cn("truncate", cfg.tokens.typography.handle)}>·</span>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-auto p-0 font-semibold", cfg.tokens.accent)}
                onClick={(event) => {
                  event.stopPropagation();
                  setState({ following: true });
                }}
              >
                Follow
              </Button>
            </>
          ) : null}
          {post.author.subtitle && cfg.name === "linkedin" ? (
            <span className={cn("truncate", cfg.tokens.typography.handle)}>{post.author.subtitle}</span>
          ) : null}
        </div>
        {post.createdAtISO && cfg.name !== "x" ? (
          <div className={cn("flex flex-wrap items-center gap-1", cfg.tokens.typography.handle)}>
            <span aria-label="Timestamp">{formatRelativeTime(post.createdAtISO, locale)}</span>
            {post.sourceUrl ? (
              <>
                <span>·</span>
                <a
                  href={post.sourceUrl}
                  className="underline underline-offset-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  View source
                </a>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {cfg.name !== "x" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="Post menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(event) => event.stopPropagation()}>
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(event) => event.stopPropagation()}>
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </header>
  );
}
