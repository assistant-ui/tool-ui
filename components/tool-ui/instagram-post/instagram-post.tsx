"use client";

import * as React from "react";
import { BadgeCheck, Heart, Share } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ActionButtons,
  normalizeActionsConfig,
  type ActionsProp,
} from "../shared";
import type { InstagramPostData, InstagramPostMedia } from "./schema";

// ============================================================================
// Types
// ============================================================================

export interface InstagramPostProps {
  post: InstagramPostData;
  className?: string;
  onAction?: (action: string, post: InstagramPostData) => void;
  footerActions?: ActionsProp;
  onFooterAction?: (actionId: string) => void;
}

// ============================================================================
// Utilities
// ============================================================================

function formatRelativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.round(seconds / 86400)}d`;
  return `${Math.round(seconds / 604800)}w`;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ============================================================================
// Sub-components
// ============================================================================

function Header({
  author,
  createdAt,
}: {
  author: InstagramPostData["author"];
  createdAt?: string;
}) {
  return (
    <header className="flex items-center gap-3 px-3 py-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={author.avatarUrl}
        alt={`${author.name} avatar`}
        className="size-8 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-sm font-semibold">{author.handle}</span>
        {author.verified && (
          <BadgeCheck
            aria-label="Verified"
            className="size-3.5 shrink-0 text-sky-500"
          />
        )}
        {createdAt && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground text-sm">
              {formatRelativeTime(createdAt)}
            </span>
          </>
        )}
      </div>
    </header>
  );
}

function MediaGrid({
  media,
  onOpen,
}: {
  media: InstagramPostMedia[];
  onOpen?: (index: number) => void;
}) {
  if (media.length === 0) return null;

  // Single image
  if (media.length === 1) {
    const item = media[0];
    return (
      <button
        type="button"
        className="bg-muted relative block aspect-square w-full"
        onClick={() => onOpen?.(0)}
      >
        {item.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.alt}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={item.url}
            controls
            playsInline
            className="size-full object-cover"
          />
        )}
      </button>
    );
  }

  // Grid for multiple images
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {media.slice(0, 4).map((item, index) => (
        <button
          key={index}
          type="button"
          className="bg-muted relative block aspect-square w-full"
          onClick={() => onOpen?.(index)}
        >
          {item.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.alt}
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={item.url}
              playsInline
              className="size-full object-cover"
            />
          )}
          {index === 3 && media.length > 4 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-2xl font-semibold text-white">
                +{media.length - 4}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function PostBody({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
      {text}
    </p>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  hoverColor,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  hoverColor: string;
  activeColor?: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={cn("h-auto p-2", hoverColor, active && activeColor)}
          aria-label={label}
        >
          <Icon className="size-6" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function PostActions({ onAction }: { onAction: (action: string) => void }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1">
        <ActionButton
          icon={Heart}
          label="Like"
          active={liked}
          hoverColor="hover:opacity-60"
          activeColor="text-red-500"
          onClick={() => {
            setLiked(!liked);
            onAction("like");
          }}
        />
        <ActionButton
          icon={Share}
          label="Share"
          hoverColor="hover:opacity-60"
          onClick={() => onAction("share")}
        />
      </div>
    </TooltipProvider>
  );
}

function Stats({ likes }: { likes?: number }) {
  if (likes === undefined) return null;
  return (
    <div className="text-sm font-semibold">{formatCount(likes)} likes</div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function InstagramPost({
  post,
  className,
  onAction,
  footerActions,
  onFooterAction,
}: InstagramPostProps) {
  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(footerActions),
    [footerActions],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <article className="bg-card overflow-hidden rounded-lg border shadow-sm">
        <Header author={post.author} createdAt={post.createdAt} />

        {post.media && post.media.length > 0 && (
          <MediaGrid media={post.media} />
        )}

        <div className="px-3 pb-3">
          <PostActions onAction={(action) => onAction?.(action, post)} />
          <Stats likes={post.stats?.likes} />
          {post.text && (
            <div className="mt-1">
              <span className="text-sm font-semibold">
                {post.author.handle}
              </span>{" "}
              <PostBody text={post.text} />
            </div>
          )}
        </div>
      </article>

      {normalizedFooterActions && (
        <div className="@container/actions">
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={(id) => onFooterAction?.(id)}
          />
        </div>
      )}
    </div>
  );
}
