"use client";

import * as React from "react";
import { ThumbsUp, Share, MoreHorizontal } from "lucide-react";
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
import type {
  LinkedInPostData,
  LinkedInPostMedia,
  LinkedInPostLinkPreview,
} from "./schema";

// ============================================================================
// Types
// ============================================================================

export interface LinkedInPostProps {
  post: LinkedInPostData;
  className?: string;
  onAction?: (action: string, post: LinkedInPostData) => void;
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

function LinkedinLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={className}
      role="img"
      aria-label="LinkedIn logo"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M8 72h56c4.42 0 8-3.58 8-8V8c0-4.42-3.58-8-8-8H8C3.58 0 0 3.58 0 8v56c0 4.42 3.58 8 8 8z"
          fill="currentColor"
        />
        <path
          d="M62 62H51.3V43.8c0-4.98-1.9-7.78-5.83-7.78-4.3 0-6.54 2.9-6.54 7.78V62H28.63V27.33h10.3v4.67c0 0 3.1-5.73 10.45-5.73 7.36 0 12.62 4.5 12.62 13.8V62zM16.35 22.8c-3.5 0-6.35-2.86-6.35-6.4 0-3.52 2.85-6.4 6.35-6.4 3.5 0 6.35 2.88 6.35 6.4 0 3.54-2.85 6.4-6.35 6.4zM11.03 62h10.74V27.33H11.03V62z"
          fill="#FFF"
        />
      </g>
    </svg>
  );
}

function Header({
  author,
  createdAt,
}: {
  author: LinkedInPostData["author"];
  createdAt?: string;
}) {
  return (
    <header className="flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={author.avatarUrl}
        alt={`${author.name} avatar`}
        className="size-10 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-sm font-semibold">{author.name}</span>
        {author.headline && (
          <span className="text-muted-foreground line-clamp-1 text-xs">
            {author.headline}
          </span>
        )}
        {createdAt && (
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <span>{formatRelativeTime(createdAt)}</span>
            <span>•</span>
            <span>Edited</span>
          </div>
        )}
      </div>
      <LinkedinLogo className="size-5 text-[#0077b5]" />
    </header>
  );
}

function PostBody({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="mt-3 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
      {text}
    </p>
  );
}

function PostMedia({ media }: { media: LinkedInPostMedia[] }) {
  if (media.length === 0) return null;

  const item = media[0];
  return (
    <div className="mt-3 overflow-hidden rounded-lg">
      {item.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt}
          className="w-full object-cover"
          style={{ aspectRatio: "16/9" }}
          loading="lazy"
        />
      ) : (
        <video
          src={item.url}
          controls
          playsInline
          className="w-full object-contain"
          style={{ aspectRatio: "16/9" }}
        />
      )}
    </div>
  );
}

function PostLinkPreview({ preview }: { preview: LinkedInPostLinkPreview }) {
  const domain = preview.domain ?? getDomain(preview.url);

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-muted/50 mt-3 block overflow-hidden rounded-lg border transition-colors"
    >
      {preview.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.imageUrl}
          alt=""
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-3">
        {preview.title && (
          <div className="line-clamp-2 font-medium">{preview.title}</div>
        )}
        {domain && (
          <div className="text-muted-foreground mt-1 text-xs">{domain}</div>
        )}
      </div>
    </a>
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
            "h-auto gap-1.5 px-3 py-2",
            hoverColor,
            active && activeColor,
          )}
          aria-label={label}
        >
          <Icon className="size-4" />
          <span className="text-xs font-medium">{label}</span>
          {count !== undefined && (
            <span className="text-muted-foreground text-xs">
              ({formatCount(count)})
            </span>
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
  stats?: LinkedInPostData["stats"];
  onAction: (action: string) => void;
}) {
  const [liked, setLiked] = React.useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="mt-2 flex items-center gap-1 border-t pt-1.5">
        <ActionButton
          icon={ThumbsUp}
          label="Like"
          active={liked}
          hoverColor="hover:bg-muted"
          activeColor="text-blue-600 fill-blue-600"
          onClick={() => {
            setLiked(!liked);
            onAction("like");
          }}
        />
        <ActionButton
          icon={Share}
          label="Share"
          hoverColor="hover:bg-muted"
          onClick={() => onAction("share")}
        />
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LinkedInPost({
  post,
  className,
  onAction,
  footerActions,
  onFooterAction,
}: LinkedInPostProps) {
  const normalizedFooterActions = React.useMemo(
    () => normalizeActionsConfig(footerActions),
    [footerActions],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <article className="bg-card rounded-lg border p-4 shadow-sm">
        <Header author={post.author} createdAt={post.createdAt} />
        <PostBody text={post.text} />

        {post.media && post.media.length > 0 && (
          <PostMedia media={post.media} />
        )}

        {post.linkPreview && !post.media?.length && (
          <PostLinkPreview preview={post.linkPreview} />
        )}

        <PostActions
          stats={post.stats}
          onAction={(action) => onAction?.(action, post)}
        />
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
