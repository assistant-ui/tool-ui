"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, Suspense } from "react";
import { cn } from "@/lib/ui/cn";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
    <div className="bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-tl-lg border-t border-l">
      <Tabs
        value={active}
        onValueChange={(value) =>
          handleTabChange((value as "docs" | "examples") ?? "docs")
        }
        className="flex h-full min-h-0 flex-col gap-0"
      >
        {/* Sticky tablist */}
        <div
          className={cn(
            "z-20 flex shrink-0 items-center justify-center border-b px-3 py-2 sm:px-6 sm:py-3",
            "bg-background/95 supports-backdrop-filter:bg-background/60 backdrop-blur",
          )}
        >
          <TabsList>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
        </div>

        {/* Content area */}
        <div
          id="examples"
          ref={contentRef}
          className="relative flex min-h-0 flex-1 flex-col scroll-mt-16"
        >
          <TabsContent
            value="docs"
            className="scrollbar-subtle h-full min-h-0 flex-1 overflow-auto"
          >
            <div className="z-0 min-h-0 flex-1 p-6 sm:p-10 lg:p-12">
              <div className="prose dark:prose-invert mx-auto max-w-3xl">
                {docs}
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value="examples"
            className="flex h-full min-h-0 flex-1 overflow-hidden"
          >
            {examples}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export function ComponentDocsExamples(props: ComponentDocsExamplesProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-background relative box-border flex h-full min-h-0 w-full flex-col overflow-hidden rounded-tl-lg border-t border-l" />
      }
    >
      <ComponentDocsExamplesInner {...props} />
    </Suspense>
  );
}
