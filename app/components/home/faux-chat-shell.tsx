"use client";

import { cn } from "@/lib/ui/cn";
import { ChatShowcase } from "./chat-showcase";

type FauxChatShellProps = {
  className?: string;
};

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="bg-foreground/10 size-3.5 rounded-full" />
      <span className="bg-foreground/10 size-3.5 rounded-full" />
      <span className="bg-foreground/10 size-3.5 rounded-full" />
    </div>
  );
}

function ComposerBar() {
  return (
    <div className="shrink-0 px-4 pb-4">
      <div className="bg-foreground/5 h-10 w-full rounded-full" />
    </div>
  );
}

export function FauxChatShell({ className }: FauxChatShellProps) {
  return (
    <div
      className={cn(
        "bg-background/60 flex h-full w-full flex-col overflow-hidden rounded-2xl backdrop-blur-md dark:bg-neutral-900/50",
        className,
      )}
      style={{
        boxShadow: [
          "inset 0 0 0 1px rgba(0, 0, 0, 0.06)",
          "0 1px 3px rgba(0, 0, 0, 0.005)",
          "0 2px 4px rgba(0, 0, 0, 0.008)",
          "0 4px 8px rgba(0, 0, 0, 0.02)",
          "0 8px 16px rgba(0, 0, 0, 0.02)",
          "0 16px 32px rgba(0, 0, 0, 0.02)",
          "0 32px 48px rgba(0, 0, 0, 0.03)",
        ].join(", "),
      }}
    >
      <div className="border-border/40 flex h-10 shrink-0 items-center border-b px-4 pt-0.5">
        <WindowDots />
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden p-2 xl:p-6">
        <ChatShowcase />
      </div>
      <ComposerBar />
    </div>
  );
}
