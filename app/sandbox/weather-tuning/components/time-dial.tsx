"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/ui/cn";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";
import type { TimeCheckpoint } from "../types";

interface TimeDialProps {
  value: number;
  isPreviewing: boolean;
  activeEditCheckpoint: TimeCheckpoint;
  onScrub: (value: number) => void;
  onCheckpointClick: (checkpoint: TimeCheckpoint) => void;
  onExitPreview: () => void;
}

export function TimeDial({
  value,
  isPreviewing,
  activeEditCheckpoint,
  onScrub,
  onCheckpointClick,
  onExitPreview,
}: TimeDialProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const formatTime = (timeOfDay: number): string => {
    const hours = Math.floor(timeOfDay * 24);
    const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getAngleFromValue = (v: number) => {
    return v * 360 - 90;
  };

  const getValueFromAngle = (angle: number) => {
    let normalized = (angle + 90) / 360;
    if (normalized < 0) normalized += 1;
    if (normalized >= 1) normalized -= 1;
    return Math.max(0, Math.min(1, normalized));
  };

  const handleDial = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return;

      const rect = dialRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const angle =
        Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      const newValue = getValueFromAngle(angle);
      onScrub(newValue);
    },
    [onScrub]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleDial(e.clientX, e.clientY);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleDial(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const angle = getAngleFromValue(value);
  const editCheckpointInfo = TIME_CHECKPOINTS[activeEditCheckpoint];

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <div
          ref={dialRef}
          onMouseDown={handleMouseDown}
          className="relative flex size-14 cursor-pointer items-center justify-center"
        >
          <div className="absolute inset-0 rounded-full border border-border/40" />

          {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
            const { value: cpValue, label } = TIME_CHECKPOINTS[checkpoint];
            const cpAngle = getAngleFromValue(cpValue);
            const radians = (cpAngle * Math.PI) / 180;
            const radius = 22;
            const x = Math.cos(radians) * radius;
            const y = Math.sin(radians) * radius;
            const isViewingHere = Math.abs(value - cpValue) < 0.04;
            const isEditingHere = checkpoint === activeEditCheckpoint;

            return (
              <button
                key={checkpoint}
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckpointClick(checkpoint);
                }}
                className={cn(
                  "absolute flex size-2 items-center justify-center rounded-full transition-all",
                  isEditingHere
                    ? "scale-150 bg-foreground"
                    : isViewingHere
                      ? "scale-125 bg-foreground/60"
                      : "bg-foreground/20 hover:bg-foreground/40"
                )}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={`${label}${isEditingHere ? " (editing)" : ""}`}
              />
            );
          })}

          <div
            className="absolute left-1/2 top-1/2 h-px w-4 origin-left bg-foreground/50"
            style={{
              transform: `translate(0, -50%) rotate(${angle}deg)`,
            }}
          />
          <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-0.5">
        <span className="font-mono text-sm tabular-nums text-foreground">
          {formatTime(value)}
        </span>
        {isPreviewing && (
          <button
            onClick={onExitPreview}
            className="text-[10px] uppercase tracking-wide text-muted-foreground/60 hover:text-foreground"
          >
            Preview / Click to edit {editCheckpointInfo.label}
          </button>
        )}
      </div>

      <div className="h-6 w-px bg-border/20" />

      <div className="flex gap-1">
        {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
          const { value: cpValue, label } = TIME_CHECKPOINTS[checkpoint];
          const isViewingHere = Math.abs(value - cpValue) < 0.04;
          const isEditingHere = checkpoint === activeEditCheckpoint;

          return (
            <button
              key={checkpoint}
              onClick={() => onCheckpointClick(checkpoint)}
              className={cn(
                "px-2 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors",
                isEditingHere
                  ? "bg-muted-foreground/20 text-foreground"
                  : isViewingHere
                    ? "text-foreground"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
              )}
              title={`${label}${isEditingHere ? " (editing)" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
