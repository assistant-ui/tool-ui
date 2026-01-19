"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { ChatShowcase } from "./chat-showcase";

type FauxChatShellMobileProps = {
  className?: string;
  disableLightOverlay?: boolean;
};

function DynamicIsland() {
  return (
    <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2" aria-hidden="true">
      <div className="border-gradient-glow-notch h-9 w-32 rounded-full" />
    </div>
  );
}

function StatusBar() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes}`);
    };

    updateTime();

    const scheduleNextUpdate = () => {
      const now = new Date();
      const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      return setTimeout(() => {
        updateTime();
        intervalRef = setInterval(updateTime, 60000);
      }, msUntilNextMinute);
    };

    let intervalRef: ReturnType<typeof setInterval> | null = null;
    const timeoutRef = scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutRef);
      if (intervalRef) clearInterval(intervalRef);
    };
  }, []);

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6 text-sm">
      <div className="font-medium">{time}</div>
      <div className="flex items-center gap-1">
        {/* Signal/WiFi/Battery icons would go here - keeping minimal */}
      </div>
    </div>
  );
}

export function FauxChatShellMobile({ className, disableLightOverlay: _disableLightOverlay }: FauxChatShellMobileProps) {
  return (
    <div
      className={cn(
        "border-gradient-glow relative flex h-full w-full max-w-[430px] flex-col overflow-hidden rounded-[2.5rem] backdrop-blur-lg",
        className,
      )}
      style={{
        aspectRatio: "9 / 19.5",
        boxShadow: [
          "0 1px 3px rgba(0, 0, 0, 0.05)",
          "0 2px 4px rgba(0, 0, 0, 0.008)",
          "0 4px 8px rgba(0, 0, 0, 0.02)",
          "0 8px 16px rgba(0, 0, 0, 0.02)",
          "0 16px 32px rgba(0, 0, 0, 0.02)",
          "0 32px 48px rgba(0, 0, 0, 0.03)",
        ].join(", "),
        backfaceVisibility: "hidden",
        willChange: "transform",
        WebkitFontSmoothing: "subpixel-antialiased",
      }}
    >
      <DynamicIsland />
      <StatusBar />

      <div className="scrollbar-subtle relative z-0 grow overflow-y-auto px-4 pt-20">
        <ChatShowcase />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24"
        style={{
          background:
            "linear-gradient(to top, var(--glow-surface-to) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />

    </div>
  );
}
