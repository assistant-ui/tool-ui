"use client";

import { cn } from "@/lib/ui/cn";

interface RoundedRectOverlayProps {
  rect: DOMRect;
  containerRect: DOMRect;
  padding?: number;
  color: "blue" | "green" | "orange";
  showMargin?: boolean;
  marginSize?: number;
  label?: string;
}

const COLOR_STYLES = {
  blue: {
    border: "border-blue-500",
    bg: "bg-blue-500/10",
    marginBorder: "border-blue-400/50",
    marginBg: "bg-blue-400/5",
    text: "text-blue-600 dark:text-blue-400",
  },
  green: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10",
    marginBorder: "border-emerald-400/50",
    marginBg: "bg-emerald-400/5",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  orange: {
    border: "border-orange-500",
    bg: "bg-orange-500/10",
    marginBorder: "border-orange-400/50",
    marginBg: "bg-orange-400/5",
    text: "text-orange-600 dark:text-orange-400",
  },
};

export function RoundedRectOverlay({
  rect,
  containerRect,
  padding = 6,
  color,
  showMargin = false,
  marginSize = 16,
  label,
}: RoundedRectOverlayProps) {
  const styles = COLOR_STYLES[color];

  // Calculate position relative to container
  const left = rect.left - containerRect.left - padding;
  const top = rect.top - containerRect.top - padding;
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;
  const cornerRadius = height / 2;

  // Margin overlay dimensions
  const marginLeft = left - marginSize;
  const marginTop = top - marginSize;
  const marginWidth = width + marginSize * 2;
  const marginHeight = height + marginSize * 2;
  const marginCornerRadius = marginHeight / 2;

  return (
    <>
      {showMargin && (
        <div
          className={cn(
            "absolute border border-dashed",
            styles.marginBorder,
            styles.marginBg,
          )}
          style={{
            left: marginLeft,
            top: marginTop,
            width: marginWidth,
            height: marginHeight,
            borderRadius: marginCornerRadius,
          }}
        />
      )}
      <div
        className={cn("absolute border-2", styles.border, styles.bg)}
        style={{
          left,
          top,
          width,
          height,
          borderRadius: cornerRadius,
        }}
      >
        {label && (
          <span
            className={cn(
              "absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium",
              styles.text,
            )}
          >
            {label}
          </span>
        )}
      </div>
    </>
  );
}

interface ThumbIndicatorProps {
  rect: DOMRect;
  containerRect: DOMRect;
}

export function ThumbIndicator({ rect, containerRect }: ThumbIndicatorProps) {
  const left = rect.left - containerRect.left;
  const top = rect.top - containerRect.top;

  return (
    <div
      className="absolute border-2 border-orange-500 bg-orange-500/20"
      style={{
        left: left - 2,
        top: top - 2,
        width: rect.width + 4,
        height: rect.height + 4,
        borderRadius: 4,
      }}
    />
  );
}
