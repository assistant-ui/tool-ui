import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/ui/cn";

interface ExpandChevronProps {
  isExpanded: boolean;
  hoverClass?: string;
}

export function ExpandChevron({
  isExpanded,
  hoverClass = "text-muted-foreground/40 group-hover:text-muted-foreground",
}: ExpandChevronProps) {
  return (
    <ChevronRight
      className={cn(
        "size-3 shrink-0 transition-transform duration-150",
        hoverClass,
        isExpanded && "rotate-90",
      )}
    />
  );
}
