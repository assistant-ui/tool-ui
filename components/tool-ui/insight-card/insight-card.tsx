"use client";

import * as React from "react";
import { cn } from "./_adapter";
import type {
  InsightCardProps,
  InsightSeverity,
  InsightConfidence,
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
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    accent: "border-sky-500/20",
    bar: "bg-sky-500",
  },
  success: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    accent: "border-emerald-500/20",
    bar: "bg-emerald-500",
  },
  warning: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    accent: "border-amber-500/20",
    bar: "bg-amber-500",
  },
  critical: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    accent: "border-rose-500/20",
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

function getConfidenceLabel(confidence?: InsightConfidence) {
  if (!confidence) return null;
  if (confidence.label) return confidence.label;
  const score = clampScore(confidence.score);
  if (score >= 0.85) return "High";
  if (score >= 0.6) return "Medium";
  if (score >= 0.35) return "Low";
  return "Very Low";
}

function formatConfidenceScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function InsightCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex w-full min-w-72 max-w-md flex-col", className)}
      data-slot="insight-card-progress"
      aria-busy="true"
    >
      <div className="bg-card flex w-full flex-col gap-3 rounded-2xl border p-4 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="bg-muted h-4 w-40 rounded" />
            <div className="bg-muted h-3 w-52 rounded" />
          </div>
          <div className="bg-muted h-6 w-20 rounded-full" />
        </div>
        <div className="bg-muted h-2 w-full rounded-full" />
        <div className="bg-muted h-16 w-full rounded-xl" />
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
      className="border-border/60 bg-muted/30 flex flex-col gap-1 rounded-xl border px-3 py-2"
    >
      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{citation.source}</span>
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noreferrer"
            className="text-foreground/70 hover:text-foreground text-[11px]"
          >
            Open
          </a>
        )}
      </div>
      <span className="text-xs font-semibold leading-snug line-clamp-1">
        {citation.title}
      </span>
      {variant === "detailed" && citation.excerpt && (
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
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
  footer,
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
  const showSeverityBadge = Boolean(severity);

  const confidenceLabel = getConfidenceLabel(confidence);
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

  const citationLimit = variant === "detailed" ? 3 : variant === "standard" ? 2 : 0;
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
        "@container/actions flex w-full min-w-72 max-w-md flex-col",
        "text-foreground",
        className,
      )}
      data-slot="insight-card"
      data-tool-ui-id={id}
      data-variant={variant}
      ref={containerRef}
    >
      <div
        className={cn(
          "bg-card/95 flex w-full flex-col gap-3 rounded-2xl border shadow-xs",
          severityStyles.accent,
          variant === "compact" ? "p-4" : "p-5",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            </div>
            <p
              className={cn(
                "text-muted-foreground text-xs leading-relaxed text-pretty",
                variant === "compact" ? "line-clamp-2" : "line-clamp-3",
              )}
            >
              {summary}
            </p>
          </div>
          {showSeverityBadge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                severityStyles.badge,
              )}
            >
              {SEVERITY_LABELS[severity]}
            </span>
          )}
        </div>

        {confidence && confidenceScore !== null && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              <span>Confidence</span>
              <span>
                {confidenceLabel}
                {confidencePercent ? ` · ${confidencePercent}` : ""}
              </span>
            </div>
            <div className="bg-muted/70 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={cn("h-full rounded-full", severityStyles.bar)}
                style={{ width: `${confidenceScore * 100}%` }}
              />
            </div>
          </div>
        )}

        {visibleCitations.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              <span>Evidence</span>
              {citations && citations.length > 0 && (
                <span>{citations.length} sources</span>
              )}
            </div>
            <ul className="flex flex-col gap-2">
              {visibleCitations.map((citation) =>
                renderCitationItem(citation, variant),
              )}
            </ul>
            {remainingCitations > 0 && (
              <span className="text-muted-foreground text-[11px]">
                +{remainingCitations} more sources
              </span>
            )}
          </div>
        )}

        {actionsConfig && actionsConfig.items.length > 0 && (
          <div className="@container/actions pt-1">
            <ActionButtons
              actions={actionsConfig.items}
              align={actionsConfig.align ?? "left"}
              confirmTimeout={actionsConfig.confirmTimeout}
              onAction={handleAction}
              onBeforeAction={handleBeforeAction}
              className="gap-2"
            />
          </div>
        )}

        {footer && (
          <div className="text-muted-foreground text-[11px]">{footer}</div>
        )}
      </div>
    </article>
  );
}
