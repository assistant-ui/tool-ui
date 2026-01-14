"use client";

import { memo, useCallback, useRef, type ReactNode, Suspense } from "react";
import { cn } from "@/lib/ui/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsBorderedShell } from "./docs-bordered-shell";
import { DocsContent } from "./docs-content";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";
import { useDocsToc } from "./docs-toc-context";
import { DocsTocWrapper } from "./docs-toc-wrapper";

type DocsTab = "docs" | "examples";

const VALID_TABS = ["docs", "examples"] as const;

function ContentSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="bg-muted h-8 w-3/4 rounded" />
      <div className="bg-muted h-4 w-full rounded" />
      <div className="bg-muted h-4 w-5/6 rounded" />
      <div className="bg-muted h-4 w-4/5 rounded" />
      <div className="bg-muted mt-6 h-32 w-full rounded" />
    </div>
  );
}

interface ComponentDocsTabsProps {
  docs: ReactNode;
  examples: ReactNode;
}

export const ComponentDocsTabs = memo(function ComponentDocsTabs({
  docs,
  examples,
}: ComponentDocsTabsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollContainerRef } = useDocsToc();

  const { activeTab, setActiveTab } = useTabSearchParam<DocsTab>({
    defaultTab: "docs",
    validTabs: VALID_TABS,
    scrollTargetRef: contentRef,
    hashTrigger: "#examples",
  });

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "docs" || value === "examples") {
        setActiveTab(value);
      }
    },
    [setActiveTab],
  );

  return (
    <DocsBorderedShell>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex h-full min-h-0 flex-col gap-0"
      >
        <div
          className={cn(
            "pointer-events-none absolute top-0 right-2 left-0 z-10 h-24",
            "from-background via-background/80 bg-linear-to-b to-transparent",
          )}
        />
        <div
          className={cn(
            "absolute top-0 right-0 left-0 z-20 flex shrink-0 items-center justify-center",
            "px-2 py-2 sm:px-3 sm:py-3",
          )}
        >
          <TabsList className="bg-primary/5">
            <TabsTrigger value="docs" className="min-w-24">
              Docs
            </TabsTrigger>
            <TabsTrigger value="examples" className="min-w-24">
              Examples
            </TabsTrigger>
          </TabsList>
        </div>

        <div
          id="examples"
          ref={contentRef}
          className="relative flex min-h-0 flex-1 scroll-mt-16 flex-col"
        >
          <TabsContent
            ref={scrollContainerRef}
            value="docs"
            className="scrollbar-subtle h-full min-h-0 flex-1 overflow-y-auto pt-12"
          >
            <div className="z-0 min-h-0 flex-1">
              <div className="mx-auto flex max-w-[1200px] gap-8 p-6 pb-96 sm:p-10 sm:pb-96 lg:p-12 lg:pb-96">
                <DocsContent>
                  <Suspense fallback={<ContentSkeleton />}>{docs}</Suspense>
                </DocsContent>
                <DocsTocWrapper />
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="examples"
            className="flex h-full min-h-0 flex-1 overflow-hidden pt-16"
          >
            <Suspense fallback={<ContentSkeleton />}>{examples}</Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </DocsBorderedShell>
  );
});
