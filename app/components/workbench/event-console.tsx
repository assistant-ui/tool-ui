"use client";

import { useEffect, useRef } from "react";
import { useConsoleLogs, useWorkbenchStore } from "@/lib/workbench/store";
import type { ConsoleEntryType } from "@/lib/workbench/types";
import { Button } from "@/components/ui/button";
import { Trash2, Terminal } from "lucide-react";
import { cn } from "@/lib/ui/cn";

const typeColors: Record<ConsoleEntryType, string> = {
  callTool: "text-blue-600 dark:text-blue-400",
  setWidgetState: "text-green-600 dark:text-green-400",
  requestDisplayMode: "text-purple-600 dark:text-purple-400",
  sendFollowUpMessage: "text-orange-600 dark:text-orange-400",
  requestClose: "text-gray-500 dark:text-gray-400",
  openExternal: "text-gray-500 dark:text-gray-400",
  notifyIntrinsicHeight: "text-teal-600 dark:text-teal-400",
  requestModal: "text-pink-600 dark:text-pink-400",
  event: "text-cyan-600 dark:text-cyan-400",
};

function formatTimestamp(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  try {
    const str = JSON.stringify(value);
    if (str.length > 100) {
      return str.slice(0, 100) + "...";
    }
    return str;
  } catch {
    return String(value);
  }
}

export function EventConsole() {
  const consoleLogs = useConsoleLogs();
  const clearConsole = useWorkbenchStore((s) => s.clearConsole);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [consoleLogs.length]);

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Console</span>
          <span className="text-muted-foreground text-xs">
            ({consoleLogs.length}{" "}
            {consoleLogs.length === 1 ? "event" : "events"})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={clearConsole}
          disabled={consoleLogs.length === 0}
        >
          <Trash2 className="size-3" />
          Clear
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-subtle flex-1 overflow-y-auto font-mono text-xs"
      >
        {consoleLogs.length === 0 ? (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Events will appear here when the component calls window.openai
            methods
          </div>
        ) : (
          <div className="divide-y">
            {consoleLogs.map((entry) => (
              <div
                key={entry.id}
                className="hover:bg-muted/50 flex gap-2 px-3 py-2 transition-colors"
              >
                <span className="text-muted-foreground shrink-0">
                  [{formatTimestamp(entry.timestamp)}]
                </span>

                <span
                  className={cn(
                    "shrink-0 font-semibold",
                    typeColors[entry.type],
                  )}
                >
                  {entry.method}
                </span>

                {entry.args !== undefined && (
                  <span className="text-muted-foreground truncate">
                    {formatValue(entry.args)}
                  </span>
                )}
                {entry.result !== undefined && (
                  <span className="truncate text-emerald-600 dark:text-emerald-400">
                    → {formatValue(entry.result)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
