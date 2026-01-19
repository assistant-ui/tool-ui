"use client";

import { ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocsToc } from "./docs-toc-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function DocsTocMobileToggle({ onClick }: { onClick: () => void }) {
  const { headings } = useDocsToc();
  const isMobile = useIsMobile();

  if (!isMobile || headings.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="outline"
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      aria-label="Open table of contents"
    >
      <ListOrdered className="h-5 w-5" />
    </Button>
  );
}
