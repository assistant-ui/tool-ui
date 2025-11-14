import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DocsPager } from "./docs-pager";
import { DocsBorderedShell } from "./docs-bordered-shell";

export function DocsArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DocsBorderedShell>
      <div className="z-10 min-h-0 flex-1 overflow-auto overscroll-contain p-6 pb-24 sm:p-10 lg:p-12 lg:pt-16">
        <div
          className={cn(
            "prose dark:prose-invert mx-auto",
            "max-w-3xl",
            className,
          )}
        >
          {children}
          <DocsPager />
        </div>
      </div>
    </DocsBorderedShell>
  );
}
