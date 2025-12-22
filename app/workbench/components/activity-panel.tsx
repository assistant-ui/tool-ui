"use client";

import { useConsoleLogs, useClearConsole } from "@/app/workbench/lib/store";
import { ActivitySection } from "./activity-section";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ActivityPanel() {
  const consoleLogs = useConsoleLogs();
  const clearConsole = useClearConsole();
  const logCount = consoleLogs.length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-border/40 flex h-9 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            Activity
          </span>
          {logCount > 0 && (
            <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
              {logCount}
            </span>
          )}
        </div>
        {logCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6"
                onClick={clearConsole}
              >
                <Trash2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Clear</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-2">
        <ActivitySection />
      </div>
    </div>
  );
}
