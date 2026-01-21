"use client";

import type { ReactNode } from "react";
import { DocsBorderedShell } from "./docs-bordered-shell";
import { DocsContent } from "./docs-content";
import { useDocsToc } from "./docs-toc-context";
import { DocsTocWrapper } from "./docs-toc-wrapper";

export function DocsArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { scrollContainerRef } = useDocsToc();

  return (
    <DocsBorderedShell>
      <div
        ref={scrollContainerRef}
        className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex max-w-[1200px] gap-8 p-6 pb-96 sm:p-10 sm:pb-96 lg:p-12 lg:pb-96 lg:pt-16">
          <DocsContent className={className}>{children}</DocsContent>
          <DocsTocWrapper />
        </div>
      </div>
    </DocsBorderedShell>
  );
}
