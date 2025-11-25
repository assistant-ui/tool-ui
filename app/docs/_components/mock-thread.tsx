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
        <div className="bg-primary/70 dark:bg-primary text-primary-foreground rounded-2xl px-4 py-2">
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
    <div
      className={cn(
        "not-prose border-border bg-muted/50 my-6 flex flex-col gap-4 rounded-lg border p-4 [&>[data-role=user]+[data-role=assistant]]:mt-2 [&>[data-role=assistant]+[data-role=user]]:mt-2",
        className,
      )}
    >
      {caption && (
        <div className="text-muted-foreground -mb-1 text-xs font-medium uppercase tracking-wide">
          {caption}
        </div>
      )}
      {children}
    </div>
  );
}
