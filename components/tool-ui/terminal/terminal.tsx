"use client";

import { useMemo, useState, useCallback } from "react";
import Ansi from "ansi-to-react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal as TerminalIcon,
  Timer,
} from "lucide-react";
import type { TerminalProps } from "./schema";
import {
  ActionButtons,
  normalizeActionsConfig,
  useCopyToClipboard,
} from "../shared";
import { Button, Collapsible, CollapsibleTrigger } from "./_adapter";
import { cn } from "./_adapter";
import { TerminalProgress } from "./progress";

const COPY_ID = "terminal-output";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

export function Terminal({
  id,
  command,
  stdout,
  stderr,
  exitCode,
  durationMs,
  cwd,
  truncated,
  maxCollapsedLines,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  isLoading,
  className,
}: TerminalProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { copiedId, copy } = useCopyToClipboard();

  const isSuccess = exitCode === 0;
  const hasOutput = stdout || stderr;
  const fullOutput = [stdout, stderr].filter(Boolean).join("\n");

  const lineCount = fullOutput.split("\n").length;
  const shouldCollapse = maxCollapsedLines && lineCount > maxCollapsedLines;
  const isCollapsed = shouldCollapse && !isExpanded;

  const normalizedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  const handleCopy = useCallback(() => {
    copy(fullOutput, COPY_ID);
  }, [fullOutput, copy]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "@container flex w-full min-w-80 flex-col gap-3",
          className,
        )}
        data-tool-ui-id={id}
        aria-busy="true"
      >
        <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
          <TerminalProgress />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "@container flex w-full min-w-80 flex-col gap-3",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="terminal"
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
        <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <TerminalIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <code className="text-foreground truncate font-mono text-sm">
              {cwd && <span className="text-muted-foreground">{cwd}$ </span>}
              {command}
            </code>
          </div>
          <div className="flex items-center gap-2">
            {durationMs !== undefined && (
              <span className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs tabular-nums">
                <Timer className="size-3" />
                {formatDuration(durationMs)}
              </span>
            )}
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                isSuccess
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {exitCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0"
              aria-label={copiedId === COPY_ID ? "Copied" : "Copy output"}
            >
              {copiedId === COPY_ID ? (
                <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
              ) : (
                <Copy className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {hasOutput && (
          <Collapsible open={!isCollapsed}>
            <div
              className={cn(
                "relative font-mono text-sm",
                isCollapsed && "max-h-[200px] overflow-hidden",
              )}
            >
              <div className="overflow-x-auto p-4">
                {stdout && (
                  <div className="text-foreground break-all whitespace-pre-wrap">
                    <Ansi>{stdout}</Ansi>
                  </div>
                )}
                {stderr && (
                  <div className="mt-2 break-all whitespace-pre-wrap text-red-500 dark:text-red-400">
                    <Ansi>{stderr}</Ansi>
                  </div>
                )}
                {truncated && (
                  <div className="text-muted-foreground mt-2 text-xs italic">
                    Output truncated...
                  </div>
                )}
              </div>

              {isCollapsed && (
                <div className="from-card absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
              )}
            </div>

            {shouldCollapse && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-muted-foreground w-full rounded-none border-t font-normal"
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="mr-1 size-4" />
                      Show all {lineCount} lines
                    </>
                  ) : (
                    <>
                      <ChevronUp className="mr-1 size-4" />
                      Collapse
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        )}

        {!hasOutput && (
          <div className="text-muted-foreground px-4 py-3 font-mono text-sm italic">
            No output
          </div>
        )}
      </div>

      {normalizedFooterActions && (
        <div className="@container/actions">
          <ActionButtons
            actions={normalizedFooterActions.items}
            align={normalizedFooterActions.align}
            confirmTimeout={normalizedFooterActions.confirmTimeout}
            onAction={(id) => onResponseAction?.(id)}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </div>
  );
}
