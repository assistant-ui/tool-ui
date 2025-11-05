// Copied from:
// https://github.com/AndrewPrifer/progressive-blur/blob/main/src/LinearBlur.tsx

"use client";

import React from "react";

interface LinearBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  strength?: number;
  steps?: number;
  falloffPercentage?: number;
  tint?: string;
  side?: "left" | "right" | "top" | "bottom";
}

const oppositeSide = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

function LinearBlur({
  strength = 64,
  steps = 8,
  falloffPercentage = 100,
  tint = "transparent",
  side = "top",
  ...props
}: LinearBlurProps) {
  const actualSteps = Math.max(1, steps);
  const step = falloffPercentage / actualSteps;

  const factor = 0.5;

  const base = Math.pow(strength / factor, 1 / (actualSteps - 1));

  const mainPercentage = 100 - falloffPercentage;

  const getBackdropFilter = (i: number) =>
    `blur(${factor * base ** (actualSteps - i - 1)}px)`;

  return (
    <div
      {...props}
      style={{
        // This has to be set on the top level element to prevent pointer events
        pointerEvents: "none",
        transformOrigin: side,
        ...props.style,
      }}
    >
      <div
        suppressHydrationWarning
        style={{
          position: "relative",
          zIndex: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(
            to ${oppositeSide[side]},
            rgb(from ${tint} r g b / alpha) 0%,
            rgb(from ${tint} r g b / 0%) 100%
          )`,
        }}
      >
        {/* Full blur at 100-falloffPercentage% */}
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            inset: 0,
            mask: `linear-gradient(
                  to ${oppositeSide[side]},
                  rgba(0, 0, 0, 1) ${mainPercentage}%,
                  rgba(0, 0, 0, 0) ${mainPercentage + step}%
                )`,
            backdropFilter: getBackdropFilter(0),
            WebkitBackdropFilter: getBackdropFilter(0),
          }}
        />
        {actualSteps > 1 && (
          <div
            suppressHydrationWarning
            style={{
              position: "absolute",
              zIndex: 2,
              inset: 0,
              mask: `linear-gradient(
                to ${oppositeSide[side]},
                  rgba(0, 0, 0, 1) ${mainPercentage}%,
                  rgba(0, 0, 0, 1) ${mainPercentage + step}%,
                  rgba(0, 0, 0, 0) ${mainPercentage + step * 2}%
                )`,
              backdropFilter: getBackdropFilter(1),
              WebkitBackdropFilter: getBackdropFilter(1),
            }}
          />
        )}
        {actualSteps > 2 &&
          Array.from({ length: actualSteps - 2 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                zIndex: i + 2,
                inset: 0,
                mask: `linear-gradient(
                    to ${oppositeSide[side]},
                    rgba(0, 0, 0, 0) ${mainPercentage + i * step}%,
                    rgba(0, 0, 0, 1) ${mainPercentage + (i + 1) * step}%,
                    rgba(0, 0, 0, 1) ${mainPercentage + (i + 2) * step}%,
                    rgba(0, 0, 0, 0) ${mainPercentage + (i + 3) * step}%
                  )`,
                backdropFilter: getBackdropFilter(i + 2),
                WebkitBackdropFilter: getBackdropFilter(i + 2),
              }}
            />
          ))}
      </div>
    </div>
  );
}

export { LinearBlur };
