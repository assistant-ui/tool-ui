import { cn } from "./_adapter";

export function TerminalProgress({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col motion-safe:animate-pulse",
        className,
      )}
    >
      <div className="bg-muted/50 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-4 w-4 rounded" />
          <div className="bg-muted h-4 w-48 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted h-5 w-12 rounded" />
          <div className="bg-muted h-6 w-6 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-4 py-3">
        <div className="bg-muted h-4 w-3/4 rounded" />
        <div className="bg-muted h-4 w-1/2 rounded" />
        <div className="bg-muted h-4 w-5/6 rounded" />
        <div className="bg-muted h-4 w-2/3 rounded" />
      </div>
    </div>
  );
}
