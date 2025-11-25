"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";
import { ArrowUp } from "lucide-react";

interface MockMessageProps {
  role: "user" | "assistant";
  children: React.ReactNode;
}

export function MockMessage({ role, children }: MockMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end" data-role="user">
        <div className="bg-primary text-primary-foreground rounded-full px-4 py-2">
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
    <figure className={cn("not-prose my-8", className)}>
      <div className="border-border bg-background overflow-hidden rounded-xl border shadow-sm">
        {/* Title bar */}
        <div className="bg-muted/50 border-border flex items-center gap-2 border-b px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="bg-border size-2.5 rounded-full" />
            <span className="bg-border size-2.5 rounded-full" />
            <span className="bg-border size-2.5 rounded-full" />
          </div>
          <span className="text-muted-foreground flex-1 text-center text-xs font-medium">
            Chat
          </span>
          <div className="w-[52px]" /> {/* Spacer to balance the dots */}
        </div>
        {/* Messages */}
        <div className="flex flex-col gap-4 p-4 [&>[data-role=user]+[data-role=assistant]]:mt-2 [&>[data-role=assistant]+[data-role=user]]:mt-2">
          {children}
        </div>
        {/* Composer */}
        <div className="border-border border-t px-4 py-3">
          <div className="bg-muted/50 border-border flex items-center gap-2 rounded-full border px-4 py-2">
            <span className="text-muted-foreground/60 flex-1 text-sm">
              Message...
            </span>
            <div className="bg-muted text-muted-foreground/60 flex size-7 items-center justify-center rounded-full">
              <ArrowUp className="size-4" />
            </div>
          </div>
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
