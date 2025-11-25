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
import type { XPostData, XPostMedia, XPostLinkPreview } from "./schema";

// ============================================================================
// Types
// ============================================================================

export interface XPostProps {
  post: XPostData;
  className?: string;
  onAction?: (action: string, post: XPostData) => void;
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

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-10 shrink-0 rounded-full object-cover"
    />
  );
}

function AuthorInfo({
  name,
  handle,
  verified,
  createdAt,
}: {
  name: string;
  handle: string;
  verified?: boolean;
  createdAt?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-1">
        <span className="truncate font-semibold">{name}</span>
        {verified && (
          <BadgeCheck
            aria-label="Verified"
            className="size-4 shrink-0 text-blue-500"
          />
        )}
      </div>
      <div className="text-muted-foreground flex items-center gap-1">
        <span className="truncate">@{handle}</span>
        {createdAt && (
          <>
            <span>·</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function PostBody({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-[15px] leading-normal wrap-break-word whitespace-pre-wrap">
      {text}
    </p>
  );
}

function PostMedia({
  media,
  onOpen,
}: {
  media: XPostMedia[];
  onOpen?: (index: number) => void;
}) {
  if (media.length === 0) return null;

  const item = media[0];
  const aspectRatio =
    item.aspectRatio === "1:1"
      ? "1"
      : item.aspectRatio === "4:3"
        ? "4/3"
        : "16/9";

  return (
    <button
      type="button"
      className="bg-muted mt-3 w-full overflow-hidden rounded-xl"
      style={{ aspectRatio }}
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
          className="size-full object-contain"
        />
      )}
    </button>
  );
}

function PostLinkPreview({ preview }: { preview: XPostLinkPreview }) {
  const domain = preview.domain ?? getDomain(preview.url);

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted/50 mt-3 block overflow-hidden rounded-xl border transition-colors"
    >
      {preview.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.imageUrl}
          alt=""
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3">
        {domain && (
          <div className="text-muted-foreground text-xs">{domain}</div>
        )}
        {preview.title && <div className="font-medium">{preview.title}</div>}
        {preview.description && (
          <div className="text-muted-foreground line-clamp-2 text-sm">
            {preview.description}
          </div>
        )}
      </div>
    </a>
  );
}

function QuotedPostCard({ post }: { post: XPostData }) {
  return (
    <div className="hover:bg-muted/30 mt-3 rounded-xl border p-3 transition-colors">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.author.avatarUrl}
          alt={`${post.author.name} avatar`}
          className="size-5 rounded-full object-cover"
        />
        <span className="font-semibold">{post.author.name}</span>
        {post.author.verified && (
          <BadgeCheck className="size-4 text-blue-500" />
        )}
        <span className="text-muted-foreground">@{post.author.handle}</span>
        {post.createdAt && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </span>
          </>
        )}
      </div>
      {post.text && <p className="mt-2">{post.text}</p>}
      {post.media?.[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.media[0].url}
          alt={post.media[0].alt}
          className="mt-2 rounded-lg"
        />
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  count,
  active,
  hoverColor,
  activeColor,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
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
          className={cn(
            "h-auto gap-1.5 px-2 py-1",
            hoverColor,
            active && activeColor,
          )}
          aria-label={label}
        >
          <Icon className="size-4" />
          {count !== undefined && (
            <span className="text-sm">{formatCount(count)}</span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function PostActions({
  stats,
  onAction,
}: {
  stats?: XPostData["stats"];
  onAction: (action: string) => void;
}) {
  const [liked, setLiked] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mt-1 flex items-center gap-4">
        <ActionButton
          icon={Heart}
          label="Like"
          count={stats?.likes}
          active={liked}
          hoverColor="hover:text-red-500 hover:bg-red-500/10"
          activeColor="text-red-500"
          onClick={() => {
            setLiked(!liked);
            onAction("like");
          }}
        />
        <ActionButton
          icon={Share}
          label="Share"
          hoverColor="hover:text-blue-500 hover:bg-blue-500/10"
          onClick={() => onAction("share")}
        />
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function XPost({
  post,
  className,
  onAction,
  footerActions,
  onFooterAction,
}: XPostProps) {
  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(footerActions),
    [footerActions],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <article className="bg-card rounded-xl border p-3 shadow-sm">
        <div className="flex gap-3">
          <Avatar
            src={post.author.avatarUrl}
            alt={`${post.author.name} avatar`}
          />
          <div className="min-w-0 flex-1">
            <AuthorInfo
              name={post.author.name}
              handle={post.author.handle}
              verified={post.author.verified}
              createdAt={post.createdAt}
            />
            <PostBody text={post.text} />
            {post.media && post.media.length > 0 && (
              <PostMedia media={post.media} />
            )}
            {post.quotedPost && <QuotedPostCard post={post.quotedPost} />}
            {post.linkPreview && !post.quotedPost && (
              <PostLinkPreview preview={post.linkPreview} />
            )}
            <PostActions
              stats={post.stats}
              onAction={(action) => onAction?.(action, post)}
            />
          </div>
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
