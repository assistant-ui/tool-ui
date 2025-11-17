"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllDocsPageLinks } from "./docs-pages";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/button";

function useDocsPagination() {
  const pathname = usePathname();

  return React.useMemo(() => {
    const links = getAllDocsPageLinks();
    const currentIndex = links.findIndex((link) => link.path === pathname);
    if (currentIndex === -1) return { prev: null, next: null };
    const prev = currentIndex > 0 ? links[currentIndex - 1] : null;
    const next =
      currentIndex < links.length - 1 ? links[currentIndex + 1] : null;
    return { prev, next };
  }, [pathname]);
}

type PagerLinkProps = {
  href: string;
  label: string;
  direction: "prev" | "next";
};

function PagerLink({ href, label, direction }: PagerLinkProps) {
  const isPrev = direction === "prev";
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "w-fit gap-3 py-5",
        isPrev ? "justify-start" : "justify-end text-right",
      )}
      aria-label={`Go to ${label}`}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-3",
          isPrev ? "text-left" : "text-right",
        )}
      >
        {isPrev ? (
          <>
            <ArrowLeft className="text-muted-foreground size-4 shrink-0" />
            <span className="text-foreground font-medium">{label}</span>
          </>
        ) : (
          <>
            <span className="text-foreground flex-1 text-right font-medium">
              {label}
            </span>
            <ArrowRight className="text-muted-foreground size-4 shrink-0" />
          </>
        )}
      </Link>
    </Button>
  );
}

export function DocsPager() {
  const { prev, next } = useDocsPagination();

  if (!prev && !next) return null;

  return (
    <div className="not-prose mt-24">
      <div className="flex flex-row items-center justify-between gap-4">
        {prev ? (
          <PagerLink href={prev.path} label={prev.label} direction="prev" />
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <PagerLink href={next.path} label={next.label} direction="next" />
        ) : (
          <span className="flex-1" />
        )}
      </div>
    </div>
  );
}
