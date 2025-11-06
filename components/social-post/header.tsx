/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { cn } from "./_cn";
import { Button } from "./_ui";
import { useSocialPost } from "./context";
import { formatRelativeTime } from "./formatters";
import { safeHref } from "./utils";
import { PlatformLogo } from "./platform-brand";
import { BadgeCheck } from "lucide-react";

export function Header() {
  const {
    post,
    cfg,
    locale,
    state,
    setState,
    handlers,
    allowExternalNavigation,
  } = useSocialPost();
  const handle = post.author.handle
    ? cfg.layout.showHandleWithAt
      ? `@${post.author.handle.replace(/^@/, "")}`
      : post.author.handle
    : undefined;
  const relativeTime = React.useMemo(() => {
    if (!post.createdAtISO) return undefined;
    return formatRelativeTime(post.createdAtISO, locale);
  }, [post.createdAtISO, locale]);
  const viewSourceHref = safeHref(post.sourceUrl);
  const showTime = Boolean(
    post.createdAtISO && cfg.name !== "x" && relativeTime,
  );

  const timeBlock =
    !showTime || cfg.name === "linkedin" ? null : (
      <div
        className={cn(
          "flex flex-wrap items-center gap-1",
          cfg.tokens.typography.handle,
        )}
      >
        <span aria-hidden="true">·</span>
        <time dateTime={post.createdAtISO} className="sr-only">
          {new Date(post.createdAtISO!).toISOString()}
        </time>
        <span aria-label="Timestamp">{relativeTime}</span>
        {viewSourceHref ? (
          <>
            <span>·</span>
            <a
              href={viewSourceHref}
              target={allowExternalNavigation ? "_blank" : undefined}
              rel={allowExternalNavigation ? "noopener noreferrer" : undefined}
              className="underline underline-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                handlers.onNavigate?.(viewSourceHref, post);
              }}
            >
              View source
            </a>
          </>
        ) : null}
      </div>
    );

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
        {cfg.name === "linkedin" ? (
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1">
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
            </div>
            {post.author.subtitle ? (
              <div className={cn("truncate", cfg.tokens.typography.handle)}>
                {post.author.subtitle}
              </div>
            ) : null}
            {showTime ? (
              <div
                className={cn(
                  "flex flex-wrap items-center gap-1",
                  cfg.tokens.typography.handle,
                )}
              >
                <time dateTime={post.createdAtISO} className="sr-only">
                  {new Date(post.createdAtISO!).toISOString()}
                </time>
                <span aria-label="Timestamp">{relativeTime}</span>
                {viewSourceHref ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <a
                      href={viewSourceHref}
                      target={allowExternalNavigation ? "_blank" : undefined}
                      rel={
                        allowExternalNavigation
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="underline underline-offset-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlers.onNavigate?.(viewSourceHref, post);
                      }}
                    >
                      View source
                    </a>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
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
                <span className={cn("truncate", cfg.tokens.typography.handle)}>
                  ·
                </span>
              ) : null}
              {handle ? (
                <span className={cn("truncate", cfg.tokens.typography.handle)}>
                  {handle}
                </span>
              ) : null}
              {cfg.layout.showFollowInHeader && !state.following ? (
                <>
                  <span
                    className={cn("truncate", cfg.tokens.typography.handle)}
                  >
                    ·
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-auto p-0 font-semibold",
                      cfg.tokens.accent,
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      setState({ following: true });
                    }}
                  >
                    Follow
                  </Button>
                </>
              ) : null}
            </div>
            {timeBlock}
          </>
        )}
      </div>
      <PlatformLogo
        platform={cfg.name}
        color={cfg.tokens.brandColor}
        className={cn("bg-muted/10 h-8 w-8 self-start rounded-full")}
      />
    </header>
  );
}
