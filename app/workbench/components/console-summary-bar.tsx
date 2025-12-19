"use client";

import { Terminal, ChevronUp } from "lucide-react";
import { useConsoleLogs } from "@/app/workbench/lib/store";
import { cn } from "@/lib/ui/cn";

interface ConsoleSummaryBarProps {
  onClick: () => void;
}

export function ConsoleSummaryBar({ onClick }: ConsoleSummaryBarProps) {
  const consoleLogs = useConsoleLogs();
  const lastEvent = consoleLogs[consoleLogs.length - 1];
  const hasLogs = consoleLogs.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-muted/30 hover:bg-muted/50 flex w-full items-center justify-between gap-2 border-t px-3 py-1.5 text-xs transition-colors",
        hasLogs ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <div className="flex items-center gap-2">
        <Terminal className="size-3.5" />
        {hasLogs ? (
          <>
            <span className="font-medium">{consoleLogs.length} events</span>
            <span className="text-muted-foreground max-w-48 truncate">
              Last: {lastEvent.method}
            </span>
          </>
        ) : (
          <span>Console</span>
        )}
      </div>
      <ChevronUp className="text-muted-foreground size-3.5" />
    </button>
  );
}
