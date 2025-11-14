"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  FileDiff,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "./_cn";
import type {
  CodeDiffActionEvent,
  CodeDiffProps,
  CodeDiffViewMode,
  SerializableCodeDiff,
  SerializableCodeDiffAction,
  SerializableCodeDiffFile,
  SerializableCodeDiffLine,
} from "./types";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "./_ui";

type ButtonVariant =
  | "default"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";

const VIEW_MODE_LABELS: Record<CodeDiffViewMode, string> = {
  unified: "Unified",
  split: "Split",
};

const ACTION_TONE_TO_VARIANT: Record<
  NonNullable<SerializableCodeDiffAction["tone"]>,
  ButtonVariant
> = {
  primary: "default",
  neutral: "outline",
  danger: "destructive",
};

const FILE_STATUS_DETAILS: Record<
  SerializableCodeDiffFile["status"],
  { label: string; className: string }
> = {
  added: {
    label: "Added",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  },
  deleted: {
    label: "Deleted",
    className: "bg-rose-500/10 text-rose-700 border-rose-500/30",
  },
  modified: {
    label: "Modified",
    className: "bg-muted text-foreground border-border/60",
  },
  renamed: {
    label: "Renamed",
    className: "bg-sky-500/10 text-sky-700 border-sky-500/30",
  },
};

const LINE_KIND_MARKER: Record<
  SerializableCodeDiffLine["kind"],
  { symbol: string; className: string; background: string }
> = {
  add: {
    symbol: "+",
    className: "text-emerald-600",
    background: "bg-emerald-500/10",
  },
  remove: {
    symbol: "−",
    className: "text-rose-600",
    background: "bg-rose-500/10",
  },
  context: {
    symbol: "",
    className: "text-muted-foreground",
    background: "bg-muted/40",
  },
};

const HIGHLIGHT_KIND_CLASS: Record<"add" | "remove" | "change", string> = {
  add: "bg-emerald-400/30",
  remove: "bg-rose-400/30",
  change: "bg-amber-400/30",
};

const RECEIPT_STATUS_STYLES: Record<
  NonNullable<SerializableCodeDiff["receipt"]>["status"],
  { label: string; badgeClass: string }
