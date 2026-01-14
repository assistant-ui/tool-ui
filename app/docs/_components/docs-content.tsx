import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { DocsPager } from "./docs-pager";

interface DocsContentProps {
  children: ReactNode;
  className?: string;
  includePager?: boolean;
}

export function DocsContent({
  children,
  className,
  includePager = true,
}: DocsContentProps) {
  return (
    <div className={cn("prose dark:prose-invert mx-auto max-w-3xl flex-1", className)}>
      {children}
      {includePager && <DocsPager />}
    </div>
  );
}
