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

export function Header() {
  const { post, cfg, locale } = useSocialPost();
  const handle = post.author.handle
    ? cfg.layout.showHandleWithAt
      ? `@${post.author.handle.replace(/^@/, "")}`
      : post.author.handle
    : undefined;

  return (
    <header className="flex items-start gap-3">
      <img
        src={post.author.avatarUrl}
        alt={`${post.author.name} avatar`}
        className={cn(
          "h-10 w-10 shrink-0 object-cover",
          cfg.tokens.avatarShape === "circle" && "rounded-full",
          cfg.tokens.avatarShape === "rounded" && "rounded-md",
          cfg.tokens.avatarShape === "square" && "rounded-none",
        )}
        width={40}
        height={40}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span id={`post-${post.id}-author`} className="truncate font-medium">
            {post.author.name}
          </span>
          {post.author.verified ? (
            <span aria-label="Verified" className={cn("text-sm", cfg.tokens.verified)}>
              ✔
            </span>
          ) : null}
          {post.author.subtitle && cfg.name === "linkedin" ? (
            <span className={cn("truncate text-xs", cfg.tokens.muted)}>{post.author.subtitle}</span>
          ) : null}
        </div>
        <div className={cn("flex flex-wrap items-center gap-2 text-xs", cfg.tokens.muted)}>
          {handle ? <span className="truncate">{handle}</span> : null}
          {post.createdAtISO ? (
            <span aria-label="Timestamp">· {formatRelativeTime(post.createdAtISO, locale)}</span>
          ) : null}
          {post.sourceUrl ? (
            <a
              href={post.sourceUrl}
              className="underline underline-offset-2"
              onClick={(event) => event.stopPropagation()}
            >
              View source
            </a>
          ) : null}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Post menu"
          >
            ...
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
    </header>
  );
}
