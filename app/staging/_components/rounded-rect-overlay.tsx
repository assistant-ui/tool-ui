"use client";

import { cn } from "@/lib/ui/cn";

interface RoundedRectOverlayProps {
  rect: DOMRect;
  containerRect: DOMRect;
  padding?: number;
  paddingOuter?: number; // Padding on outer-facing side (overrides padding on that side)
  color: "blue" | "green" | "orange";
  showMargin?: boolean;
  marginSize?: number;
  marginSizeOuter?: number; // Margin on outer-facing side (overrides marginSize on that side)
  label?: string;
  outerEdgeRadiusFactor?: number; // Factor to reduce radius on outer-facing edge (0-1)
  isLeftAligned?: boolean; // If true, left side is outer-facing; if false, right side is outer-facing
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
  paddingOuter,
  color,
  showMargin = false,
  marginSize = 16,
  marginSizeOuter,
  label,
  outerEdgeRadiusFactor = 1,
  isLeftAligned = true,
}: RoundedRectOverlayProps) {
  const styles = COLOR_STYLES[color];

  // Asymmetric padding: outer-facing side uses paddingOuter if provided
  const paddingLeft = isLeftAligned ? (paddingOuter ?? padding) : padding;
  const paddingRight = isLeftAligned ? padding : (paddingOuter ?? padding);

  // Calculate position relative to container
  const left = rect.left - containerRect.left - paddingLeft;
  const top = rect.top - containerRect.top - padding;
  const width = rect.width + paddingLeft + paddingRight;
  const height = rect.height + padding * 2;
  const fullRadius = height / 2;
  const reducedRadius = fullRadius * outerEdgeRadiusFactor;

  // Asymmetric radii: smaller on outer-facing side
  const radiusLeft = isLeftAligned ? reducedRadius : fullRadius;
  const radiusRight = isLeftAligned ? fullRadius : reducedRadius;
  const borderRadius = `${radiusLeft}px ${radiusRight}px ${radiusRight}px ${radiusLeft}px`;

  // Asymmetric margin: outer-facing side uses marginSizeOuter if provided
  const marginLeft_ = isLeftAligned ? (marginSizeOuter ?? marginSize) : marginSize;
  const marginRight_ = isLeftAligned ? marginSize : (marginSizeOuter ?? marginSize);

  // Margin overlay dimensions
  const marginLeftPos = left - marginLeft_;
  const marginTop = top - marginSize;
  const marginWidth = width + marginLeft_ + marginRight_;
  const marginHeight = height + marginSize * 2;
  const marginFullRadius = marginHeight / 2;
  const marginReducedRadius = marginFullRadius * outerEdgeRadiusFactor;
  const marginRadiusLeft = isLeftAligned ? marginReducedRadius : marginFullRadius;
  const marginRadiusRight = isLeftAligned ? marginFullRadius : marginReducedRadius;
  const marginBorderRadius = `${marginRadiusLeft}px ${marginRadiusRight}px ${marginRadiusRight}px ${marginRadiusLeft}px`;

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
            left: marginLeftPos,
            top: marginTop,
            width: marginWidth,
            height: marginHeight,
            borderRadius: marginBorderRadius,
          }}
        />
      )}
      <div
        className={cn("absolute border", styles.border, styles.bg)}
        style={{
          left,
          top,
          width,
          height,
          borderRadius,
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
      className="absolute border border-orange-500 bg-orange-500/20"
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
