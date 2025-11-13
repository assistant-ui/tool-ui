"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, Suspense } from "react";
import { cn } from "@/lib/utils";

interface ComponentDocsExamplesProps {
  docs: ReactNode;
  examples: ReactNode;
  defaultTab?: "docs" | "examples";
}

function ComponentDocsExamplesInner({
  docs,
  examples,
  defaultTab = "docs",
}: ComponentDocsExamplesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<"docs" | "examples">(defaultTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "docs" || tabParam === "examples") {
      setActive((prev) => (prev === tabParam ? prev : tabParam));
      return;
    }

    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash === "#examples") {
      setActive((prev) => (prev === "examples" ? prev : "examples"));
      return;
    }

    setActive((prev) => (prev === defaultTab ? prev : defaultTab));
  }, [searchParams, defaultTab]);

  useEffect(() => {
    if (
      active === "examples" &&
      typeof window !== "undefined" &&
      window.location.hash === "#examples"
    ) {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [active]);

  const pushTabParam = (newTab: "docs" | "examples") => {
    const currentTab = searchParams.get("tab");
    if (currentTab === newTab) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (newTab: "docs" | "examples") => {
    setActive(newTab);
    pushTabParam(newTab);
  };

  return (
    <div className="bg-background scrollbar-subtle relative box-border flex h-full min-h-0 w-full flex-col overflow-auto overscroll-contain rounded-tl-lg border-t border-l">
      {/* Sticky tablist */}
      <div
        className={cn(
          "sticky top-0 z-20 flex items-center justify-center gap-2 border-b px-3 py-2 sm:px-6 sm:py-3",
          "bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur",
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
              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground border-transparent",
          )}
          onClick={() => handleTabChange("docs")}
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
              : "text-muted-foreground hover:bg-primary/5 hover:text-foreground border-transparent",
          )}
          onClick={() => handleTabChange("examples")}
        >
          Examples
        </button>
      </div>

      {/* Content area */}
      <div
        id="examples"
        ref={contentRef}
        className="relative min-h-0 flex-1 scroll-mt-16"
      >
        {active === "docs" ? (
          <div className="z-0 min-h-0 flex-1 p-6 sm:p-10 lg:p-12">
            <div className="prose dark:prose-invert mx-auto max-w-3xl">
              {docs}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-1">{examples}</div>
        )}
      </div>
    </div>
  );
}

export function ComponentDocsExamples(props: ComponentDocsExamplesProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-background scrollbar-subtle relative box-border flex h-full min-h-0 w-full flex-col overflow-auto overscroll-contain rounded-tl-lg border-t border-l" />
      }
    >
      <ComponentDocsExamplesInner {...props} />
    </Suspense>
  );
}
