/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Globe,
  Code2,
  Newspaper,
  Database,
  File,
  ExternalLink,
} from "lucide-react";
import {
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./_adapter";
import { Citation } from "./citation";
import type { SerializableCitation, CitationType, CitationVariant } from "./schema";

const TYPE_ICONS: Record<CitationType, LucideIcon> = {
  webpage: Globe,
  document: FileText,
  article: Newspaper,
  api: Database,
  code: Code2,
  other: File,
};

function useHoverPopover(delay = 100) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOpen(false), delay);
  }, [delay]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { open, setOpen, handleMouseEnter, handleMouseLeave };
}

export interface CitationListProps {
  id: string;
  citations: SerializableCitation[];
  variant?: CitationVariant;
  maxVisible?: number;
  className?: string;
  onNavigate?: (href: string, citation: SerializableCitation) => void;
}

export function CitationList(props: CitationListProps) {
  const {
    id,
    citations,
    variant = "default",
    maxVisible,
    className,
    onNavigate,
  } = props;

  const shouldTruncate = maxVisible !== undefined && citations.length > maxVisible;
  const visibleCitations = shouldTruncate ? citations.slice(0, maxVisible) : citations;
  const overflowCitations = shouldTruncate ? citations.slice(maxVisible) : [];
  const overflowCount = overflowCitations.length;

  const wrapperClass =
    variant === "inline"
      ? "flex flex-wrap items-center gap-1.5"
      : "flex flex-col gap-2";

  // Stacked variant: overlapping favicons with popover
  if (variant === "stacked") {
    return (
      <StackedCitations
        id={id}
        citations={citations}
        className={className}
        onNavigate={onNavigate}
      />
    );
  }

  if (variant === "default") {
    return (
      <div
        className={cn("flex flex-col gap-4", className)}
        data-tool-ui-id={id}
        data-slot="citation-list"
      >
        {visibleCitations.map((citation) => (
          <Citation
            key={citation.id}
            {...citation}
            variant="default"
            onNavigate={onNavigate}
          />
        ))}
        {shouldTruncate && (
          <OverflowIndicator
            citations={overflowCitations}
            count={overflowCount}
            variant="default"
            onNavigate={onNavigate}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(wrapperClass, className)}
      data-tool-ui-id={id}
      data-slot="citation-list"
    >
      {visibleCitations.map((citation) => (
        <Citation
          key={citation.id}
          {...citation}
          variant={variant}
          onNavigate={onNavigate}
        />
      ))}
      {shouldTruncate && (
        <OverflowIndicator
          citations={overflowCitations}
          count={overflowCount}
          variant={variant}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

interface OverflowIndicatorProps {
  citations: SerializableCitation[];
  count: number;
  variant: CitationVariant;
  onNavigate?: (href: string, citation: SerializableCitation) => void;
}

function OverflowIndicator({
  citations,
  count,
  variant,
  onNavigate,
}: OverflowIndicatorProps) {
  const { open, handleMouseEnter, handleMouseLeave } = useHoverPopover();

  const handleClick = (citation: SerializableCitation) => {
    if (onNavigate) {
      onNavigate(citation.href, citation);
    } else if (typeof window !== "undefined") {
      window.open(citation.href, "_blank", "noopener,noreferrer");
    }
  };

  const popoverContent = (
    <div className="flex max-h-72 flex-col overflow-y-auto">
      {citations.map((citation) => (
        <OverflowItem
          key={citation.id}
          citation={citation}
          onClick={() => handleClick(citation)}
        />
      ))}
    </div>
  );

  if (variant === "inline") {
    return (
      <Popover open={open}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1",
              "bg-muted/60 text-sm tabular-nums",
              "transition-colors duration-150",
              "hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <span className="text-muted-foreground">+{count} more</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-80 p-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant
  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center rounded-xl px-4 py-3",
            "border border-dashed border-border bg-card",
            "transition-colors duration-150",
            "hover:border-foreground/25 hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <span className="text-muted-foreground text-sm tabular-nums">
            +{count} more sources
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-80 p-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {popoverContent}
      </PopoverContent>
    </Popover>
  );
}

interface OverflowItemProps {
  citation: SerializableCitation;
  onClick: () => void;
}

function OverflowItem({ citation, onClick }: OverflowItemProps) {
  const TypeIcon = TYPE_ICONS[citation.type ?? "webpage"] ?? Globe;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      {citation.favicon ? (
        <img
          src={citation.favicon}
          alt=""
          aria-hidden="true"
          className="bg-muted size-4 shrink-0 rounded object-cover"
        />
      ) : (
        <TypeIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-2">
          {citation.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{citation.domain}</p>
      </div>
      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

interface StackedCitationsProps {
  id: string;
  citations: SerializableCitation[];
  className?: string;
  onNavigate?: (href: string, citation: SerializableCitation) => void;
}

function StackedCitations({
  id,
  citations,
  className,
  onNavigate,
}: StackedCitationsProps) {
  const { open, handleMouseEnter, handleMouseLeave } = useHoverPopover();
  const maxIcons = 4;
  const visibleCitations = citations.slice(0, maxIcons);
  const remainingCount = Math.max(0, citations.length - maxIcons);

  const handleClick = (citation: SerializableCitation) => {
    if (onNavigate) {
      onNavigate(citation.href, citation);
    } else if (typeof window !== "undefined") {
      window.open(citation.href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-tool-ui-id={id}
          data-slot="citation-list"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
            "bg-muted/40 outline-none",
            "transition-colors duration-150",
            "hover:bg-muted/70",
            "focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <div className="flex items-center">
            {visibleCitations.map((citation, index) => {
              const TypeIcon = TYPE_ICONS[citation.type ?? "webpage"] ?? Globe;
              return (
                <div
                  key={citation.id}
                  className={cn(
                    "relative flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs dark:bg-muted",
                    index > 0 && "-ml-2",
                  )}
                  style={{ zIndex: maxIcons - index }}
                >
                  {citation.favicon ? (
                    <img
                      src={citation.favicon}
                      alt=""
                      aria-hidden="true"
                      className="size-4.5 rounded-full object-cover"
                    />
                  ) : (
                    <TypeIcon
                      className="size-3 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
            {remainingCount > 0 && (
              <div
                className="-ml-2 relative flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-xs dark:bg-muted"
                style={{ zIndex: 0 }}
              >
                <span className="text-[10px] font-medium text-muted-foreground tracking-tight">•••</span>
              </div>
            )}
          </div>
          <span className="text-muted-foreground text-sm tabular-nums">
            {citations.length} source{citations.length !== 1 && "s"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-80 p-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex max-h-72 flex-col overflow-y-auto">
          {citations.map((citation) => (
            <OverflowItem
              key={citation.id}
              citation={citation}
              onClick={() => handleClick(citation)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
