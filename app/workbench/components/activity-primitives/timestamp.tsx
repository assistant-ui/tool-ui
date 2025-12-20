import { cn } from "@/lib/ui/cn";

interface TimestampProps {
  value: string;
  isVisible: boolean;
  muted?: boolean;
  className?: string;
}

export function Timestamp({
  value,
  isVisible,
  muted = false,
  className,
}: TimestampProps) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 text-xs tabular-nums transition-opacity",
        muted ? "text-muted-foreground/40" : "text-muted-foreground/60",
        isVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        className,
      )}
    >
      {value}
    </span>
  );
}
