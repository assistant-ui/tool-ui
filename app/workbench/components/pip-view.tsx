"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { GripHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PIP_ENTRANCE_ANIMATION = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
  transition: { type: "spring" as const, stiffness: 400, damping: 30 },
};

const PIP_WIDTH = 280;
const PIP_HEIGHT = 180;
const PIP_PADDING = 16;
const PIP_GRIP_HEIGHT = 22;

const PIP_SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 500,
  damping: 25,
};

type PipCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface CornerPosition {
  x: number;
  y: number;
}

function getCornerPositions(
  containerWidth: number,
  containerHeight: number,
): Record<PipCorner, CornerPosition> {
  const pipTotalHeight = PIP_HEIGHT + PIP_GRIP_HEIGHT;
  return {
    "top-left": { x: PIP_PADDING, y: PIP_PADDING - PIP_GRIP_HEIGHT },
    "top-right": {
      x: containerWidth - PIP_WIDTH - PIP_PADDING,
      y: PIP_PADDING - PIP_GRIP_HEIGHT,
    },
    "bottom-left": {
      x: PIP_PADDING,
      y: containerHeight - pipTotalHeight - PIP_PADDING,
    },
    "bottom-right": {
      x: containerWidth - PIP_WIDTH - PIP_PADDING,
      y: containerHeight - pipTotalHeight - PIP_PADDING,
    },
  };
}

function findNearestCorner(
  x: number,
  y: number,
  positions: Record<PipCorner, CornerPosition>,
): PipCorner {
  let nearestCorner: PipCorner = "bottom-right";
  let minDistance = Infinity;

  const entries = Object.entries(positions) as [PipCorner, CornerPosition][];
  for (const [corner, pos] of entries) {
    const dx = x - pos.x;
    const dy = y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearestCorner = corner;
    }
  }

  return nearestCorner;
}

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setSize({ width, height });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}

interface PipViewProps {
  onClose: () => void;
  children: ReactNode;
}

export function PipView({ onClose, children }: PipViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerSize = useContainerSize(containerRef);

  useEffect(() => {
    if (containerSize.width > 0 && containerSize.height > 0 && !isInitialized) {
      const positions = getCornerPositions(
        containerSize.width,
        containerSize.height,
      );
      const pos = positions["bottom-right"];
      x.set(pos.x);
      y.set(pos.y);
      setIsInitialized(true);
    }
  }, [containerSize, isInitialized, x, y]);

  useEffect(() => {
    if (!isInitialized || containerSize.width <= 0 || containerSize.height <= 0) {
      return;
    }

    const positions = getCornerPositions(
      containerSize.width,
      containerSize.height,
    );
    const nearestCorner = findNearestCorner(x.get(), y.get(), positions);
    const pos = positions[nearestCorner];
    animate(x, pos.x, PIP_SPRING_CONFIG);
    animate(y, pos.y, PIP_SPRING_CONFIG);
  }, [containerSize.width, containerSize.height, isInitialized, x, y]);

  const handleDragEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent | PointerEvent,
      info: { velocity: { x: number; y: number } },
    ) => {
      const currentX = x.get();
      const currentY = y.get();
      const projectedX = currentX + info.velocity.x * 0.1;
      const projectedY = currentY + info.velocity.y * 0.1;

      const positions = getCornerPositions(
        containerSize.width,
        containerSize.height,
      );
      const nearestCorner = findNearestCorner(projectedX, projectedY, positions);
      const targetPos = positions[nearestCorner];

      animate(x, targetPos.x, PIP_SPRING_CONFIG);
      animate(y, targetPos.y, PIP_SPRING_CONFIG);
    },
    [containerSize, x, y],
  );

  if (!isInitialized) {
    return <div ref={containerRef} className="absolute inset-0" />;
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x, y, width: PIP_WIDTH }}
        initial={PIP_ENTRANCE_ANIMATION.initial}
        animate={PIP_ENTRANCE_ANIMATION.animate}
        transition={PIP_ENTRANCE_ANIMATION.transition}
        className="group/pip absolute top-0 left-0 cursor-grab active:cursor-grabbing"
      >
        <div className="pointer-events-none flex justify-center pb-1.5 opacity-0 transition-opacity group-hover/pip:opacity-100">
          <GripHorizontal className="size-4 text-neutral-400" />
        </div>
        <div
          className="relative overflow-hidden rounded-xl shadow-2xl"
          style={{ height: PIP_HEIGHT }}
        >
          <div className="isolate h-full">{children}</div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 z-10 size-6 opacity-0 transition-opacity group-hover/pip:opacity-100"
            onClick={onClose}
          >
            <X className="size-3" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
