"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { ChatShowcase } from "./chat-showcase";

type FauxChatShellProps = {
  className?: string;
  disableLightOverlay?: boolean;
};

export function generateSineEasedGradient(
  angle: number,
  centerPosition: number,
  peakOpacity: number,
  spreadWidth: number,
  steps: number = 128
): string {
  const stops: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const position = centerPosition - spreadWidth / 2 + spreadWidth * t;

    // Sine curve: peaks at center (t=0.5), zero at edges (t=0, t=1)
    // Square the sine for even smoother falloff at edges
    const sineValue = Math.sin(t * Math.PI);
    const eased = sineValue * sineValue;
    const opacity = peakOpacity * eased;

    stops.push(`rgba(255, 255, 255, ${opacity.toFixed(4)}) ${position.toFixed(1)}%`);
  }

  // No hard transparent stops — sine² already smoothly reaches zero at edges
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

function useDirectionalLight(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [gradientStyle, setGradientStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateGradient = () => {
      const parent = container.parentElement;
      if (!parent) return;

      const style = getComputedStyle(parent);
      const rotateX = parseFloat(style.getPropertyValue("--shell-rotate-x")) || 0;
      const rotateY = parseFloat(style.getPropertyValue("--shell-rotate-y")) || 0;

      // Light params from CSS custom properties (with defaults)
      const baseAngle = parseFloat(style.getPropertyValue("--light-angle")) || 135;
      const basePosition = parseFloat(style.getPropertyValue("--light-position")) || 35;
      const spread = parseFloat(style.getPropertyValue("--light-spread")) || 40;
      const opacity = parseFloat(style.getPropertyValue("--light-opacity")) || 0.12;
      const rotateXFactor = parseFloat(style.getPropertyValue("--light-rotate-x-factor")) || 1.2;
      const rotateYFactor = parseFloat(style.getPropertyValue("--light-rotate-y-factor")) || 0.8;

      // Highlight position shifts based on rotation (light "slides" across surface)
      const centerPosition = basePosition - rotateX * rotateXFactor - rotateY * rotateYFactor;

      const gradient = generateSineEasedGradient(
        baseAngle,
        centerPosition,
        opacity,
        spread,
        32
      );

      setGradientStyle({ background: gradient });
    };

    updateGradient();

    // Watch for changes via MutationObserver on parent's style attribute
    const parent = container.parentElement;
    if (!parent) return;

    const observer = new MutationObserver(updateGradient);
    observer.observe(parent, { attributes: true, attributeFilter: ["style"] });

    return () => observer.disconnect();
  }, [containerRef]);

  return gradientStyle;
}

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
      <span className="border-gradient-glow border-gradient-glow-dot size-3.5 rounded-full" />
    </div>
  );
}

function ComposerBar() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
      <div className="border-gradient-glow border-gradient-glow-composer h-10 w-full rounded-full" />
    </div>
  );
}

export function FauxChatShell({ className, disableLightOverlay }: FauxChatShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientStyle = useDirectionalLight(containerRef);

  return (
    <div
      ref={containerRef}
      className={cn(
        "border-gradient-glow relative flex h-full w-full flex-col overflow-hidden rounded-2xl",
        className,
      )}
      style={{
        boxShadow: [
          "0 1px 3px rgba(0, 0, 0, 0.05)",
          "0 2px 4px rgba(0, 0, 0, 0.008)",
          "0 4px 8px rgba(0, 0, 0, 0.02)",
          "0 8px 16px rgba(0, 0, 0, 0.02)",
          "0 16px 32px rgba(0, 0, 0, 0.02)",
          "0 32px 48px rgba(0, 0, 0, 0.03)",
        ].join(", "),
        // 3D rendering quality improvements
        backfaceVisibility: "hidden",
        willChange: "transform",
        WebkitFontSmoothing: "subpixel-antialiased",
      }}
    >
      {/* Directional light reflection overlay */}
      {!disableLightOverlay && (
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-2xl"
          style={gradientStyle}
          aria-hidden="true"
        />
      )}

      <div className="bg-background/80 absolute z-20 w-full backdrop-blur-lg">
        <div className="flex h-10 shrink-0 items-center px-4 pt-0.5">
          <WindowDots />
        </div>
        <div className="gradient-line-header h-px" />
      </div>
      <div className="scrollbar-subtle relative z-0 grow overflow-y-auto px-6 pt-24">
        <ChatShowcase />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 right-3 bottom-0 z-10 h-24"
        style={{
          background:
            "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      <ComposerBar />
    </div>
  );
}
