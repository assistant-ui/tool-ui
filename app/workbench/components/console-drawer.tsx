"use client";

import { useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EventConsole } from "./event-console";
import { useConsoleLogs, useClearConsole } from "@/app/workbench/lib/store";
import { Button } from "@/components/ui/button";
import { Terminal, Trash2, ArrowDownToLine, Copy, Check } from "lucide-react";
import type { ConsoleEntry, ConsoleEntryType } from "@/app/workbench/lib/types";

function formatTimestamp(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  const ms = date.getMilliseconds().toString().padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

function formatEntryForCopy(entry: ConsoleEntry): string {
  const parts = [
    `[${formatTimestamp(entry.timestamp)}]`,
    entry.method,
    entry.args !== undefined ? JSON.stringify(entry.args, null, 2) : "",
    entry.result !== undefined
      ? `→ ${JSON.stringify(entry.result, null, 2)}`
      : "",
  ];
  return parts.filter(Boolean).join(" ");
}

interface ConsoleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsoleDrawer({ open, onOpenChange }: ConsoleDrawerProps) {
  const consoleLogs = useConsoleLogs();
  const clearConsole = useClearConsole();
  const [typeFilter, setTypeFilter] = useState<ConsoleEntryType | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollToBottomTrigger, setScrollToBottomTrigger] = useState(0);
  const [copied, setCopied] = useState(false);

  const uniqueTypes = Array.from(new Set(consoleLogs.map((e) => e.type)));
  const filteredLogs =
    typeFilter === "all"
      ? consoleLogs
      : consoleLogs.filter((entry) => entry.type === typeFilter);

  const handleScrollToBottom = () => {
    setScrollToBottomTrigger((t) => t + 1);
    setAutoScroll(true);
  };

  const handleCopyAll = useCallback(async () => {
    const text = consoleLogs.map(formatEntryForCopy).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [consoleLogs]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[50vh] max-h-[500px] flex-col p-0"
      >
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between border-b px-4 py-2">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <SheetTitle className="flex items-center gap-1.5 text-sm font-normal">
              <Terminal className="size-3.5" />
              Console
            </SheetTitle>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as ConsoleEntryType | "all")
              }
              className="bg-muted text-foreground h-6 rounded-md border-0 pr-6 pl-2 text-xs"
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
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
                  onClick={handleCopyAll}
                  title="Copy all logs"
                >
                  {copied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
                  onClick={clearConsole}
                  title="Clear console"
                >
                  <Trash2 className="size-3" />
                </Button>
              </>
            )}
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 bg-neutral-100 dark:bg-neutral-950">
          <EventConsole
            logs={filteredLogs}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
            scrollToBottomTrigger={scrollToBottomTrigger}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
