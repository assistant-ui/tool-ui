"use client";

import { useCallback, useMemo, useState } from "react";
import { useConsoleLogs, useSimulation } from "@/app/workbench/lib/store";
import type { ConsoleEntry } from "@/app/workbench/lib/types";
import { ActivityEntry, CallToolGroupEntry } from "./activity-entry";
import { cn } from "@/lib/ui/cn";
import { ChevronDown, Circle, AlertCircle, Loader2 } from "lucide-react";

function extractToolName(method: string): string | null {
  const match = method.match(/callTool\("([^"]+)"\)/);
  return match ? match[1] : null;
}

function isResponseEntry(_args: unknown, result: unknown): boolean {
  return result !== undefined;
}

interface EntryGroup {
  id: string;
  request: ConsoleEntry;
  response: ConsoleEntry | null;
}

function groupCallToolEntries(
  logs: ConsoleEntry[],
): (ConsoleEntry | EntryGroup)[] {
  const result: (ConsoleEntry | EntryGroup)[] = [];
  const pendingRequests = new Map<string, ConsoleEntry>();

  for (const entry of logs) {
    if (entry.type !== "callTool") {
      result.push(entry);
      continue;
    }

    const toolName = extractToolName(entry.method);
    const isResponse = isResponseEntry(entry.args, entry.result);

    if (!isResponse) {
      if (toolName) {
        pendingRequests.set(toolName, entry);
      }
      result.push({ id: entry.id, request: entry, response: null });
    } else {
      const pendingRequest = toolName ? pendingRequests.get(toolName) : null;
      if (pendingRequest) {
        const groupIndex = result.findIndex(
          (item) => "request" in item && item.request.id === pendingRequest.id,
        );
        if (groupIndex !== -1) {
          (result[groupIndex] as EntryGroup).response = entry;
          pendingRequests.delete(toolName!);
          continue;
        }
      }
      result.push(entry);
    }
  }

  return result;
}

function ConfiguredToolsSummary() {
  const simulation = useSimulation();
  const [isExpanded, setIsExpanded] = useState(true);

  const configuredTools = useMemo(() => {
    return Object.entries(simulation.tools).filter(([, config]) => {
      return (
        config.responseMode !== "success" ||
        JSON.stringify(config.responseData) !==
          JSON.stringify({ success: true })
      );
    });
  }, [simulation.tools]);

  if (configuredTools.length === 0) {
    return null;
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "success":
        return (
          <Circle className="size-1.5 fill-emerald-500 text-emerald-500" />
        );
      case "error":
        return <AlertCircle className="size-2.5 text-red-500" />;
      case "hang":
        return <Loader2 className="size-2.5 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-border/40 mx-2 mb-2 rounded-md border">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted/40 flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition-colors"
      >
        <ChevronDown
          className={cn(
            "text-muted-foreground/60 size-3 shrink-0 transition-transform duration-150",
            isExpanded ? "rotate-0" : "-rotate-90",
          )}
        />
        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
          Configured Responses
        </span>
        <span className="ml-auto rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 tabular-nums dark:text-blue-400">
          {configuredTools.length}
        </span>
      </button>

      {isExpanded && (
        <div className="border-border/40 border-t px-2 py-1.5">
          <div className="flex flex-wrap gap-1">
            {configuredTools.map(([toolName, config]) => (
              <div
                key={toolName}
                className="bg-muted/50 flex items-center gap-1.5 rounded px-2 py-1"
              >
                {getModeIcon(config.responseMode)}
                <code className="text-[10px]">{toolName}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivitySection() {
  const logs = useConsoleLogs();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const groupedAndReversed = useMemo(() => {
    const grouped = groupCallToolEntries(logs);
    return [...grouped].reverse();
  }, [logs]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  if (logs.length === 0) {
    return (
      <div className="text-muted-foreground/60 flex h-full items-center justify-center text-xs">
        Events will appear here
      </div>
    );
  }

  return (
    <div className="scrollbar-subtle -mx-2 h-full min-h-0 overflow-y-auto pb-24">
      <ConfiguredToolsSummary />

      <div className="divide-border/30 divide-y">
        {groupedAndReversed.map((item) => {
          if ("request" in item) {
            return (
              <CallToolGroupEntry
                key={item.id}
                request={item.request}
                response={item.response}
                requestExpanded={expandedIds.has(item.request.id)}
                responseExpanded={
                  item.response ? expandedIds.has(item.response.id) : false
                }
                onToggleRequest={() => toggleExpanded(item.request.id)}
                onToggleResponse={() =>
                  item.response && toggleExpanded(item.response.id)
                }
              />
            );
          }
          return (
            <ActivityEntry
              key={item.id}
              entry={item}
              isExpanded={expandedIds.has(item.id)}
              onToggle={() => toggleExpanded(item.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
