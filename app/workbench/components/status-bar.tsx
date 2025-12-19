"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Activity } from "lucide-react";
import { useActiveToolCall, useConsoleLogs, useWorkbenchStore } from "@/app/workbench/lib/store";
import type { ConsoleEntry } from "@/app/workbench/lib/types";

const AUTO_DISMISS_MS = 3000;

function formatDelay(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}

function formatEventMessage(entry: ConsoleEntry): string {
  const parts = [entry.method];
  if (entry.args !== undefined) {
    const argsStr = typeof entry.args === "object"
      ? JSON.stringify(entry.args)
      : String(entry.args);
    if (argsStr.length < 50) {
      parts.push(argsStr);
    }
  }
  return parts.join(" ");
}

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const activeToolCall = useActiveToolCall();
  const consoleLogs = useConsoleLogs();
  const setConsoleOpen = useWorkbenchStore((s) => s.setConsoleOpen);
  const [lastEvent, setLastEvent] = useState<ConsoleEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (consoleLogs.length === 0) {
      setLastEvent(null);
      setIsVisible(false);
      return;
    }

    const latestEvent = consoleLogs[consoleLogs.length - 1];
    if (latestEvent !== lastEvent) {
      setLastEvent(latestEvent);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, AUTO_DISMISS_MS);

      return () => clearTimeout(timer);
    }
  }, [consoleLogs, lastEvent]);

  const handleClick = useCallback(() => {
    setConsoleOpen(true);
  }, [setConsoleOpen]);

  const showLoadingState = activeToolCall !== null;
  const showEventState = !showLoadingState && isVisible && lastEvent;

  if (!showLoadingState && !showEventState) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showLoadingState && (
        <motion.button
          key="loading"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          onClick={handleClick}
          className={`bg-background/80 border-border/40 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground ${className ?? ""}`}
        >
          <Loader2 className="text-primary size-3 animate-spin" />
          <span className="font-medium">{activeToolCall.toolName}</span>
          <span className="text-muted-foreground/60">
            {formatDelay(activeToolCall.delay)}
          </span>
        </motion.button>
      )}
      {showEventState && (
        <motion.button
          key={`event-${lastEvent.id}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          onClick={handleClick}
          className={`bg-background/80 border-border/40 text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1 text-xs backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground ${className ?? ""}`}
        >
          <Activity className="size-3" />
          <span className="max-w-48 truncate">
            {formatEventMessage(lastEvent)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
