"use client";

import { useCallback, useMemo, useState } from "react";
import { useConsoleLogs, useClearConsole } from "@/app/workbench/lib/store";
import type { ConsoleEntry } from "@/app/workbench/lib/types";
import { ActivityEntry, CallToolGroupEntry } from "./activity-entry";
import { extractToolName, isResponseEntry } from "./activity-utils";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EntryGroup {
  id: string;
  request: ConsoleEntry;
  response: ConsoleEntry | null;
}

function groupCallToolEntries(logs: ConsoleEntry[]): (ConsoleEntry | EntryGroup)[] {
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
          (item) => "request" in item && item.request.id === pendingRequest.id
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

export function ActivitySection() {
  const logs = useConsoleLogs();
  const clearConsole = useClearConsole();
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
    <div className="flex h-full min-h-0 flex-col gap-1">
      <div className="flex shrink-0 items-center justify-end gap-1 -mt-1 -mr-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="bg-background/80 text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
              onClick={clearConsole}
            >
              <Trash2 className="size-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Clear</TooltipContent>
        </Tooltip>
      </div>

      <div className="scrollbar-subtle -mx-2 min-h-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-border/30">
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
    </div>
  );
}
