import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DocsArticleProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "2xl" | "none";
};

export function DocsArticle({
  children,
  className,
  maxWidth = "2xl",
}: DocsArticleProps) {
  return (
    <div className="bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg rounded-tl-lg border-t border-l">
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-auto overscroll-contain p-6 pb-24 sm:p-10 lg:p-12 lg:pt-16">
        <div
          className={cn(
            "prose dark:prose-invert mx-auto",
            maxWidth === "2xl" ? "max-w-2xl" : "max-w-none",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
