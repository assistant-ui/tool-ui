import { cn } from "@/lib/ui/cn";

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

interface PreviewProps {
  value: unknown;
  className?: string;
}

export function ArgsPreview({ value, className }: PreviewProps) {
  if (value === undefined) return null;

  return (
    <pre
      className={cn(
        "text-muted-foreground overflow-x-auto text-[10px] leading-relaxed",
        className,
      )}
    >
      {formatValue(value)}
    </pre>
  );
}

export function ResultPreview({ value, className }: PreviewProps) {
  if (value === undefined) return null;

  return (
    <pre
      className={cn(
        "overflow-x-auto text-[10px] leading-relaxed text-emerald-600/80 dark:text-emerald-300",
        className,
      )}
    >
      {formatValue(value)}
    </pre>
  );
}
