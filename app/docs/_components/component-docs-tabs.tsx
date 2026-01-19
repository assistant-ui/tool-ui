"use client";

import { memo, useCallback, useRef, type ReactNode, Suspense } from "react";
import { BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsBorderedShell } from "./docs-bordered-shell";
import { DocsContent } from "./docs-content";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";

type DocsTab = "docs" | "examples";

const VALID_TABS = ["docs", "examples"] as const;

const NOTCH_WIDTH = 200;
const NOTCH_HEIGHT = 32;
const NOTCH_CURVE = 20;

function TabNotch({ className }: { className?: string }) {
  return (
    <svg
      width={NOTCH_WIDTH}
      height={NOTCH_HEIGHT}
      viewBox={`0 0 ${NOTCH_WIDTH} ${NOTCH_HEIGHT}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d={`
          M 0 ${NOTCH_HEIGHT}
          L 0 ${NOTCH_CURVE}
          Q 0 0 ${NOTCH_CURVE} 0
          L ${NOTCH_WIDTH - NOTCH_CURVE} 0
          Q ${NOTCH_WIDTH} 0 ${NOTCH_WIDTH} ${NOTCH_CURVE}
          L ${NOTCH_WIDTH} ${NOTCH_HEIGHT}
        `}
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />
    </svg>
  );
}

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
          id="examples"
          ref={contentRef}
          className="relative flex min-h-0 flex-1 scroll-mt-16 flex-col"
        >
          <TabsContent
            value="docs"
            className="scrollbar-subtle h-full min-h-0 flex-1 overflow-y-auto"
          >
            <div className="z-0 min-h-0 flex-1 p-6 pb-24 sm:p-10 lg:p-12">
              <DocsContent>
                <Suspense fallback={<ContentSkeleton />}>{docs}</Suspense>
              </DocsContent>
            </div>
          </TabsContent>
          <TabsContent
            value="examples"
            className="flex h-full min-h-0 flex-1 overflow-hidden"
          >
            <Suspense fallback={<ContentSkeleton />}>{examples}</Suspense>
          </TabsContent>
        </div>

        {/* Bottom fade gradient */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Notch tab switcher */}
        <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center">
          <TabNotch />
          <div
            className="flex items-center justify-center -mt-[26px]"
            style={{ width: NOTCH_WIDTH }}
          >
            <TabsList
              className={cn(
                "h-auto rounded-full p-0.5",
                "bg-muted/80",
              )}
            >
              <TabsTrigger
                value="docs"
                className={cn(
                  "min-w-16 rounded-full px-3 py-1.5 text-xs font-medium",
                  "text-primary",
                  "data-[state=active]:bg-background",
                  "data-[state=active]:shadow-sm",
                  "transition-all duration-150",
                )}
              >
                <BookOpen className="size-3.5" />
                Docs
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className={cn(
                  "min-w-16 rounded-full px-3 py-1.5 text-xs font-medium",
                  "text-primary",
                  "data-[state=active]:bg-background",
                  "data-[state=active]:shadow-sm",
                  "transition-all duration-150",
                )}
              >
                <Layers className="size-3.5" />
                Examples
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </Tabs>
    </DocsBorderedShell>
  );
});
