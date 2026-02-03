"use client";

import * as React from "react";
import { cn } from "./_adapter";
import type {
  InsightCardProps,
  InsightSeverity,
  InsightCitation,
} from "./schema";
import { ActionButtons, normalizeActionsConfig } from "../shared";
import type { Action } from "../shared";

type InsightCardVariant = "compact" | "standard" | "detailed";

type SeverityStyle = {
  badge: string;
  accent: string;
  bar: string;
};

const SEVERITY_STYLES: Record<InsightSeverity, SeverityStyle> = {
  info: {
    badge: "text-muted-foreground",
    accent: "bg-sky-500",
    bar: "bg-sky-500",
  },
  success: {
    badge: "text-emerald-600 dark:text-emerald-500",
    accent: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  warning: {
    badge: "text-amber-600 dark:text-amber-500",
    accent: "bg-amber-500",
    bar: "bg-amber-500",
  },
  critical: {
    badge: "text-rose-600 dark:text-rose-500",
    accent: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

const SEVERITY_LABELS: Record<InsightSeverity, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  critical: "Critical",
};

function clampScore(score: number) {
  return Math.min(1, Math.max(0, score));
}

function formatConfidenceScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function InsightCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full min-w-80 max-w-md", className)}
      data-slot="insight-card-progress"
      aria-busy="true"
    >
      <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-5 w-40 rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-full rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted motion-safe:animate-pulse" />
          </div>
          <div className="h-5 w-16 rounded-full bg-muted motion-safe:animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-12 w-full rounded-lg bg-muted motion-safe:animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-full bg-muted motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

function renderCitationItem(
  citation: InsightCitation,
  variant: InsightCardVariant,
) {
  return (
    <li
      key={citation.id}
      className="flex flex-col gap-0.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium leading-snug">
          {citation.title}
        </span>
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Open
          </a>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {citation.source}
      </span>
      {variant === "detailed" && citation.excerpt && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {citation.excerpt}
        </p>
      )}
    </li>
  );
}

export function InsightCardProgress({ className }: { className?: string }) {
  return <InsightCardSkeleton className={className} />;
}

export function InsightCard({
  id,
  title,
  summary,
  severity = "info",
  confidence,
  citations,
  action,
  responseActions,
  className,
  isLoading,
  onResponseAction,
  onBeforeResponseAction,
}: InsightCardProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [variant, setVariant] = React.useState<InsightCardVariant>("standard");

  const resolveVariant = React.useCallback(
    (width: number, height: number): InsightCardVariant => {
      if (width >= 560 && height >= 280) return "detailed";
      if (width < 360 || height < 200) return "compact";
      return "standard";
    },
    [],
  );

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateVariant = (width: number, height: number) => {
      setVariant(resolveVariant(width, height));
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        updateVariant(entry.contentRect.width, entry.contentRect.height);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    const updateFromClient = () => {
      updateVariant(node.clientWidth, node.clientHeight);
    };

    updateFromClient();
    window.addEventListener("resize", updateFromClient);
    return () => window.removeEventListener("resize", updateFromClient);
  }, [resolveVariant]);

  const severityStyles = SEVERITY_STYLES[severity];

  const confidenceScore = confidence ? clampScore(confidence.score) : null;
  const confidencePercent =
    confidenceScore !== null ? formatConfidenceScore(confidenceScore) : null;

  const actionsConfig = normalizeActionsConfig(
    responseActions ?? (action ? [action as Action] : undefined),
  );

  const handleAction = React.useCallback(
    async (actionId: string) => {
      await onResponseAction?.(actionId);
    },
    [onResponseAction],
  );

  const handleBeforeAction = React.useCallback(
    async (actionId: string) => {
      if (!onBeforeResponseAction) return true;
      return onBeforeResponseAction(actionId);
    },
    [onBeforeResponseAction],
  );

  const citationLimit =
    variant === "detailed" ? 3 : variant === "standard" ? 1 : 0;
  const visibleCitations = citations?.slice(0, citationLimit) ?? [];
  const remainingCitations = citations
    ? Math.max(0, citations.length - visibleCitations.length)
    : 0;

  if (isLoading) {
    return <InsightCardSkeleton className={className} />;
  }

  return (
    <article
      className={cn(
        "@container/actions w-full min-w-80 max-w-md text-foreground",
        className,
      )}
      data-slot="insight-card"
      data-tool-ui-id={id}
      data-variant={variant}
      ref={containerRef}
    >
      <div
        className={cn(
          "flex w-full flex-col rounded-xl border border-border bg-card shadow-xs",
          variant === "compact" ? "gap-3 px-4 py-3" : "gap-4 px-5 py-4",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h3 className="text-pretty text-base font-semibold leading-snug">
              {title}
            </h3>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {summary}
            </p>
          </div>
          {(severity || confidence) && (
            <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
              {severity && (
                <span className={cn("flex items-center gap-1.5", severityStyles.badge)}>
                  <span className={cn("size-1.5 rounded-full", severityStyles.accent)} />
                  {SEVERITY_LABELS[severity]}
                </span>
              )}
              {confidence && (
                <span className="tabular-nums text-muted-foreground">
                  {confidencePercent} confidence
                </span>
              )}
            </div>
          )}
        </div>

        {/* Citations */}
        {visibleCitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {visibleCitations.map((citation) =>
                renderCitationItem(citation, variant),
              )}
            </ul>
            {remainingCitations > 0 && (
              <span className="text-xs text-muted-foreground">
                +{remainingCitations} more source{remainingCitations > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {actionsConfig && actionsConfig.items.length > 0 && (
          <div className="flex justify-end">
            <ActionButtons
              actions={actionsConfig.items}
              align={actionsConfig.align ?? "right"}
              confirmTimeout={actionsConfig.confirmTimeout}
              onAction={handleAction}
              onBeforeAction={handleBeforeAction}
            />
          </div>
        )}
      </div>
    </article>
  );
}
