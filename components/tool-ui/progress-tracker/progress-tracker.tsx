"use client";

import * as React from "react";
import { cn } from "./_adapter";
import type {
  ProgressTrackerProps,
  ProgressTrackerReceiptProps,
} from "./schema";
import { ActionButtons, normalizeActionsConfig } from "../shared";
import type { Action } from "../shared";
import { Check, X, Loader2, Timer, AlertCircle } from "lucide-react";

function formatElapsedTime(milliseconds: number): string {
  const seconds = milliseconds / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

interface StepIndicatorProps {
  status: "pending" | "in-progress" | "completed" | "failed";
}

function StepIndicator({ status }: StepIndicatorProps) {
  if (status === "pending") {
    return (
      <span
        className="bg-card flex size-6 shrink-0 items-center justify-center rounded-full border border-border motion-safe:transition-all motion-safe:duration-200"
        aria-hidden="true"
      />
    );
  }

  if (status === "in-progress") {
    return (
      <span
        className="bg-card flex size-6 shrink-0 items-center justify-center rounded-full border border-border shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] motion-safe:transition-all motion-safe:duration-300"
        aria-hidden="true"
      >
        <Loader2 className="text-primary size-5 motion-safe:animate-[spin_0.7s_linear_infinite]" />
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span
        className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full border border-primary shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      >
        <Check
          className="size-4 [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{
            ["--check-path-length" as string]: "24",
          }}
        />
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className="bg-destructive dark:bg-red-600 text-white flex size-6 shrink-0 items-center justify-center rounded-full border border-destructive dark:border-red-600 shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      >
        <X
          className="size-4 [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{
            ["--check-path-length" as string]: "16",
          }}
        />
      </span>
    );
  }

  return null;
}