> = {
  success: {
    label: "Success",
    badgeClass: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  },
  partial: {
    label: "Partial",
    badgeClass: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  },
  failed: {
    label: "Failed",
    badgeClass: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border/60",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type ReceiptKind = NonNullable<
  NonNullable<SerializableCodeDiff["receipt"]>["kind"]
>;

const RECEIPT_KIND_HEADLINE: Record<ReceiptKind | "default", string> = {
  apply: "Changes applied",
  revert: "Changes reverted",
  comment: "Comment noted",
  custom: "Action completed",
  default: "Action completed",
};

function formatISODate(iso?: string) {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return DATE_FORMATTER.format(date);
}

export function CodeDiff(props: CodeDiffProps) {
  const {
    variant = "inline",
    viewMode: controlledViewMode,
    defaultViewMode = "unified",
    isStreaming = false,
    showLineNumbers = true,
    wrapLines = false,
    maxHeight,
    onBeforeAction,
    onAction,
    ...rest
  } = props;

  const diff = rest as SerializableCodeDiff;

  const [internalViewMode, setInternalViewMode] =
    React.useState<CodeDiffViewMode>(defaultViewMode ?? "unified");

  React.useEffect(() => {
    if (!controlledViewMode && defaultViewMode) {
      setInternalViewMode(defaultViewMode);
    }
  }, [controlledViewMode, defaultViewMode]);

  const resolvedViewMode = controlledViewMode ?? internalViewMode;
  const isSplitView = resolvedViewMode === "split";

  const [fileCollapseState, setFileCollapseState] = React.useState<
    Record<string, boolean>
  >({});
  const [hunkCollapseState, setHunkCollapseState] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    setFileCollapseState({});
    setHunkCollapseState({});
  }, [diff.id]);

  const emphasisSet = React.useMemo(
    () => new Set(diff.emphasisFileIds ?? []),
    [diff.emphasisFileIds],
  );

  const isReceiptMode = Boolean(diff.receipt);
  const isLoadingMore = isStreaming && diff.meta?.isComplete !== true;

  const emitAction = React.useCallback(
    async (event: CodeDiffActionEvent) => {
      if (isReceiptMode) return;
      const shouldProceed = (await onBeforeAction?.(event)) ?? true;
      if (!shouldProceed) return;
      await onAction?.(event);
    },
    [isReceiptMode, onBeforeAction, onAction],
  );

  const formatCapturedAt = React.useMemo(
    () => formatISODate(diff.capturedAtISO),
    [diff.capturedAtISO],
  );

  const headerMetaParts: string[] = [];
  if (diff.meta?.baseLabel || diff.meta?.headLabel) {
    headerMetaParts.push(
      [diff.meta.baseLabel, diff.meta.headLabel].filter(Boolean).join(" → "),
    );
  }
  if (diff.meta?.repository) {
    headerMetaParts.push(diff.meta.repository);
  }
  if (formatCapturedAt) {
    headerMetaParts.push(`As of ${formatCapturedAt}`);
  }

  const summaryParts: string[] = [];
  if (diff.summary) {
    summaryParts.push(
      `${diff.summary.filesChanged} file${diff.summary.filesChanged === 1 ? "" : "s"} changed`,
    );
    summaryParts.push(`+${diff.summary.insertions}`);
    summaryParts.push(`−${diff.summary.deletions}`);
  }

  const files = diff.files ?? [];
  const hasFiles = files.length > 0;

  const containerClasses = cn(
    "w-full rounded-xl border bg-card text-card-foreground shadow-xs",
    variant === "inline" ? "p-4" : "p-6",
  );

  const contentWrapperStyle = maxHeight ? { maxHeight } : undefined;
  const contentWrapperClassName = maxHeight
    ? "overflow-y-auto pr-1"
    : undefined;

  const summaryMetrics = diff.summary ? (
    <>
      <span className="text-foreground font-medium">{summaryParts[0]}</span>
      {summaryParts[1] ? (
        <span className="font-medium text-emerald-600">{summaryParts[1]}</span>
      ) : null}
      {summaryParts[2] ? (
        <span className="font-medium text-rose-600">{summaryParts[2]}</span>
      ) : null}
    </>
  ) : null;

  const summaryPlaceholder =
    !diff.summary && isLoadingMore ? (
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Skeleton className="h-4 w-28" />
        <span>Calculating summary…</span>
      </div>
    ) : null;

  return (
    <section
      className={cn(containerClasses, "@container/code-diff space-y-4")}
      aria-label={diff.title ?? "Code diff"}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <FileDiff className="text-muted-foreground size-4 shrink-0" />
              <h2 className="text-base leading-tight font-semibold">
                {diff.title ?? "Code changes"}
              </h2>
            </div>
            {diff.description ? (
              <p className="text-muted-foreground text-sm">
                {diff.description}
              </p>
            ) : null}
            {headerMetaParts.length > 0 ? (
              <p className="text-muted-foreground text-xs">
                {headerMetaParts.join(" · ")}
              </p>
            ) : null}
            {isLoadingMore ? (
              <p className="text-muted-foreground text-xs">
                Still loading more changes…
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <ViewModeToggle
              current={resolvedViewMode}
              onChange={(next) => {
                if (controlledViewMode) return;
                setInternalViewMode(next);
              }}
              disabled={isReceiptMode}
            />
          </div>
        </div>
        {diff.receipt ? <ReceiptBanner receipt={diff.receipt} /> : null}
        {(summaryMetrics || summaryPlaceholder || diff.receipt?.summary) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {summaryMetrics}
            {summaryPlaceholder}
            {diff.receipt?.summary ? (
              <span className="text-muted-foreground">
                {diff.receipt.summary}
              </span>
            ) : null}
          </div>
        )}
        {diff.actions && diff.actions.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-2">
            {diff.actions.map((action) => (
              <Button
                key={action.id}
                variant={
                  action.tone
                    ? ACTION_TONE_TO_VARIANT[action.tone]
                    : "secondary"
                }
                size="sm"
                disabled={isReceiptMode}
                onClick={() =>
                  emitAction({
                    scope: "diff",
                    actionId: action.id,
                    diff,
                  })
                }
              >
                {action.label}
                {action.shortcut ? (
                  <span className="text-muted-foreground font-mono text-xs">
                    {action.shortcut}
                  </span>
                ) : null}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        className={cn("space-y-4", contentWrapperClassName)}
        style={contentWrapperStyle}
      >
        {!hasFiles && (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            {isLoadingMore ? (
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <p>Looking for changes…</p>
              </div>
            ) : (
              <p>No changes to show.</p>
            )}
          </div>
        )}

        {files.map((file) => {
          const collapsed =
            fileCollapseState[file.id] ?? file.isCollapsed ?? false;
          const emphasis = emphasisSet.has(file.id);
          const hunkCount = file.hunks?.length ?? 0;
          const fileSummary =
            hunkCount > 0
              ? `${hunkCount} hunk${hunkCount === 1 ? "" : "s"}`
              : isLoadingMore
                ? "Loading hunks…"
                : "No hunks";
          const insertions = file.insertions ?? 0;
          const deletions = file.deletions ?? 0;

          return (
            <section
              key={file.id}
              aria-label={file.path}
              className={cn(
                "bg-background rounded-lg border",
                emphasis ? "ring-primary/60 ring-2" : "",
              )}
            >
              <div className="flex flex-wrap items-start gap-3 border-b px-4 py-3">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border text-xs font-medium",
                        FILE_STATUS_DETAILS[file.status].className,
                      )}
                    >
                      {FILE_STATUS_DETAILS[file.status].label}
                    </Badge>
                    <p className="font-mono text-sm">
                      <span className="truncate">{file.path}</span>
                      {file.oldPath && file.oldPath !== file.path ? (
                        <span className="text-muted-foreground text-xs">
                          {" "}
                          ← {file.oldPath}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {fileSummary}
                    {insertions > 0 ? ` · +${insertions}` : ""}
                    {deletions > 0 ? ` · −${deletions}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.actions?.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant={
                        action.tone
                          ? ACTION_TONE_TO_VARIANT[action.tone]
                          : "ghost"
                      }
                      disabled={isReceiptMode}
                      onClick={() =>
                        emitAction({
                          scope: "file",
                          actionId: action.id,
                          diff,
                          file,
                        })
                      }
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={collapsed ? "Expand file" : "Collapse file"}
                    onClick={() =>
                      setFileCollapseState((prev) => ({
                        ...prev,
                        [file.id]: !collapsed,
                      }))
                    }
                  >
                    {collapsed ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              {!collapsed && (
                <div className="divide-y">
                  {file.hunks && file.hunks.length > 0 ? (
                    file.hunks.map((hunk) => {
                      const hunkKey = `${file.id}:${hunk.id}`;
                      const hunkCollapsed =
                        hunkCollapseState[hunkKey] ?? hunk.isCollapsed ?? false;

                      return (
                        <div key={hunk.id}>
                          <div className="flex flex-wrap items-start gap-3 px-4 py-3">
                            <div className="flex-1 space-y-1">
                              {hunk.header ? (
                                <p className="text-muted-foreground font-mono text-xs">
                                  {hunk.header}
                                </p>
                              ) : null}
                              {hunk.summary ? (
                                <p className="text-sm">{hunk.summary}</p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              {hunk.actions?.map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={
                                    action.tone
                                      ? ACTION_TONE_TO_VARIANT[action.tone]
                                      : "ghost"
                                  }
                                  disabled={isReceiptMode}
                                  onClick={() =>
                                    emitAction({
                                      scope: "hunk",
                                      actionId: action.id,
                                      diff,
                                      file,
                                      hunk,
                                    })
                                  }
                                >
                                  {action.label}
                                </Button>
                              ))}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={
                                  hunkCollapsed
                                    ? "Expand hunk"
                                    : "Collapse hunk"
                                }
                                onClick={() =>
                                  setHunkCollapseState((prev) => ({
                                    ...prev,
                                    [hunkKey]: !hunkCollapsed,
                                  }))
                                }
                              >
                                {hunkCollapsed ? (
                                  <ChevronRight className="size-4" />
                                ) : (
                                  <ChevronDown className="size-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          {!hunkCollapsed && (
                            <div className="space-y-0">
                              {hunk.lines && hunk.lines.length > 0 ? (
                                isSplitView ? (
                                  <SplitLineRows
                                    lines={hunk.lines}
                                    showLineNumbers={showLineNumbers}
                                    wrapLines={wrapLines}
                                    disabled={isReceiptMode}
                                    onLineAction={(line, actionId) =>
                                      emitAction({
                                        scope: "line",
                                        actionId,
                                        diff,
                                        file,
                                        hunk,
                                        line,
                                      })
                                    }
                                  />
                                ) : (
                                  <div className="flex flex-col">
                                    {hunk.lines.map((line) => (
                                      <UnifiedLineRow
                                        key={line.id}
                                        line={line}
                                        showLineNumbers={showLineNumbers}
                                        wrapLines={wrapLines}
                                        disabled={isReceiptMode}
                                        onLineAction={(actionId) =>
                                          emitAction({
                                            scope: "line",
                                            actionId,
                                            diff,
                                            file,
                                            hunk,
                                            line,
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                )
                              ) : isStreaming &&
                                diff.meta?.isComplete !== true ? (
                                <LineSkeleton />
                              ) : (
                                <p className="text-muted-foreground px-4 py-3 text-sm">
                                  No lines in this hunk.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : isStreaming ? (
                    <div className="px-4 py-6">
                      <Skeleton className="mb-2 h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground px-4 py-6 text-sm">
                      No hunks available.
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ViewModeToggle({
  current,
  onChange,
  disabled,
}: {
  current: CodeDiffViewMode;
  onChange: (next: CodeDiffViewMode) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Diff view mode"
      className="inline-flex rounded-md border p-0.5"
    >
      {(Object.keys(VIEW_MODE_LABELS) as CodeDiffViewMode[]).map((mode) => {
        const isActive = current === mode;
        return (
          <Button
            key={mode}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            disabled={disabled}
            aria-pressed={isActive}
            className={cn(isActive ? "shadow-xs" : "", "px-3 py-1 text-xs")}
            onClick={() => {
              if (isActive || disabled) return;
              onChange(mode);
            }}
          >
            {VIEW_MODE_LABELS[mode]}
          </Button>
        );
      })}
    </div>
  );
}

function ReceiptBanner({
  receipt,
}: {
  receipt: NonNullable<SerializableCodeDiff["receipt"]>;
}) {
  const tone = RECEIPT_STATUS_STYLES[receipt.status];
  const affected =
    (receipt.fileIds?.length ?? 0) + (receipt.hunkIds?.length ?? 0);
  const headline = RECEIPT_KIND_HEADLINE[receipt.kind ?? "default"];
  const createdAtLabel = formatISODate(receipt.createdAtISO);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/20 bg-amber-200/10 px-3 py-2 text-sm text-amber-900">
      <Badge
        variant="outline"
        className={cn("border text-xs font-medium", tone.badgeClass)}
      >
        {tone.label}
      </Badge>
      <span className="font-medium">{headline}</span>
      <span className="text-foreground">{receipt.summary}</span>
      {affected > 0 ? (
        <span className="text-muted-foreground text-xs">
          {affected} item{affected === 1 ? "" : "s"} affected
        </span>
      ) : null}
      <span className="text-muted-foreground text-xs">
        Diff is now read-only.
      </span>
      {createdAtLabel ? (
        <span className="text-muted-foreground text-xs">{createdAtLabel}</span>
      ) : null}
    </div>
  );
}

function LineSkeleton() {
  return (
    <div className="space-y-2 px-4 py-3">
      {[0, 1, 2, 3, 4].map((index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

function UnifiedLineRow({
  line,
  showLineNumbers,
  wrapLines,
  disabled,
  onLineAction,
}: {
  line: SerializableCodeDiffLine;
  showLineNumbers: boolean;
  wrapLines: boolean;
  disabled?: boolean;
  onLineAction: (actionId: string) => void;
}) {
  const marker = LINE_KIND_MARKER[line.kind];
  const highlight = getHighlightedContent(line.content, line.highlightRanges);
  const ariaLabel = formatLineAriaLabel(line);

  return (
    <div
      className={cn(
        "group border-border/60 flex items-stretch gap-2 border-b px-4 py-2 text-xs last:border-b-0",
        line.kind !== "context" ? `${marker.background}` : "",
      )}
      aria-label={ariaLabel}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-4 items-center justify-center rounded-full text-xs font-semibold",
          marker.className,
        )}
        aria-hidden="true"
      >
        {marker.symbol}
      </span>

      {showLineNumbers ? (
        <span className="text-muted-foreground w-12 text-right font-mono">
          {line.lineNumber ?? ""}
        </span>
      ) : null}

      <div className="flex-1 overflow-hidden">
        <div
          className={cn(
            "font-mono text-[13px] leading-5",
            wrapLines
              ? "break-words whitespace-pre-wrap"
              : "overflow-x-auto whitespace-pre",
          )}
        >
          {highlight}
        </div>
      </div>

      {line.actions && line.actions.length > 0 ? (
        <LineActionsMenu
          actions={line.actions}
          disabled={disabled}
          onSelect={onLineAction}
        />
      ) : null}
    </div>
  );
}

function formatLineAriaLabel(line: SerializableCodeDiffLine) {
  const kindLabel =
    line.kind === "add"
      ? "Added"
      : line.kind === "remove"
        ? "Removed"
        : "Context";
  const base = `${kindLabel} line${line.lineNumber ? ` ${line.lineNumber}` : ""}`;
  const content =
    line.content.length > 140 ? `${line.content.slice(0, 137)}…` : line.content;
  return `${base}: ${content}`;
}

interface SplitLineRowData {
  id: string;
  left?: SerializableCodeDiffLine;
  right?: SerializableCodeDiffLine;
}

function buildSplitRows(lines: SerializableCodeDiffLine[]): SplitLineRowData[] {
  const rows: SplitLineRowData[] = [];
  let index = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line) break;

    if (line.kind === "context") {
      rows.push({
        id: `ctx-${line.id}-${index++}`,
        left: line,
        right: line,
      });
      i += 1;
      continue;
    }

    if (line.kind === "remove" || line.kind === "add") {
      const leftBlock: SerializableCodeDiffLine[] = [];
      const rightBlock: SerializableCodeDiffLine[] = [];

      while (i < lines.length && lines[i]?.kind === "remove") {
        leftBlock.push(lines[i]!);
        i += 1;
      }
      while (i < lines.length && lines[i]?.kind === "add") {
        rightBlock.push(lines[i]!);
        i += 1;
      }

      const maxLen = Math.max(leftBlock.length, rightBlock.length);
      for (let j = 0; j < maxLen; j++) {
        rows.push({
          id: `split-${index++}-${leftBlock[j]?.id ?? "none"}-${rightBlock[j]?.id ?? "none"}`,
          left: leftBlock[j],
          right: rightBlock[j],
        });
      }
      continue;
    }

    i += 1;
  }

  return rows;
}

function SplitLineRows({
  lines,
  showLineNumbers,
  wrapLines,
  disabled,
  onLineAction,
}: {
  lines: SerializableCodeDiffLine[];
  showLineNumbers: boolean;
  wrapLines: boolean;
  disabled?: boolean;
  onLineAction: (line: SerializableCodeDiffLine, actionId: string) => void;
}) {
  const rows = React.useMemo(() => buildSplitRows(lines), [lines]);

  return (
    <div className="flex flex-col">
      {rows.map((row, rowIndex) => (
        <SplitLineRow
          key={row.id}
          row={row}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          disabled={disabled}
          onLineAction={onLineAction}
          isLast={rowIndex === rows.length - 1}
        />
      ))}
    </div>
  );
}

function SplitLineRow({
  row,
  showLineNumbers,
  wrapLines,
  disabled,
  onLineAction,
  isLast,
}: {
  row: SplitLineRowData;
  showLineNumbers: boolean;
  wrapLines: boolean;
  disabled?: boolean;
  onLineAction: (line: SerializableCodeDiffLine, actionId: string) => void;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        "border-border/60 grid grid-cols-2 gap-4 border-b px-4 py-2 text-xs",
        isLast && "border-b-0",
      )}
    >
      <SplitLineColumn
        line={row.left}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
        disabled={disabled}
        onLineAction={onLineAction}
      />
      <SplitLineColumn
        line={row.right}
        showLineNumbers={showLineNumbers}
        wrapLines={wrapLines}
        disabled={disabled}
        onLineAction={onLineAction}
      />
    </div>
  );
}

function SplitLineColumn({
  line,
  showLineNumbers,
  wrapLines,
  disabled,
  onLineAction,
}: {
  line?: SerializableCodeDiffLine;
  showLineNumbers: boolean;
  wrapLines: boolean;
  disabled?: boolean;
  onLineAction: (line: SerializableCodeDiffLine, actionId: string) => void;
}) {
  const marker = line ? LINE_KIND_MARKER[line.kind] : undefined;
  const backgroundClass = line
    ? line.kind === "context"
      ? "bg-muted/40"
      : marker?.background
    : "bg-muted/20";

  const content = line
    ? getHighlightedContent(line.content, line.highlightRanges)
    : " ";

  return (
    <div
      className={cn(
        "group flex min-h-[40px] items-start gap-2 rounded-md px-2 py-1",
        backgroundClass,
      )}
      aria-label={line ? formatLineAriaLabel(line) : "No corresponding line"}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex size-4 items-center justify-center rounded-full text-xs font-semibold",
          marker?.className ?? "text-muted-foreground",
        )}
        aria-hidden="true"
      >
        {marker?.symbol ?? ""}
      </span>

      {showLineNumbers ? (
        <span className="text-muted-foreground w-12 text-right font-mono">
          {line?.lineNumber ?? ""}
        </span>
      ) : null}

      <div className="flex-1 overflow-hidden">
        <div
          className={cn(
            "font-mono text-[13px] leading-5",
            wrapLines
              ? "break-words whitespace-pre-wrap"
              : "overflow-x-auto whitespace-pre",
          )}
        >
          {content}
        </div>
      </div>

      {line && line.actions && line.actions.length > 0 ? (
        <LineActionsMenu
          actions={line.actions}
          disabled={disabled}
          onSelect={(actionId) => onLineAction(line, actionId)}
        />
      ) : null}
    </div>
  );
}

function LineActionsMenu({
  actions,
  disabled,
  onSelect,
}: {
  actions: SerializableCodeDiffAction[];
  disabled?: boolean;
  onSelect: (actionId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          disabled={disabled}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Line actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.id} onClick={() => onSelect(action.id)}>
            <span>{action.label}</span>
            {action.shortcut ? (
              <span className="text-muted-foreground ml-auto font-mono text-xs">
                {action.shortcut}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getHighlightedContent(
  content: string,
  ranges: SerializableCodeDiffLine["highlightRanges"],
) {
  if (!ranges || ranges.length === 0) {
    return content || " ";
  }
  const safeRanges = ranges
    .map((range) => {
      const start = Math.max(0, Math.min(content.length, range.start));
      const cappedLength = Math.max(
        0,
        Math.min(content.length - start, range.length),
      );
      return {
        ...range,
        start,
        length: cappedLength,
      };
    })
    .filter((range) => range.length > 0);

  if (safeRanges.length === 0) {
    return content || " ";
  }

  safeRanges.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  safeRanges.forEach((range, index) => {
    if (range.start > cursor) {
      nodes.push(content.slice(cursor, range.start));
    }
    const end = range.start + range.length;
    nodes.push(
      <mark
        key={`hl-${index}`}
        className={cn(
          "rounded px-0.5",
          range.kind ? HIGHLIGHT_KIND_CLASS[range.kind] : "bg-amber-300/60",
        )}
      >
        {content.slice(range.start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < content.length) {
    nodes.push(content.slice(cursor));
  }

  return nodes;
}
