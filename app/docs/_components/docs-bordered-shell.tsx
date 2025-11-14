import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "bg-background relative box-border flex h-full min-h-0 w-full flex-col border-t md:rounded-tl-lg md:border-l",
        className,
      )}
    >
      {/* Extend the border to the right */}
      <span
        aria-hidden
        className="bg-border pointer-events-none absolute -top-px -right-[3000px] hidden h-px w-[3000px] lg:block"
      />
      <div className="relative flex h-full min-h-0 w-full flex-1 flex-col rounded-tl-lg">
        {children}
      </div>
    </div>
  );
}
