"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export type FormatConfig =
  | { kind: "text" }
  | {
      kind: "number";
      decimals?: number;
      unit?: string;
      compact?: boolean;
      showSign?: boolean;
    }
  | { kind: "currency"; currency: string; decimals?: number }
  | {
      kind: "percent";
      decimals?: number;
      showSign?: boolean;
      basis?: "fraction" | "unit";
    }
  | { kind: "date"; dateFormat?: "short" | "long" | "relative" }
  | {
      kind: "delta";
      decimals?: number;
      upIsPositive?: boolean;
      showSign?: boolean;
    }
  | {
      kind: "status";
      statusMap: Record<string, { tone: Tone; label?: string }>;
    }
  | { kind: "boolean"; labels?: { true: string; false: string } }
  | { kind: "link"; hrefKey?: string; external?: boolean }
  | { kind: "badge"; colorMap?: Record<string, Tone> }
  | { kind: "array"; maxVisible?: number };

interface DeltaValueProps {
  value: number;
  options?: Extract<FormatConfig, { kind: "delta" }>;
}

function DeltaValue({ value, options }: DeltaValueProps) {
  const decimals = options?.decimals ?? 2;
  const upIsPositive = options?.upIsPositive ?? true;
  const showSign = options?.showSign ?? true;

  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  // Determine color based on direction and upIsPositive
  const isGood = upIsPositive ? isPositive : isNegative;
  const isBad = upIsPositive ? isNegative : isPositive;

  // Token-based coloring (shadcn tokens)
  const colorClass = isGood
    ? "text-success-foreground"
    : isBad
      ? "text-destructive-foreground"
      : "text-muted-foreground";

  const formatted = value.toFixed(decimals);
  const display = showSign && !isNegative ? `+${formatted}` : formatted;

  const arrow = isPositive ? "↑" : isNegative ? "↓" : "";

  return (
    <span className={cn("font-medium tabular-nums", colorClass)}>
      {display}
      {!isNeutral && <span className="ml-0.5">{arrow}</span>}
    </span>
  );
}

interface StatusBadgeProps {
  value: string;
  options?: Extract<FormatConfig, { kind: "status" }>;
}

function StatusBadge({ value, options }: StatusBadgeProps) {
  const config = options?.statusMap?.[value] ?? {
    tone: "neutral" as Tone,
    label: value,
  };
  const label = config.label ?? value;

  const toneClasses: Record<Tone, string> = {
    success: "bg-accent text-accent-foreground",
    warning: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive text-destructive-foreground",
    info: "bg-accent/50 text-accent-foreground",
    neutral: "bg-muted text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        toneClasses[config.tone],
      )}
    >
      {label}
    </span>
  );
}

interface CurrencyValueProps {
  value: number;
  options?: Extract<FormatConfig, { kind: "currency" }>;
}

function CurrencyValue({ value, options }: CurrencyValueProps) {
  const currency = options?.currency ?? "USD";
  const decimals = options?.decimals ?? 2;

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return <span className="font-mono tabular-nums">{formatted}</span>;
}

interface PercentValueProps {
  value: number;
  options?: Extract<FormatConfig, { kind: "percent" }>;
}

function PercentValue({ value, options }: PercentValueProps) {
  const decimals = options?.decimals ?? 2;
  const showSign = options?.showSign ?? false;
  const basis = options?.basis ?? "fraction"; // 'fraction' expects 0.12 -> 12%

  const numeric = basis === "fraction" ? value * 100 : value;
  const absFormatted = Math.abs(numeric).toFixed(decimals);
  const signed =
    numeric > 0 && showSign
      ? `+${absFormatted}`
      : numeric < 0
        ? `-${absFormatted}`
        : absFormatted;

  return <span className="font-mono tabular-nums">{signed}%</span>;
}

interface DateValueProps {
  value: string;
  options?: Extract<FormatConfig, { kind: "date" }>;
}

function DateValue({ value, options }: DateValueProps) {
  const dateFormat = options?.dateFormat ?? "short";
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return <span>Invalid date</span>;
  }

  let formatted: string;

  if (dateFormat === "relative") {
    formatted = getRelativeTime(date);
  } else if (dateFormat === "long") {
    formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } else {
    // short
    formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }

  const title = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return <span title={title}>{formatted}</span>;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // For dates older than a week, show absolute date
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

