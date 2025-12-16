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
        "squircle relative box-border flex min-h-0 w-full grow flex-col overflow-hidden border lg:mr-2 lg:mb-2",
        className,
      )}
    >
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
