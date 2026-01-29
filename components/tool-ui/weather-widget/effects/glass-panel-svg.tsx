"use client";

import { useRef, useState, useEffect, useCallback, useMemo, type ReactNode, type CSSProperties } from "react";

interface GlassPanelProps {
  children?: ReactNode;
  className?: string;
  depth?: number;
  radius?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  debug?: boolean;
}

function getDisplacementMap({
  height,
  width,
  radius,
  depth,
}: {
  height: number;
  width: number;
  radius: number;
  depth: number;
}) {
  const radiusYPct = Math.ceil((radius / height) * 15);
  const radiusXPct = Math.ceil((radius / width) * 15);

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .mix { mix-blend-mode: screen; }
    </style>
    <defs>
      <linearGradient id="Y" x1="0" x2="0" y1="${radiusYPct}%" y2="${100 - radiusYPct}%">
        <stop offset="0%" stop-color="#0F0" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
      <linearGradient id="X" x1="${radiusXPct}%" x2="${100 - radiusXPct}%" y1="0" y2="0">
        <stop offset="0%" stop-color="#F00" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect
        x="${depth}"
        y="${depth}"
        height="${Math.max(0, height - 2 * depth)}"
        width="${Math.max(0, width - 2 * depth)}"
        fill="#808080"
        rx="${radius}"
        ry="${radius}"
        filter="blur(${depth}px)"
      />
    </g>
  </svg>`)
  );
}

function getDisplacementFilter({
  height,
  width,
  radius,
  depth,
  strength = 50,
  chromaticAberration = 0,
}: {
  height: number;
  width: number;
  radius: number;
  depth: number;
  strength?: number;
  chromaticAberration?: number;
}) {
  const displacementMap = getDisplacementMap({ height, width, radius, depth });

  if (chromaticAberration === 0) {
    return (
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
          <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMap}" result="displacementMap" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale="${strength}"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>`) +
      "#displace"
    );
  }

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="displace" color-interpolation-filters="sRGB">
        <feImage x="0" y="0" height="${height}" width="${width}" href="${displacementMap}" result="displacementMap" />

        <!-- Red channel: strongest displacement -->
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration * 2}"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedR"
        />

        <!-- Green channel: medium displacement -->
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength + chromaticAberration}"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="displacedG"
        />

        <!-- Blue channel: base displacement -->
        <feDisplacementMap
          in="SourceGraphic"
          in2="displacementMap"
          scale="${strength}"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0"
          result="displacedB"
        />

        <!-- Combine channels -->
        <feBlend in="displacedR" in2="displacedG" mode="screen"/>
        <feBlend in2="displacedB" mode="screen"/>
      </filter>
    </defs>
  </svg>`) +
    "#displace"
  );
}

export function GlassPanel({
  children,
  className,
  depth = 12,
  radius = 12,
  strength = 40,
  chromaticAberration = 8,
  blur = 2,
  debug = false,
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [updateDimensions]);

  const style: CSSProperties = {
    borderRadius: radius,
  };

  if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
    const filterUrl = getDisplacementFilter({
      height: dimensions.height,
      width: dimensions.width,
      radius,
      depth,
      strength,
      chromaticAberration,
    });

    if (debug) {
      style.background = `url("${getDisplacementMap({
        height: dimensions.height,
        width: dimensions.width,
        radius,
        depth,
      })}")`;
      style.backgroundSize = "cover";
    } else {
      style.backdropFilter = `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.05) saturate(1.2)`;
      style.WebkitBackdropFilter = style.backdropFilter;
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

export function GlassPanelCSS() {
  return (
    <style jsx global>{`
      .glass-panel {
        background: rgba(255, 255, 255, 0.15);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .glass-panel-dark {
        background: rgba(0, 0, 0, 0.2);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          0 4px 16px rgba(0, 0, 0, 0.2);
      }
    `}</style>
  );
}

// Browser support detection for SVG filters in backdrop-filter
// Default to true since we degrade gracefully - the fallback is just no effect
function useSupportsGlassEffect() {
  const [supported, setSupported] = useState(true); // Optimistic default

  useEffect(() => {
    // Basic check for backdrop-filter support
    // SVG filter URLs work in Chrome, Safari, Edge - Firefox has limited support
    const hasSupport = CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");

    setSupported(hasSupport);
  }, []);

  return supported;
}

interface GlassPanelUnderlayProps {
  children: ReactNode;
  className?: string;
  depth?: number;
  radius?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  disabled?: boolean;
}

/**
 * Applies SVG glass refraction effect to a container.
 * The backdrop-filter is applied directly to this container, so the glass
 * distortion effect is visible behind any semi-transparent content inside.
 * On incompatible browsers, renders without the effect.
 */
export function GlassPanelUnderlay({
  children,
  className,
  depth = 12,
  radius = 12,
  strength = 40,
  chromaticAberration = 8,
  blur = 2,
  disabled = false,
}: GlassPanelUnderlayProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const supported = useSupportsGlassEffect();

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [updateDimensions]);

  const shouldApplyEffect = !disabled && supported && dimensions && dimensions.width > 0 && dimensions.height > 0;

  const filterUrl = shouldApplyEffect
    ? getDisplacementFilter({
        height: dimensions.height,
        width: dimensions.width,
        radius,
        depth,
        strength,
        chromaticAberration,
      })
    : "";

  // Apply backdrop-filter directly to this container so children see the glass effect
  const containerStyle: CSSProperties = {
    borderRadius: radius,
    ...(shouldApplyEffect && {
      backdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.05) saturate(1.2)`,
      WebkitBackdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(1.05) saturate(1.2)`,
    }),
  };

  return (
    <div ref={ref} className={className} style={containerStyle}>
      {children}
    </div>
  );
}

interface UseGlassStylesOptions {
  width: number;
  height: number;
  depth?: number;
  radius?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  brightness?: number;
  saturation?: number;
  enabled?: boolean;
}

/**
 * Hook that generates glass effect styles to apply directly to an element.
 * Returns CSSProperties with backdrop-filter containing the SVG displacement filter.
 * Use this when you need to apply the glass effect to an existing element
 * rather than wrapping it with GlassPanelUnderlay.
 */
export function useGlassStyles({
  width,
  height,
  depth = 12,
  radius = 12,
  strength = 40,
  chromaticAberration = 8,
  blur = 2,
  brightness = 1.05,
  saturation = 1.2,
  enabled = true,
}: UseGlassStylesOptions): CSSProperties {
  const supported = useSupportsGlassEffect();

  return useMemo(() => {
    if (!enabled || !supported || width <= 0 || height <= 0) {
      return {};
    }

    const filterUrl = getDisplacementFilter({
      height,
      width,
      radius,
      depth,
      strength,
      chromaticAberration,
    });

    return {
      backdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturation})`,
      WebkitBackdropFilter: `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturation})`,
    };
  }, [width, height, depth, radius, strength, chromaticAberration, blur, brightness, saturation, enabled, supported]);
}
