"use client";

import { useState, useEffect } from "react";
import type { PlanTodo } from "@/components/tool-ui/plan/schema";
import { Plan } from "@/components/tool-ui/plan";
import { Button } from "@/components/ui/button";
import type { StagingConfig } from "../types";

const SAMPLE_TODOS: PlanTodo[] = [
  {
    id: "1",
    label: "Design component API",
    description: "Define props interface and behavior",
    status: "completed",
  },
  {
    id: "2",
    label: "Implement core functionality",
    description: "Build main component logic with TypeScript",
    status: "in_progress",
  },
  {
    id: "3",
    label: "Add unit tests",
    description: "Write comprehensive test coverage",
    status: "pending",
  },
  {
    id: "4",
    label: "Update documentation",
    description: "Create usage examples and API docs",
    status: "pending",
  },
];

function PlanTuningPanel() {
  const [todos, setTodos] = useState<PlanTodo[]>(SAMPLE_TODOS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-play animation
  useEffect(() => {
    if (!isAnimating || currentStep >= todos.length) {
      if (currentStep >= todos.length) {
        setIsAnimating(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setTodos((prev) => {
        const updated = [...prev];

        if (currentStep > 0) {
          updated[currentStep - 1] = {
            ...updated[currentStep - 1],
            status: "completed",
          };
        }

        updated[currentStep] = {
          ...updated[currentStep],
          status: "in_progress",
        };

        return updated;
      });

      setCurrentStep((prev) => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isAnimating, currentStep, todos.length]);

  const handlePlay = () => {
    setIsAnimating(true);
    if (currentStep >= todos.length) {
      setCurrentStep(1);
      setTodos(SAMPLE_TODOS);
    }
  };

  const handleReset = () => {
    setIsAnimating(false);
    setCurrentStep(1);
    setTodos(SAMPLE_TODOS);
  };

  const handleCompleteAll = () => {
    setIsAnimating(false);
    setTodos((prev) =>
      prev.map((todo) => ({ ...todo, status: "completed" as const }))
    );
  };

  const handleAddTodo = () => {
    const newTodo: PlanTodo = {
      id: `${todos.length + 1}`,
      label: `New task ${todos.length + 1}`,
      description: "Dynamically added todo item",
      status: "pending",
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleRemoveTodo = () => {
    if (todos.length > 1) {
      setTodos((prev) => prev.slice(0, -1));
    }
  };

  const handleSetStatus = (todoId: string, status: PlanTodo["status"]) => {
    setIsAnimating(false);
    setTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, status } : todo))
    );
  };

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const progress = Math.round((completedCount / todos.length) * 100);

  return (
    <div className="flex w-full max-w-6xl flex-col gap-8">
      <Plan
        id="staging-plan"
        title="Animation Testing"
        description="Interactive controls for testing all animation states"
        todos={todos}
      />

      <div className="space-y-6 border-t pt-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold">
            Animation Controls
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Progress: {completedCount}/{todos.length} = {progress}%)
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePlay} disabled={isAnimating} size="sm">
              {currentStep >= todos.length ? "Replay" : "Play"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset
            </Button>
            <Button onClick={handleCompleteAll} variant="outline" size="sm">
              Complete All
            </Button>
            <Button onClick={handleAddTodo} variant="outline" size="sm">
              Add Todo
            </Button>
            <Button
              onClick={handleRemoveTodo}
              variant="outline"
              size="sm"
              disabled={todos.length <= 1}
            >
              Remove Todo
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Individual Todo Controls</h3>
          <div className="grid gap-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{todo.label}</div>
                  {todo.description && (
                    <div className="text-xs text-muted-foreground">
                      {todo.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleSetStatus(todo.id, "pending")}
                    variant={todo.status === "pending" ? "default" : "outline"}
                    size="sm"
                  >
                    Pending
                  </Button>
                  <Button
                    onClick={() => handleSetStatus(todo.id, "in_progress")}
                    variant={
                      todo.status === "in_progress" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    In Progress
                  </Button>
                  <Button
                    onClick={() => handleSetStatus(todo.id, "completed")}
                    variant={
                      todo.status === "completed" ? "default" : "outline"
                    }
                    size="sm"
                  >
                    Completed
                  </Button>
                  <Button
                    onClick={() => handleSetStatus(todo.id, "cancelled")}
                    variant={
                      todo.status === "cancelled" ? "destructive" : "outline"
                    }
                    size="sm"
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="mb-2 text-sm font-semibold">Animation Features</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Spring bounce on completion/cancellation icons</li>
            <li>• Stroke-drawing animation for checkmarks and X icons</li>
            <li>• Fast 0.7s spinner for in-progress state</li>
            <li>• Shimmer effect on in-progress labels</li>
            <li>• Staggered entrance for new todos (50ms between items)</li>
            <li>• Progress bar celebration: shimmer + glow + pulse at 100%</li>
            <li>• Bouncy chevron rotation with spring physics</li>
            <li>
              • Staggered content reveal in accordion (100-150ms delays)
            </li>
            <li>• All animations respect prefers-reduced-motion setting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export const planStagingConfig: StagingConfig = {
  supportedDebugLevels: ["off"],
  renderTuningPanel: () => <PlanTuningPanel />,
};
