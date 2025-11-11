import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DocsArticleProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "3xl" | "none";
};

/**
 * Shared container for MDX-driven docs pages.
 * Encapsulates the surface, scroll area, padding, and prose styling.
 */
export function DocsArticle({
  children,
  className,
  maxWidth = "3xl",
}: DocsArticleProps) {
  return (
    <div className="bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg rounded-tl-lg border-t border-l">
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div
          className={cn(
            "prose dark:prose-invert mx-auto",
            maxWidth === "3xl" ? "max-w-3xl" : "max-w-none",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

