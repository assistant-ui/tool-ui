import { cn } from "@/lib/ui/cn";

interface ExpandableRowProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
}

export function ExpandableRow({
  onClick,
  disabled,
  className,
  children,
}: ExpandableRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 text-left transition-colors",
        {
          "hover:bg-muted/40": !disabled,
          "cursor-default": disabled,
        },
        className,
      )}
    >
      {children}
    </button>
  );
}
