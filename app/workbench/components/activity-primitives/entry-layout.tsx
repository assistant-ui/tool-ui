import { forwardRef, type ReactNode, type ComponentProps } from "react";
import { cn } from "@/lib/ui/cn";
import type { LucideIcon } from "lucide-react";

/**
 * Entry Layout System
 *
 * Every activity entry follows this grid structure:
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ [indicator] [icon] [label] [meta]  ← flex →  [timestamp] [actions]│
 * ├──────────────────────────────────────────────────────────────────┤
 * │              [details content - aligned to label column]          │
 * ├──────────────────────────────────────────────────────────────────┤
 * │              [nested content - child entries]                     │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Grid columns:
 * - indicator: 2px (or 0 when inactive)
 * - icon: 20px fixed
 * - content: 1fr (contains label, meta, spacer, timestamp, actions)
 */

const GRID_TEMPLATE = "grid-cols-[2px_20px_1fr]";
const CONTENT_OFFSET = "col-start-3"; // Details start at content column

type EntryVariant = "default" | "nested" | "response";
type IndicatorState = "none" | "configured" | "error";

const indicatorStyles: Record<IndicatorState, string> = {
  none: "bg-transparent",
  configured: "bg-blue-400/60",
  error: "bg-red-400/60",
};

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Root - The outermost container
// ─────────────────────────────────────────────────────────────────────────────

interface EntryRootProps {
  children: ReactNode;
  indicator?: IndicatorState;
  className?: string;
}

function EntryRoot({ children, indicator = "none", className }: EntryRootProps) {
  return (
    <div
      className={cn("group/entry", className)}
      data-indicator={indicator !== "none" ? indicator : undefined}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Row - The main clickable row with grid layout
// ─────────────────────────────────────────────────────────────────────────────

interface EntryRowProps extends ComponentProps<"button"> {
  children: ReactNode;
  indicator?: IndicatorState;
  variant?: EntryVariant;
}

const EntryRow = forwardRef<HTMLButtonElement, EntryRowProps>(
  ({ children, indicator = "none", variant = "default", className, disabled, ...props }, ref) => {
    const paddingY = variant === "response" ? "py-1" : "py-1.5";

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "grid w-full items-center text-left transition-colors",
          GRID_TEMPLATE,
          paddingY,
          "pr-2",
          !disabled && "hover:bg-muted/40",
          disabled && "cursor-default",
          className,
        )}
        {...props}
      >
        {/* Indicator column */}
        <span
          className={cn(
            "h-full w-0.5 justify-self-start rounded-full",
            indicatorStyles[indicator],
          )}
          aria-hidden
        />

        {/* Icon + Content columns rendered by children */}
        {children}
      </button>
    );
  },
);
EntryRow.displayName = "EntryRow";

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Icon - The icon column
// ─────────────────────────────────────────────────────────────────────────────

interface EntryIconProps {
  icon: LucideIcon;
  color?: string;
  className?: string;
}

function EntryIcon({ icon: Icon, color, className }: EntryIconProps) {
  return (
    <span className="flex items-center justify-center">
      <Icon className={cn("size-3.5", color, className)} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Content - The flexible content area (contains label, meta, etc.)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryContentProps {
  children: ReactNode;
  className?: string;
}

function EntryContent({ children, className }: EntryContentProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Label - Primary text (tool name, method name)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryLabelProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

function EntryLabel({ children, color, className }: EntryLabelProps) {
  return (
    <span className={cn("shrink-0 truncate text-xs", color, className)}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Meta - Secondary text (key arg, display mode value)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryMetaProps {
  children: ReactNode;
  className?: string;
}

function EntryMeta({ children, className }: EntryMetaProps) {
  return (
    <span className={cn("text-muted-foreground truncate text-xs", className)}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Spacer - Pushes subsequent content to the right
// ─────────────────────────────────────────────────────────────────────────────

function EntrySpacer() {
  return <span className="flex-1" aria-hidden />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Timestamp - Right-aligned timestamp that fades on hover
// ─────────────────────────────────────────────────────────────────────────────

interface EntryTimestampProps {
  children: ReactNode;
  visible?: boolean;
  muted?: boolean;
  className?: string;
}

function EntryTimestamp({
  children,
  visible = false,
  muted = false,
  className,
}: EntryTimestampProps) {
  return (
    <span
      className={cn(
        "shrink-0 text-[10px] tabular-nums transition-opacity",
        muted ? "text-muted-foreground/40" : "text-muted-foreground/60",
        visible ? "opacity-100" : "opacity-0 group-hover/entry:opacity-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Actions - Container for action buttons (settings, etc.)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryActionsProps {
  children: ReactNode;
  className?: string;
}

function EntryActions({ children, className }: EntryActionsProps) {
  return (
    <span className={cn("ml-1 flex shrink-0 items-center", className)}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Details - Expanded content area (args, results)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryDetailsProps {
  children: ReactNode;
  className?: string;
}

function EntryDetails({ children, className }: EntryDetailsProps) {
  return (
    <div
      className={cn(
        "grid",
        GRID_TEMPLATE,
        className,
      )}
    >
      {/* Empty indicator column */}
      <span aria-hidden />
      {/* Empty icon column */}
      <span aria-hidden />
      {/* Content spans the content column */}
      <div className="border-primary/30 border-l pb-1 pl-3 pr-2">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Nested - Container for nested entries (responses)
// ─────────────────────────────────────────────────────────────────────────────

interface EntryNestedProps {
  children: ReactNode;
  className?: string;
}

function EntryNested({ children, className }: EntryNestedProps) {
  return (
    <div
      className={cn(
        "grid",
        GRID_TEMPLATE,
        className,
      )}
    >
      {/* Empty indicator column */}
      <span aria-hidden />
      {/* Empty icon column */}
      <span aria-hidden />
      {/* Nested content */}
      <div>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry.Badge - Small status badge (e.g., "Simulated")
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "error" | "warning" | "info";

const badgeStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  error: "bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

interface EntryBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  className?: string;
}

function EntryBadge({
  children,
  variant = "info",
  icon: Icon,
  className,
}: EntryBadgeProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
        badgeStyles[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-2.5" />}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export as compound component
// ─────────────────────────────────────────────────────────────────────────────

export const Entry = {
  Root: EntryRoot,
  Row: EntryRow,
  Icon: EntryIcon,
  Content: EntryContent,
  Label: EntryLabel,
  Meta: EntryMeta,
  Spacer: EntrySpacer,
  Timestamp: EntryTimestamp,
  Actions: EntryActions,
  Details: EntryDetails,
  Nested: EntryNested,
  Badge: EntryBadge,
};

export type { EntryVariant, IndicatorState, BadgeVariant };