interface BooleanValueProps {
  value: boolean;
  options?: Extract<FormatConfig, { kind: "boolean" }>;
}

function BooleanValue({ value, options }: BooleanValueProps) {
  const labels = options?.labels ?? { true: "Yes", false: "No" };
  const label = value ? labels.true : labels.false;
  const tone = value ? "success" : "neutral";

  const toneClasses: Record<Tone, string> = {
    success: "bg-accent text-accent-foreground",
    warning: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive text-destructive-foreground",
    info: "bg-accent/50 text-accent-foreground",
    neutral: "bg-muted text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {label}
    </span>
  );
}

interface LinkValueProps {
  value: string;
  options?: Extract<FormatConfig, { kind: "link" }>;
  row?: Record<string, string | number | boolean | null | string[]>;
}

function LinkValue({ value, options, row }: LinkValueProps) {
  const href =
    options?.hrefKey && row ? String(row[options.hrefKey] ?? "") : value;
  const external = options?.external ?? false;

  if (!href) {
    return <span>{value}</span>;
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-accent-foreground underline underline-offset-2 hover:opacity-90"
      aria-label={external ? `${value} (opens in a new tab)` : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {value}
      {external && (
        <span
          className="ml-1 inline-block text-xs"
          aria-label="Opens in new tab"
        >
          ↗
        </span>
      )}
    </a>
  );
}

interface NumberValueProps {
  value: number;
  options?: Extract<FormatConfig, { kind: "number" }>;
}

function NumberValue({ value, options }: NumberValueProps) {
  const decimals = options?.decimals ?? 0;
  const unit = options?.unit ?? "";
  const compact = options?.compact ?? false;
  const showSign = options?.showSign ?? false;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? "compact" : "standard",
  }).format(value);

  const display = showSign && value > 0 ? `+${formatted}` : formatted;

  return (
    <span className="font-mono tabular-nums">
      {display}
      {unit}
    </span>
  );
}

interface BadgeValueProps {
  value: string;
  options?: Extract<FormatConfig, { kind: "badge" }>;
}

function BadgeValue({ value, options }: BadgeValueProps) {
  const tone = options?.colorMap?.[value] ?? "neutral";

  const toneClasses: Record<Tone, string> = {
    success: "bg-accent text-accent-foreground",
    warning: "bg-secondary text-secondary-foreground",
    danger: "bg-destructive text-destructive-foreground",
    info: "bg-accent/50 text-accent-foreground",
    neutral: "bg-muted text-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {value}
    </span>
  );
}

interface ArrayValueProps {
  value: string[] | string;
  options?: Extract<FormatConfig, { kind: "array" }>;
}

function ArrayValue({ value, options }: ArrayValueProps) {
  const maxVisible = options?.maxVisible ?? 3;
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",").map((s) => s.trim())
      : [];

  if (items.length === 0) {
    return <span>—</span>;
  }

  const visible = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <span className="inline-flex flex-wrap gap-1">
      {visible.map((item, i) => (
        <span
          key={i}
          className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        >
          {item}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-muted-foreground text-xs">+{remaining} more</span>
      )}
    </span>
  );
}

// ============================================================================
// Main Renderer
// ============================================================================

export function renderFormattedValue(
  value: string | number | boolean | null | string[],
  column: { format?: FormatConfig },
  row?: Record<string, string | number | boolean | null | string[]>,
): React.ReactNode {
  if (value == null || value === "") {
    return "—";
  }

  const fmt = column.format;

  switch (fmt?.kind) {
    case "delta":
      return <DeltaValue value={Number(value)} options={fmt} />;
    case "status":
      return <StatusBadge value={String(value)} options={fmt} />;
    case "currency":
      return <CurrencyValue value={Number(value)} options={fmt} />;
    case "percent":
      return <PercentValue value={Number(value)} options={fmt} />;
    case "date":
      return <DateValue value={String(value)} options={fmt} />;
    case "boolean":
      return <BooleanValue value={Boolean(value)} options={fmt} />;
    case "link":
      return <LinkValue value={String(value)} options={fmt} row={row} />;
    case "number":
      return <NumberValue value={Number(value)} options={fmt} />;
    case "badge":
      return <BadgeValue value={String(value)} options={fmt} />;
    case "array":
      return (
        <ArrayValue
          value={Array.isArray(value) ? value : String(value)}
          options={fmt}
        />
      );
    case "text":
    default:
      return String(value);
  }
}
