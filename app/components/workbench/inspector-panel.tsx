"use client";

import { EventConsole } from "./event-console";
import { useConsoleLogs, useWorkbenchStore } from "@/lib/workbench/store";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export function InspectorPanel() {
  const consoleLogs = useConsoleLogs();
  const clearConsole = useWorkbenchStore((s) => s.clearConsole);

  return (
    <div className="relative flex h-full flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="scrollbar-subtle h-full overflow-y-auto">
        <div
          className="pointer-events-none absolute top-0 z-10 h-12 w-full bg-linear-to-b from-neutral-100 via-neutral-100 to-transparent dark:from-neutral-950 dark:via-neutral-950"
          aria-hidden="true"
        />

        <div className="sticky top-0 z-20 flex items-center justify-between pr-1.5 pl-3">
          <div className="text-muted-foreground flex h-9 items-center gap-1.5 text-sm">
            <Terminal className="size-3.5" />
            Console
          </div>
          {consoleLogs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
              onClick={clearConsole}
            >
              Clear
            </Button>
          )}
        </div>

        <EventConsole />
      </div>
    </div>
  );
}
