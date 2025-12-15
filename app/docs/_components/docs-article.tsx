import type { ReactNode } from "react";
import { DocsBorderedShell } from "./docs-bordered-shell";
import { DocsContent } from "./docs-content";

export function DocsArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DocsBorderedShell>
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 pb-24 sm:p-10 lg:p-12 lg:pt-16">
        <DocsContent className={className}>{children}</DocsContent>
      </div>
    </DocsBorderedShell>
  );
}
