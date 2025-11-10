"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type StackedItem = {
  id: string;
  node: React.ReactNode;
  fallbackHeight?: number; // px height estimate before measurement
  enterDurationMs?: number;
  enterDelayMs?: number;
  exitDelayMs?: number;
};

// Apple-style motion configuration
const STACK_MOTION = {
  // Gentle spring for layout animations
  layoutSpring: {
    type: "spring" as const,
    damping: 30,
    stiffness: 200,
    mass: 0.8,
  },
  // Smooth entrance easing
  entranceEase: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

export function StackedList({
  items,
  gap = 20,
  className,
}: {
  items: StackedItem[];
  gap?: number;
  className?: string;
}) {
  const heightsRef = useRef<Record<string, number>>({});
  const [version, setVersion] = useState(0); // trigger re-compute when heights change
  const rafRef = useRef<number | null>(null);

  // Compute y positions and total height
  const layout = useMemo(() => {
    let y = 0;
    const yById: Record<string, number> = {};
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const h = heightsRef.current[it.id] ?? it.fallbackHeight ?? 56;
      yById[it.id] = y;
      y += h + (i < items.length - 1 ? gap : 0);
    }
    const total = y;
    return { yById, total };
  }, [items, gap, version]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className={className}>
      <div
        className="relative w-full"
        style={{ height: Math.max(layout.total, 1) }}
      >
        <AnimatePresence>
          {items.map((it) => (
            <MeasuredItem
              key={it.id}
              y={layout.yById[it.id] ?? 0}
              onHeight={(h) => {
                if (h <= 0) return;
                const prev = heightsRef.current[it.id];
                if (prev !== h) {
                  heightsRef.current[it.id] = h;
                  // Throttle updates to the next frame
                  if (rafRef.current) cancelAnimationFrame(rafRef.current);
                  rafRef.current = requestAnimationFrame(() => {
                    setVersion((v) => v + 1);
                    rafRef.current = null;
                  });
                }
              }}
              durationMs={it.enterDurationMs ?? 0}
              delayMs={it.enterDelayMs ?? 0}
              exitDelayMs={it.exitDelayMs ?? 0}
            >
              {it.node}
            </MeasuredItem>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MeasuredItem({
  y,
  children,
  onHeight,
  durationMs,
  delayMs,
  exitDelayMs,
}: {
  y: number;
  children: React.ReactNode;
  onHeight: (h: number) => void;
  durationMs: number;
  delayMs: number;
  exitDelayMs: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(durationMs === 0 && delayMs === 0);

  // Measure with ResizeObserver
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const h = Math.ceil(e.contentRect.height);
        if (h > 0) onHeight(h);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeight]);

  useEffect(() => {
    if (durationMs === 0 && delayMs === 0) return;
    const t = window.setTimeout(() => setEntered(true), delayMs);
    return () => window.clearTimeout(t);
  }, [durationMs, delayMs]);

  return (
    <motion.div
      layout={false}
      className="absolute inset-x-0"
      animate={{ y }}
      initial={false}
      transition={STACK_MOTION.layoutSpring}
      style={{ willChange: "transform" }}
    >
      <motion.div
        initial={
          entered
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 16, scale: 0.97 }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            damping: 26,
            stiffness: 220,
            mass: 0.7,
            delay: delayMs / 1000,
          },
        }}
        exit={{
          opacity: 0,
          y: -8,
          scale: 0.97,
          transition: {
            type: "spring",
            damping: 26,
            stiffness: 220,
            mass: 0.7,
            delay: exitDelayMs / 1000,
          },
        }}
        style={{ willChange: entered ? "auto" : "transform, opacity" }}
      >
        <div ref={ref}>{children}</div>
      </motion.div>
    </motion.div>
  );
}
