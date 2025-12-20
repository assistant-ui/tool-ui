"use client";

import type { ConsoleEntry } from "@/app/workbench/lib/types";
import {
  eventIcons,
  typeColors,
  formatMethodName,
  formatTimestamp,
  extractToolName,
  extractKeyArg,
  isResponseEntry,
  extractDisplayMode,
  extractPrompt,
} from "./activity-utils";
import { cn } from "@/lib/ui/cn";
import { CornerDownRight, Wrench } from "lucide-react";
import {
  ExpandableRow,
  ExpandedContent,
  ArgsPreview,
  ResultPreview,
  ResponseRow,
  Timestamp,
} from "./activity-primitives";

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

function hasEntryDetails(entry: ConsoleEntry): boolean {
  return entry.args !== undefined || entry.result !== undefined;
}

function getMetadataPreview(entry: ConsoleEntry): string | null {
  switch (entry.type) {
    case "requestDisplayMode":
      return extractDisplayMode(entry.method);
    case "sendFollowUpMessage":
      return extractPrompt(entry.args);
    default:
      return null;
  }
}

function CallToolEntry({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: ConsoleEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const timestamp = formatTimestamp(entry.timestamp);
  const isResponse = isResponseEntry(entry.args, entry.result);
  const toolName = extractToolName(entry.method);
  const keyArg = !isResponse ? extractKeyArg(entry.args) : null;
  const hasDetails = hasEntryDetails(entry);

  if (isResponse) {
    return (
      <div className="group">
        <ExpandableRow
          onClick={onToggle}
          disabled={!hasDetails}
          className="py-1 pr-2 pl-14"
        >
          <CornerDownRight className="size-3 shrink-0" />
          <span className="text-muted-foreground truncate text-xs">
            Response
          </span>
          <Timestamp value={timestamp} isVisible={isExpanded} muted />
        </ExpandableRow>

        {isExpanded && hasDetails && (
          <ExpandedContent className="ml-14 pr-2 pb-2 pl-4">
            <ResultPreview value={entry.result} />
          </ExpandedContent>
        )}
      </div>
    );
  }

  const colorClass = typeColors.callTool;
  const Icon = eventIcons.callTool;

  return (
    <div className="group">
      <ExpandableRow
        onClick={onToggle}
        disabled={!hasDetails}
        className="py-1.5 pr-2 pl-8"
      >
        <Icon className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs", colorClass)}>
          {toolName || "callTool"}
        </span>
        {keyArg && (
          <span className="text-muted-foreground truncate text-xs">
            &quot;{keyArg}&quot;
          </span>
        )}
        <Timestamp value={timestamp} isVisible={isExpanded} />
      </ExpandableRow>

      {isExpanded && hasDetails && (
        <ExpandedContent className="ml-9 pr-2 pb-2 pl-4">
          <ArgsPreview value={entry.args} />
        </ExpandedContent>
      )}
    </div>
  );
}

export function ActivityEntry({
  entry,
  isExpanded,
  onToggle,
}: ActivityEntryProps) {
  if (entry.type === "callTool") {
    return (
      <CallToolEntry
        entry={entry}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    );
  }

  const timestamp = formatTimestamp(entry.timestamp);
  const Icon = eventIcons[entry.type];
  const colorClass = typeColors[entry.type];
  const methodName = formatMethodName(entry.method);
  const hasDetails = hasEntryDetails(entry);
  const metadataPreview = getMetadataPreview(entry);

  return (
    <div className="group">
      <ExpandableRow
        onClick={onToggle}
        disabled={!hasDetails}
        className="py-2 pr-6 pl-10"
      >
        <Icon className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs", colorClass)}>{methodName}</span>
        {metadataPreview && (
          <span className="text-muted-foreground truncate text-xs">
            {metadataPreview}
          </span>
        )}
        <Timestamp value={timestamp} isVisible={isExpanded} />
      </ExpandableRow>

      {isExpanded && hasDetails && (
        <ExpandedContent className="ml-11.5 pr-2 pb-2 pl-4">
          <ArgsPreview value={entry.args} />
          {entry.result !== undefined && (
            <pre className="mt-1 overflow-x-auto text-[10px] leading-relaxed text-emerald-600/80 dark:text-emerald-300">
              → {JSON.stringify(entry.result, null, 2)}
            </pre>
          )}
        </ExpandedContent>
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
  const requestTimestamp = formatTimestamp(request.timestamp);
  const toolName = extractToolName(request.method);
  const keyArg = extractKeyArg(request.args);
  const hasRequestDetails = request.args !== undefined;
  const hasResponseDetails = response?.result !== undefined;
  const colorClass = typeColors.callTool;

  return (
    <div className="group/request">
      <ExpandableRow
        onClick={onToggleRequest}
        disabled={!hasRequestDetails}
        className="py-1.5 pr-2 pl-10"
      >
        <Wrench className={cn("size-3.5 shrink-0", colorClass)} />
        <span className={cn("truncate text-xs", colorClass)}>
          {toolName || "callTool"}
        </span>
        {keyArg && (
          <span className="text-muted-foreground truncate text-xs">
            &quot;{keyArg}&quot;
          </span>
        )}
        <span
          className={cn(
            "text-muted-foreground/60 ml-auto shrink-0 text-[10px] tabular-nums transition-opacity",
            requestExpanded || responseExpanded
              ? "opacity-100"
              : "opacity-0 group-hover/request:opacity-100",
          )}
        >
          {requestTimestamp}
        </span>
      </ExpandableRow>

      {requestExpanded && (
        <ExpandedContent
          className={cn(
            "ml-11 pr-2 pl-4",
            !(responseExpanded && hasResponseDetails) && "pb-1",
          )}
        >
          <ArgsPreview value={request.args} className="pb-2" />

          {response && (
            <ResponseRow
              response={response}
              isExpanded={responseExpanded}
              onToggle={onToggleResponse}
            />
          )}
        </ExpandedContent>
      )}

      {!requestExpanded && response && (
        <ResponseRow
          response={response}
          isExpanded={responseExpanded}
          onToggle={onToggleResponse}
          standalone
        />
      )}
    </div>
  );
}
