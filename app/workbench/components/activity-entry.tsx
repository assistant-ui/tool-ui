"use client";

import type { ConsoleEntry } from "@/app/workbench/lib/types";
import { useRelativeTime } from "@/app/workbench/hooks/use-relative-time";
import {
  eventIcons,
  typeColors,
  formatMethodName,
  extractToolName,
  extractKeyArg,
  isResponseEntry,
  extractDisplayMode,
  extractPrompt,
  extractResultPreview,
} from "./activity-utils";
import { cn } from "@/lib/ui/cn";
import { ChevronRight, CornerDownRight, Wrench } from "lucide-react";

interface ActivityEntryProps {
  entry: ConsoleEntry;
  isExpanded: boolean;
  onToggle: () => void;
}

interface CallToolGroupEntryProps {
  request: ConsoleEntry;
  response: ConsoleEntry | null;
  requestExpanded: boolean;
  responseExpanded: boolean;
  onToggleRequest: () => void;
  onToggleResponse: () => void;
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function CallToolEntry({
  entry,
  isExpanded,
  onToggle,
  relativeTime,
}: {
  entry: ConsoleEntry;
  isExpanded: boolean;
  onToggle: () => void;
  relativeTime: string;
}) {
  const isResponse = isResponseEntry(entry.args, entry.result);
  const toolName = extractToolName(entry.method);
  const keyArg = !isResponse ? extractKeyArg(entry.args) : null;

  const Icon = isResponse ? CornerDownRight : eventIcons.callTool;
  const hasDetails = entry.args !== undefined || entry.result !== undefined;

  if (isResponse) {
    const resultPreview = extractResultPreview(entry.result);

    return (
      <div className="group">
        <button
          type="button"
          onClick={onToggle}
          disabled={!hasDetails}
          className={cn(
            "flex w-full items-center gap-2 px-2 py-1 pl-8 text-left transition-colors",
            hasDetails && "hover:bg-muted/40",
            !hasDetails && "cursor-default",
          )}
        >
          <Icon className="size-3 shrink-0" />
          <span className="truncate text-xs">{resultPreview}</span>
          <span className="text-muted-foreground/40 ml-auto shrink-0 text-[10px] tabular-nums">
            {relativeTime}
          </span>
          {hasDetails && (
            <ChevronRight
              className={cn(
                "size-3 shrink-0 transition-transform duration-150",
                "text-muted-foreground/30 group-hover:text-muted-foreground/50",
                isExpanded && "rotate-90",
              )}
            />
          )}
        </button>

        {isExpanded && hasDetails && (
          <div className="border-primary/30 ml-9 border-l pb-2 pl-3">
            {entry.result !== undefined && (
              <pre className="overflow-x-auto text-[10px] leading-relaxed text-emerald-600/80 dark:text-emerald-300">
                {formatValue(entry.result)}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }

  const colorClass = typeColors.callTool;

  return (
    <div className="group">
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasDetails}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors",
          hasDetails && "hover:bg-muted/40",
          !hasDetails && "cursor-default",
        )}
      >
        <Icon className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs font-medium", colorClass)}>
          {toolName || "callTool"}
        </span>
        {keyArg && (
          <span className="text-muted-foreground truncate text-xs">
            &quot;{keyArg}&quot;
          </span>
        )}
        <span className="text-muted-foreground/60 ml-auto shrink-0 text-[10px] tabular-nums">
          {relativeTime}
        </span>
        {hasDetails && (
          <ChevronRight
            className={cn(
              "size-3 shrink-0 transition-transform duration-150",
              "text-muted-foreground/40 group-hover:text-muted-foreground",
              isExpanded && "rotate-90",
            )}
          />
        )}
      </button>

      {isExpanded && hasDetails && (
        <div className="border-primary/30 ml-3 border-l pb-2 pl-4">
          {entry.args !== undefined && (
            <pre className="text-muted-foreground overflow-x-auto text-[10px] leading-relaxed">
              {formatValue(entry.args)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function ActivityEntry({
  entry,
  isExpanded,
  onToggle,
}: ActivityEntryProps) {
  const relativeTime = useRelativeTime(entry.timestamp);

  if (entry.type === "callTool") {
    return (
      <CallToolEntry
        entry={entry}
        isExpanded={isExpanded}
        onToggle={onToggle}
        relativeTime={relativeTime}
      />
    );
  }

  const Icon = eventIcons[entry.type];
  const colorClass = typeColors[entry.type];
  const methodName = formatMethodName(entry.method);

  const hasDetails = entry.args !== undefined || entry.result !== undefined;

  // Extract metadata preview based on entry type
  let metadataPreview: string | null = null;
  switch (entry.type) {
    case "requestDisplayMode":
      metadataPreview = extractDisplayMode(entry.method);
      break;
    case "sendFollowUpMessage":
      metadataPreview = extractPrompt(entry.args);
      break;
  }

  return (
    <div className="group">
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasDetails}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors",
          hasDetails && "hover:bg-muted/40",
          !hasDetails && "cursor-default",
        )}
      >
        <Icon className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs font-medium", colorClass)}>
          {methodName}
        </span>
        {metadataPreview && (
          <span className="text-muted-foreground truncate text-xs">
            {metadataPreview}
          </span>
        )}
        <span className="text-muted-foreground/60 ml-auto shrink-0 text-[10px] tabular-nums">
          {relativeTime}
        </span>
        {hasDetails && (
          <ChevronRight
            className={cn(
              "size-3 shrink-0 transition-transform duration-150",
              "text-muted-foreground/40 group-hover:text-muted-foreground",
              isExpanded && "rotate-90",
            )}
          />
        )}
      </button>

      {isExpanded && hasDetails && (
        <div className="border-primary/30 ml-3.5 border-l pb-2 pl-4">
          {entry.args !== undefined && (
            <pre className="text-muted-foreground overflow-x-auto text-[10px] leading-relaxed">
              {formatValue(entry.args)}
            </pre>
          )}
          {entry.result !== undefined && (
            <pre className="mt-1 overflow-x-auto text-[10px] leading-relaxed text-emerald-600 dark:text-emerald-400">
              → {formatValue(entry.result)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function CallToolGroupEntry({
  request,
  response,
  requestExpanded,
  responseExpanded,
  onToggleRequest,
  onToggleResponse,
}: CallToolGroupEntryProps) {
  const requestRelativeTime = useRelativeTime(request.timestamp);
  const responseRelativeTime = useRelativeTime(
    response?.timestamp ?? request.timestamp,
  );

  const toolName = extractToolName(request.method);
  const keyArg = extractKeyArg(request.args);
  const hasRequestDetails = request.args !== undefined;
  const hasResponseDetails = response?.result !== undefined;
  const resultPreview = response ? extractResultPreview(response.result) : "";

  const colorClass = typeColors.callTool;

  return (
    <div className="group/request">
      {/* Request row */}
      <button
        type="button"
        onClick={onToggleRequest}
        disabled={!hasRequestDetails}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors",
          hasRequestDetails && "hover:bg-muted/40",
          !hasRequestDetails && "cursor-default",
        )}
      >
        <Wrench className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs font-medium", colorClass)}>
          {toolName || "callTool"}
        </span>
        {keyArg && (
          <span className="text-muted-foreground truncate text-xs">
            &quot;{keyArg}&quot;
          </span>
        )}
        <span className="text-muted-foreground/60 ml-auto shrink-0 text-[10px] tabular-nums">
          {requestRelativeTime}
        </span>
        {hasRequestDetails && (
          <ChevronRight
            className={cn(
              "size-3 shrink-0 transition-transform duration-150",
              "text-muted-foreground/40 group-hover/request:text-muted-foreground",
              requestExpanded && "rotate-90",
            )}
          />
        )}
      </button>

      {/* Request expanded: border wraps args and response */}
      {requestExpanded && (
        <div
          className={cn(
            "border-primary/30 ml-3.5 border-l pl-4",
            !(responseExpanded && hasResponseDetails) && "pb-1",
          )}
        >
          {/* Request args */}
          {request.args !== undefined && (
            <pre className="text-muted-foreground overflow-x-auto pb-2 text-[10px] leading-relaxed">
              {formatValue(request.args)}
            </pre>
          )}

          {/* Response inside border */}
          {response && (
            <div className="group/response -ml-1">
              <button
                type="button"
                onClick={onToggleResponse}
                disabled={!hasResponseDetails}
                className={cn(
                  "flex w-full items-center gap-2 py-1 text-left transition-colors",
                  hasResponseDetails && "hover:bg-muted/40",
                  !hasResponseDetails && "cursor-default",
                )}
              >
                <CornerDownRight className="size-3 shrink-0" />
                <span className="truncate text-xs">{resultPreview}</span>
                <span className="text-muted-foreground/40 ml-auto shrink-0 text-[10px] tabular-nums">
                  {responseRelativeTime}
                </span>
                {hasResponseDetails && (
                  <ChevronRight
                    className={cn(
                      "size-3 shrink-0 transition-transform duration-150",
                      "text-muted-foreground/30 group-hover/response:text-muted-foreground/50",
                      responseExpanded && "rotate-90",
                    )}
                  />
                )}
              </button>

              {/* Response content */}
              {responseExpanded && hasResponseDetails && (
                <div className="border-primary/20 ml-1 border-l pb-1 pl-4">
                  <pre className="overflow-x-auto text-[10px] leading-relaxed text-emerald-600/80 dark:text-emerald-300">
                    {formatValue(response.result)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Response when request is collapsed - no outer border */}
      {!requestExpanded && response && (
        <div className="group/response ml-6">
          <button
            type="button"
            onClick={onToggleResponse}
            disabled={!hasResponseDetails}
            className={cn(
              "flex w-full items-center gap-2 py-1 text-left transition-colors",
              hasResponseDetails && "hover:bg-muted/40",
              !hasResponseDetails && "cursor-default",
            )}
          >
            <CornerDownRight className="size-3 shrink-0" />
            <span className="truncate text-xs">{resultPreview}</span>
            <span className="text-muted-foreground/40 ml-auto shrink-0 text-[10px] tabular-nums">
              {responseRelativeTime}
            </span>
            {hasResponseDetails && (
              <ChevronRight
                className={cn(
                  "size-3 shrink-0 transition-transform duration-150",
                  "text-muted-foreground/30 group-hover/response:text-muted-foreground/50",
                  responseExpanded && "rotate-90",
                )}
              />
            )}
          </button>

          {/* Response content */}
          {responseExpanded && hasResponseDetails && (
            <div className="border-primary/20 ml-1 border-l pb-1 pl-4">
              <pre className="overflow-x-auto text-[10px] leading-relaxed text-emerald-600/80 dark:text-emerald-300">
                {formatValue(response.result)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
