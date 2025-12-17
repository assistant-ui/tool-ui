"use client";

import { cn } from "@/lib/ui/cn";
import { ChatShowcase } from "./chat-showcase";

type FauxChatShellProps = {
  className?: string;
};

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
    </div>
  );
}

function ComposerBar() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
      <div className="border-gradient-glow border-gradient-glow-composer h-10 w-full rounded-full" />
    </div>
  );
}

export function FauxChatShell({ className }: FauxChatShellProps) {
  return (
    <div
      className={cn(
        "border-gradient-glow relative flex h-full w-full flex-col overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        boxShadow: [
          "0 1px 3px rgba(0, 0, 0, 0.005)",
          "0 2px 4px rgba(0, 0, 0, 0.008)",
          "0 4px 8px rgba(0, 0, 0, 0.02)",
          "0 8px 16px rgba(0, 0, 0, 0.02)",
          "0 16px 32px rgba(0, 0, 0, 0.02)",
          "0 32px 48px rgba(0, 0, 0, 0.03)",
        ].join(", "),
      }}
    >
      <div className="bg-background/80 absolute z-20 w-full backdrop-blur-lg">
        <div className="flex h-10 shrink-0 items-center px-4 pt-0.5">
          <WindowDots />
        </div>
        <div className="gradient-line-header h-px" />
      </div>
      <div className="scrollbar-subtle relative z-0 grow overflow-y-auto px-6 pt-24">
        <ChatShowcase />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 right-3 bottom-0 z-10 h-24"
        style={{
          background:
            "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <ComposerBar />
    </div>
  );
}
