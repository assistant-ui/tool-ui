"use client";

import { useState } from "react";
import { EventConsole } from "./event-console";
import { useConsoleLogs, useClearConsole } from "@/lib/workbench/store";
import { Button } from "@/components/ui/button";
import { Terminal, Trash2, ArrowDownToLine } from "lucide-react";
import type { ConsoleEntryType } from "@/lib/workbench/types";

export function InspectorPanel() {
  const consoleLogs = useConsoleLogs();
  const clearConsole = useClearConsole();
  const [typeFilter, setTypeFilter] = useState<ConsoleEntryType | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollToBottomTrigger, setScrollToBottomTrigger] = useState(0);

  const uniqueTypes = Array.from(new Set(consoleLogs.map((e) => e.type)));
  const filteredLogs =
    typeFilter === "all"
      ? consoleLogs
      : consoleLogs.filter((entry) => entry.type === typeFilter);

  const handleScrollToBottom = () => {
    setScrollToBottomTrigger((t) => t + 1);
    setAutoScroll(true);
  };

  return (
    <div className="flex h-full flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="flex shrink-0 items-center justify-between border-b px-3 py-2">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Terminal className="size-3.5" />
            Console
          </div>
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as ConsoleEntryType | "all")
            }
            className="bg-muted text-foreground h-6 rounded-md border-0 pl-2 pr-6 text-xs"
          >
            <option value="all">All</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          {!autoScroll && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
              onClick={handleScrollToBottom}
              title="Scroll to bottom"
            >
              <ArrowDownToLine className="size-3" />
            </Button>
          )}
          {consoleLogs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
              onClick={clearConsole}
              title="Clear console"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </div>

      <EventConsole
        logs={filteredLogs}
        autoScroll={autoScroll}
        onAutoScrollChange={setAutoScroll}
        scrollToBottomTrigger={scrollToBottomTrigger}
      />
    </div>
  );
}
