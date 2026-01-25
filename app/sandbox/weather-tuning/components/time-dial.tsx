"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/ui/cn";
import { Pencil, Eye } from "lucide-react";
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
  const isNight = value < 0.25 || value > 0.75;
  const isDawn = value >= 0.2 && value <= 0.35;
  const isDusk = value >= 0.7 && value <= 0.85;

  const skyGradient = isNight
    ? "from-indigo-950 via-slate-900 to-slate-950"
    : isDawn
      ? "from-orange-400 via-rose-300 to-indigo-400"
      : isDusk
        ? "from-orange-500 via-purple-500 to-indigo-600"
        : "from-sky-400 via-blue-400 to-blue-500";

  const editCheckpointInfo = TIME_CHECKPOINTS[activeEditCheckpoint];

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div
          ref={dialRef}
          onMouseDown={handleMouseDown}
          className="relative flex size-16 cursor-pointer items-center justify-center"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br opacity-15 blur-lg transition-all duration-700",
              skyGradient
            )}
          />

          <div className="absolute inset-0 rounded-full border border-border/50 bg-card/50" />

          <div className="absolute inset-1.5 rounded-full border border-border/30 bg-muted/30" />

          {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
            const { value: cpValue, emoji } = TIME_CHECKPOINTS[checkpoint];
            const cpAngle = getAngleFromValue(cpValue);
            const radians = (cpAngle * Math.PI) / 180;
            const radius = 24;
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
                  "absolute flex size-5 items-center justify-center rounded-full text-[10px] transition-all",
                  isEditingHere
                    ? "scale-110 bg-blue-500/30 ring-2 ring-blue-500/50"
                    : isViewingHere
                      ? "scale-110 bg-foreground/10"
                      : "bg-muted/50 hover:bg-accent/50"
                )}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={`${TIME_CHECKPOINTS[checkpoint].label}${isEditingHere ? " (editing)" : ""}`}
              >
                {emoji}
              </button>
            );
          })}

          <div
            className="absolute left-1/2 top-1/2 h-px w-5 origin-left rounded-full bg-gradient-to-r from-foreground/50 to-foreground/0"
            style={{
              transform: `translate(0, -50%) rotate(${angle}deg)`,
            }}
          />
          <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/60" />
        </div>
      </div>

      <div className="flex flex-col items-start">
        <span className="font-mono text-lg tabular-nums tracking-tight text-foreground/80">
          {formatTime(value)}
        </span>
        <div className="flex items-center gap-1">
          <div
            className={cn(
              "size-1 rounded-full transition-colors",
              isNight ? "bg-indigo-400/60" : "bg-amber-400/60"
            )}
          />
          <span className="text-[10px] text-muted-foreground/60">
            {isNight
              ? "Night"
              : isDawn
                ? "Dawn"
                : isDusk
                  ? "Dusk"
                  : "Day"}
          </span>
        </div>
      </div>

      <div className="h-8 w-px bg-border/30" />

      {isPreviewing && (
        <button
          onClick={onExitPreview}
          className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
        >
          <Eye className="size-3" />
          <span>Preview</span>
          <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
            (click to edit {editCheckpointInfo.label})
          </span>
        </button>
      )}

      <div className="flex gap-0.5">
        {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
          const { value: cpValue, emoji, label } = TIME_CHECKPOINTS[checkpoint];
          const isViewingHere = Math.abs(value - cpValue) < 0.04;
          const isEditingHere = checkpoint === activeEditCheckpoint;

          return (
            <button
              key={checkpoint}
              onClick={() => onCheckpointClick(checkpoint)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-md px-2 py-1 transition-all",
                isEditingHere
                  ? "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/30 dark:text-blue-400"
                  : isViewingHere && isPreviewing
                    ? "bg-amber-500/10 text-amber-600/80 dark:text-amber-400/80"
                    : isViewingHere
                      ? "bg-accent/60 text-foreground/80"
                      : "text-muted-foreground/50 hover:bg-accent/30 hover:text-muted-foreground"
              )}
              title={`${label}${isEditingHere ? " (editing)" : ""}`}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-[8px] font-medium uppercase tracking-wider">
                {checkpoint}
              </span>
              {isEditingHere && (
                <div className="absolute -right-0.5 -top-0.5">
                  <Pencil className="size-2.5 text-blue-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
