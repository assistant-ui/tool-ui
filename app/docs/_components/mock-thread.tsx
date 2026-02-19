"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";

interface MockMessageProps {
  role: "user" | "assistant";
  children: React.ReactNode;
}

export function MockMessage({ role, children }: MockMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end" data-role="user">
        <div className="rounded-full bg-[#007AFF] px-4 py-2 text-white dark:bg-[#002b90]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-role="assistant">
      {children}
    </div>
  );
}

interface MockThreadProps {
  children: React.ReactNode;
  className?: string;
  caption?: string;
}

export function MockThread({ children, className, caption }: MockThreadProps) {
  return (
    <figure className={cn("not-prose my-8 flex min-w-0 flex-col overflow-hidden", className)}>
      <div className="border-border bg-background flex flex-1 flex-col overflow-hidden rounded-xl border shadow-sm">
        {/* Title bar */}
        <div className="bg-muted/50 border-border border-b px-4 py-1 text-center">
          <span className="text-muted-foreground text-xs font-medium">
            Chat
          </span>
        </div>
        {/* Messages */}
        <div className="flex flex-col gap-4 p-4 [&>[data-role=user]+[data-role=assistant]]:mt-2 [&>[data-role=assistant]+[data-role=user]]:mt-2">
          {children}
        </div>
      </div>
      {caption && (
        <figcaption className="text-muted-foreground mt-3 text-center text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
