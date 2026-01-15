"use client";

import { useState, useEffect } from "react";
import type { StagingConfig } from "../types";
import { ProgressTracker } from "@/components/tool-ui/progress-tracker";
import type { ProgressStep } from "@/components/tool-ui/progress-tracker/schema";
import { Button } from "@/components/ui/button";

const SAMPLE_STEPS: ProgressStep[] = [
  {
    id: "build",
    label: "Building",
    description: "Compiling TypeScript and bundling assets",
    status: "completed",
  },
  {
    id: "test",
    label: "Running Tests",
    description: "84 tests across 12 suites",
    status: "in-progress",
  },
  {
    id: "deploy",
    label: "Deploy to Production",
    description: "Upload to edge nodes",
    status: "pending",
  },
];

function ProgressTrackerTuningPanel() {
  const [steps, setSteps] = useState<ProgressStep[]>(SAMPLE_STEPS);
  const [elapsedTime, setElapsedTime] = useState(38400);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);

  useEffect(() => {
    if (!isAnimating) return;

    if (currentStepIndex >= steps.length) {
      setIsAnimating(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status:
            index < currentStepIndex
              ? "completed"
              : index === currentStepIndex
                ? "in-progress"
                : "pending",
        }))
      );

      setElapsedTime((prev) => prev + 12000);
      setCurrentStepIndex((prev) => prev + 1);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [isAnimating, currentStepIndex, steps.length]);

  const startAnimation = () => {
    setCurrentStepIndex(0);
    setElapsedTime(38400);
    setSteps(
      SAMPLE_STEPS.map((step, index) => ({
        ...step,
        status: index === 0 ? "in-progress" : "pending",
      }))
    );
    setIsAnimating(true);
  };

  const resetToDefault = () => {
    setIsAnimating(false);
    setCurrentStepIndex(1);
    setElapsedTime(38400);
    setSteps(SAMPLE_STEPS);
  };

  const setAllCompleted = () => {
    setIsAnimating(false);
    setSteps((prev) => prev.map((step) => ({ ...step, status: "completed" })));
  };

  const setStepStatus = (stepId: string, status: ProgressStep["status"]) => {
    setIsAnimating(false);
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
  };

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <div className="flex w-full justify-center">
        <ProgressTracker
          id="staging-progress-tracker"
          steps={steps}
          elapsedTime={elapsedTime}
          responseActions={[{ id: "cancel", label: "Cancel", variant: "outline" }]}
        />
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Animation Controls</h3>
          <div className="flex gap-2">
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              size="sm"
            >
              {isAnimating ? "Animating..." : "Play Animation"}
            </Button>
            <Button onClick={resetToDefault} variant="outline" size="sm">
              Reset
            </Button>
            <Button onClick={setAllCompleted} variant="outline" size="sm">
              Complete All
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="rounded-lg border p-4"
            >
              <div className="mb-3 text-sm font-medium">{step.label}</div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => setStepStatus(step.id, "pending")}
                  variant={step.status === "pending" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  Pending
                </Button>
                <Button
                  onClick={() => setStepStatus(step.id, "in-progress")}
                  variant={step.status === "in-progress" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  In Progress
                </Button>
                <Button
                  onClick={() => setStepStatus(step.id, "completed")}
                  variant={step.status === "completed" ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  Completed
                </Button>
                <Button
                  onClick={() => setStepStatus(step.id, "failed")}
                  variant={step.status === "failed" ? "destructive" : "outline"}
                  size="sm"
                  className="w-full"
                >
                  Failed
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-muted p-4">
          <h4 className="mb-2 text-sm font-medium">Animation Features</h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Spring bounce animation on completion with cubic-bezier timing</li>
            <li>• Checkmark draw-in effect with stroke animation</li>
            <li>• Shimmer effect on active step background</li>
            <li>• 300ms smooth transitions between states</li>
            <li>• Real-time elapsed time updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const progressTrackerStagingConfig: StagingConfig = {
  supportedDebugLevels: ["off"],
  renderTuningPanel: () => <ProgressTrackerTuningPanel />,
};
