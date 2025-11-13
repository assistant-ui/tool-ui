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
  animationType?: "fade" | "scale"; // "fade" only animates opacity, "scale" includes y and scale transforms
  group?: string; // items with same group value will be grouped together in flex layout
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

  // Group consecutive items with the same group identifier
  const groupedItems = useMemo(() => {
    const result: Array<{ items: StackedItem[]; groupId: string | null }> = [];
    let currentGroup: StackedItem[] = [];
    let currentGroupId: string | null = null;

    for (const item of items) {
      const itemGroupId = item.group || null;

      if (itemGroupId && itemGroupId === currentGroupId) {
        // Continue current group
        currentGroup.push(item);
      } else {
        // Finish current group if exists
        if (currentGroup.length > 0) {
          result.push({ items: currentGroup, groupId: currentGroupId });
        }
        // Start new group (or single item)
        currentGroup = [item];
        currentGroupId = itemGroupId;
      }
    }

    // Add final group
    if (currentGroup.length > 0) {
      result.push({ items: currentGroup, groupId: currentGroupId });
    }

    return result;
  }, [items]);

  // Compute y positions and total height
  const layout = useMemo(() => {
    const GROUP_GAP = 8; // gap within groups
    let y = 0;
    const yById: Record<string, number> = {};
    const groupYById: Record<string, number> = {}; // y position for each group

    for (let groupIdx = 0; groupIdx < groupedItems.length; groupIdx++) {
      const group = groupedItems[groupIdx];
      const isActualGroup = group.groupId !== null && group.items.length > 1;

      // Store the y position for this group
      const groupKey = group.items[0].id; // use first item id as group key
      groupYById[groupKey] = y;

      if (isActualGroup) {
        // For grouped items, calculate total height including internal gaps
        let groupHeight = 0;
        for (let i = 0; i < group.items.length; i++) {
          const item = group.items[i];
          const h = heightsRef.current[item.id] ?? item.fallbackHeight ?? 56;
          yById[item.id] = y; // All items in group start at same y
          groupHeight += h + (i < group.items.length - 1 ? GROUP_GAP : 0);
        }
        y += groupHeight;
      } else {
        // Single item
        const item = group.items[0];
        const h = heightsRef.current[item.id] ?? item.fallbackHeight ?? 56;
        yById[item.id] = y;
        y += h;
      }

      // Add gap between groups (not after last group)
      if (groupIdx < groupedItems.length - 1) {
        y += gap;
      }
    }

    const total = y;
    return { yById, groupYById, total };
  }, [groupedItems, gap, version]);

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
          {groupedItems.map((group) => {
            const isActualGroup = group.groupId !== null && group.items.length > 1;
            const groupKey = group.items[0].id;
            const y = layout.groupYById[groupKey] ?? 0;

            if (isActualGroup) {
              // Render grouped items in a flex container
              return (
                <motion.div
                  key={groupKey}
                  layout={false}
                  className="absolute inset-x-0 flex flex-col"
                  animate={{ y }}
                  initial={false}
                  transition={STACK_MOTION.layoutSpring}
                  style={{ willChange: "transform", gap: 8 }}
                >
                  {group.items.map((it) => (
                    <GroupedItem
                      key={it.id}
                      onHeight={(h) => {
                        if (h <= 0) return;
                        const prev = heightsRef.current[it.id];
                        if (prev !== h) {
                          heightsRef.current[it.id] = h;
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
                      animationType={it.animationType ?? "scale"}
                    >
                      {it.node}
                    </GroupedItem>
                  ))}
                </motion.div>
              );
            } else {
              // Render single item
              const it = group.items[0];
              return (
                <MeasuredItem
                  key={it.id}
                  y={y}
                  onHeight={(h) => {
                    if (h <= 0) return;
                    const prev = heightsRef.current[it.id];
                    if (prev !== h) {
                      heightsRef.current[it.id] = h;
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
                  animationType={it.animationType ?? "scale"}
                >
                  {it.node}
                </MeasuredItem>
              );
            }
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Component for items within a flex group
function GroupedItem({
  children,
  onHeight,
  durationMs,
  delayMs,
  exitDelayMs,
  animationType = "scale",
}: {
  children: React.ReactNode;
  onHeight: (h: number) => void;
  durationMs: number;
  delayMs: number;
  exitDelayMs: number;
  animationType?: "fade" | "scale";
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

  // Determine animation values based on type
  const isFadeOnly = animationType === "fade";
  const initialValues = entered
    ? { opacity: 1, y: 0, scale: 1 }
    : isFadeOnly
      ? { opacity: 0, y: 0, scale: 1 }
      : { opacity: 0, y: 16, scale: 0.97 };

  const exitValues = isFadeOnly
    ? { opacity: 0, y: 0, scale: 1 }
    : { opacity: 0, y: -8, scale: 0.97 };

  return (
    <motion.div
      initial={initialValues}
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
        ...exitValues,
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
  );
}

// Component for standalone items (not in a group)
function MeasuredItem({
  y,
  children,
  onHeight,
  durationMs,
  delayMs,
  exitDelayMs,
  animationType = "scale",
}: {
  y: number;
  children: React.ReactNode;
  onHeight: (h: number) => void;
  durationMs: number;
  delayMs: number;
  exitDelayMs: number;
  animationType?: "fade" | "scale";
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

  // Determine animation values based on type
  const isFadeOnly = animationType === "fade";
  const initialValues = entered
    ? { opacity: 1, y: 0, scale: 1 }
    : isFadeOnly
      ? { opacity: 0, y: 0, scale: 1 }
      : { opacity: 0, y: 16, scale: 0.97 };

  const exitValues = isFadeOnly
    ? { opacity: 0, y: 0, scale: 1 }
    : { opacity: 0, y: -8, scale: 0.97 };

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
        initial={initialValues}
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
          ...exitValues,
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