export function ProgressTrackerProgress({ className }: { className?: string }) {
  return (
    <div
      data-slot="progress-tracker-progress"
      aria-busy="true"
      className={cn(
        "flex w-full min-w-80 max-w-md flex-col",
        "text-foreground",
        className,
      )}
    >
      <div className="bg-card flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-xs">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="bg-muted size-6 rounded-full motion-safe:animate-pulse" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="bg-muted h-5 w-3/4 rounded motion-safe:animate-pulse" />
                <div className="bg-muted h-4 w-full rounded motion-safe:animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-muted h-9 w-20 rounded-full motion-safe:animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProgressTrackerReceipt({
  id,
  steps,
  elapsedTime,
  choice,
  className,
}: ProgressTrackerReceiptProps) {
  const receiptOutcome = choice?.outcome;
  const receiptSummary = choice?.summary;
  const isReceiptSuccess = receiptOutcome === "success";
  const isReceiptFailed = receiptOutcome === "failed";

  return (
    <div
      className={cn(
        "flex w-full min-w-80 max-w-md flex-col",
        "text-foreground select-none",
        "motion-safe:animate-[fade-blur-in_300ms_cubic-bezier(0.16,1,0.3,1)_both]",
        className,
      )}
      data-slot="progress-tracker"
      data-tool-ui-id={id}
      data-receipt="true"
      role="status"
      aria-label={receiptSummary}
    >
      <div className="bg-card/60 flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-xs">
        <div className="flex items-center justify-between">
          {elapsedTime !== undefined && elapsedTime > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Timer className="size-3.5 -mt-px" />
              <span>{formatElapsedTime(elapsedTime)}</span>
            </div>
          )}
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              isReceiptSuccess && "text-emerald-600 dark:text-emerald-500",
              isReceiptFailed && "text-destructive",
              !isReceiptSuccess && !isReceiptFailed && "text-muted-foreground",
            )}
          >
            {isReceiptSuccess ? (
              <Check className="size-3.5" />
            ) : isReceiptFailed ? (
              <AlertCircle className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )}
            {receiptSummary}
          </span>
        </div>

        <ul role="list" className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="relative flex items-start gap-3 -mx-2 rounded-lg px-2 py-1.5"
            >
              {index < steps.length - 1 && (
                <div
                  className="absolute left-5 top-8 w-px bg-border"
                  style={{
                    height: "calc(100% + 0.5rem)",
                  }}
                  aria-hidden="true"
                />
              )}
              <div className="relative z-10">
                <StepIndicator status={step.status} />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium leading-6">
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-muted-foreground text-sm">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ProgressTracker({
  id,
  steps,
  elapsedTime,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  className,
}: ProgressTrackerProps) {
  const hasInProgress = steps.some((step) => step.status === "in-progress");
  const hasFailed = steps.some((step) => step.status === "failed");
  const allCompleted = steps.every((step) => step.status === "completed");

  const currentStepId = React.useMemo(() => {
    const inProgressStep = steps.find((s) => s.status === "in-progress");
    if (inProgressStep) return inProgressStep.id;

    const firstPendingStep = steps.find((s) => s.status === "pending");
    if (firstPendingStep) return firstPendingStep.id;

    return null;
  }, [steps]);

  const handleAction = React.useCallback(
    async (actionId: string) => {
      await onResponseAction?.(actionId);
    },
    [onResponseAction],
  );

  const defaultActions: Action[] = React.useMemo(
    () => [
      {
        id: "cancel",
        label: "Cancel",
        variant: "outline",
      },
    ],
    [],
  );

  const normalizedActions = React.useMemo(() => {
    if (allCompleted) return null;

    const config = normalizeActionsConfig(responseActions);
    if (config) return config;

    if (hasFailed) return null;

    return {
      items: defaultActions,
      align: "right" as const,
    };
  }, [allCompleted, responseActions, hasFailed, defaultActions]);

  return (
    <article
      className={cn(
        "flex w-full min-w-80 max-w-md flex-col gap-3",
        "text-foreground select-none",
        className,
      )}
      data-slot="progress-tracker"
      data-tool-ui-id={id}
      role="status"
      aria-live="polite"
      aria-busy={hasInProgress}
    >
      <div className="bg-card flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-xs">
        {elapsedTime !== undefined && elapsedTime > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Timer className="size-3.5 -mt-px" />
            <span>{formatElapsedTime(elapsedTime)}</span>
          </div>
        )}

        <ul role="list" className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const isCurrent = step.id === currentStepId;
            const isActive = step.status === "in-progress";
            const hasDescription = !!step.description;

            return (
              <li
                key={step.id}
                className="relative -mx-2"
                aria-current={isCurrent ? "step" : undefined}
              >
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-5 top-6 w-px bg-border",
                      "motion-safe:transition-all motion-safe:duration-300",
                    )}
                    style={{
                      height: "calc(100% + 0.25rem)",
                    }}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn(
                    "relative z-10 flex items-start gap-3 rounded-lg px-2 py-1.5",
                    "motion-safe:transition-all motion-safe:duration-300",
                    isCurrent && "bg-primary/5",
                  )}
                  style={{
                    backdropFilter: isCurrent ? "blur(2px)" : undefined,
                  }}
                >
                  <div className="relative z-10">
                    <StepIndicator status={step.status} />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium leading-6",
                        step.status === "pending" && "text-muted-foreground",
                        step.status === "in-progress" &&
                          "motion-safe:shimmer shimmer-invert text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {hasDescription && (
                      <div
                        className={cn(
                          "grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-300 motion-safe:ease-out",
                          isActive
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <span className="text-muted-foreground text-sm block pt-0.5">
                            {step.description}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {normalizedActions && (
        <div className="@container/actions">
          <ActionButtons
            actions={normalizedActions.items}
            align={normalizedActions.align}
            confirmTimeout={normalizedActions.confirmTimeout}
            onAction={handleAction}
            onBeforeAction={onBeforeResponseAction}
          />
        </div>
      )}
    </article>
  );
}
