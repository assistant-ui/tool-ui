import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export function DocsBorderedShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden border border-b-0 md:rounded-t-lg",
        className,
      )}
    >
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
