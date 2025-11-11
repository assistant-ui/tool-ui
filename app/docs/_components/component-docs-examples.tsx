"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ComponentDocsExamplesProps {
  docs: ReactNode;
  examples: ReactNode;
  defaultTab?: "docs" | "examples";
}

export function ComponentDocsExamples({
  docs,
  examples,
  defaultTab = "examples",
}: ComponentDocsExamplesProps) {
  const [active, setActive] = useState<"docs" | "examples">(defaultTab);

  return (
    <div className="bg-background scrollbar-subtle relative box-border flex h-full min-h-0 w-full flex-col overflow-auto overscroll-contain rounded-lg rounded-tl-lg border-t border-l">
      {/* Sticky tablist */}
      <div
        className={cn(
          "sticky top-0 z-20 flex items-center gap-2 border-b px-3 py-2 sm:px-6 sm:py-3",
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        )}
        role="tablist"
        aria-label="Component view"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === "docs"}
          className={cn(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
            active === "docs"
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground",
          )}
          onClick={() => setActive("docs")}
        >
          Docs
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === "examples"}
          className={cn(
            "inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors",
            active === "examples"
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground",
          )}
          onClick={() => setActive("examples")}
        >
          Examples
        </button>
      </div>

      {/* Content area */}
      <div className="relative min-h-0 flex-1">
        {active === "docs" ? (
          <div className="z-0 min-h-0 flex-1 p-6 sm:p-10 lg:p-12">
            <div className="prose dark:prose-invert mx-auto max-w-3xl">{docs}</div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 h-full flex">{examples}</div>
        )}
      </div>
    </div>
  );
}
