import { cn } from "@/lib/ui/cn";

interface ExpandedContentProps {
  className?: string;
  children: React.ReactNode;
}

export function ExpandedContent({ className, children }: ExpandedContentProps) {
  return (
    <div className={cn("border-primary/30 border-l", className)}>{children}</div>
  );
}
