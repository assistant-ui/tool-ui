"use client";

import { useMemo } from "react";
import {
  CircleDot,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import type { PlanProps, PlanTodo } from "./schema";
import {
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./_ui";

const DEFAULT_MAX_VISIBLE = 4;

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function DashedCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 3"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

const STATUS_CONFIG = {
  pending: {
    icon: DashedCircle,
    iconClassName: "text-muted-foreground",
    labelClassName: "",
  },
  in_progress: {
    icon: CircleDot,
    iconClassName: "text-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]",
    labelClassName: "text-primary",
  },
  completed: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-500",
    labelClassName: "text-muted-foreground line-through",
  },
  cancelled: {
    icon: XCircle,
    iconClassName: "text-muted-foreground",
    labelClassName: "text-muted-foreground line-through",
  },
} as const;

function PlanTodoItem({
  todo,
  allComplete,
}: {
  todo: PlanTodo;
  allComplete?: boolean;
}) {
  const {
    icon: Icon,
    iconClassName,
    labelClassName,
  } = STATUS_CONFIG[todo.status];

  const hasDescription = Boolean(todo.description);
  const greenTint = allComplete && todo.status === "completed";

  if (!hasDescription) {
    return (
      <li className="hover:bg-muted -mx-2 flex items-start gap-2 rounded-md px-2 py-1 transition-colors">
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            greenTint ? "text-emerald-500" : iconClassName,
          )}
        />
        <span
          className={cn(
            "text-sm",
            greenTint ? "text-emerald-600/70 line-through" : labelClassName,
          )}
        >
          {todo.label}
        </span>
      </li>
    );
  }

  return (
    <li className="hover:bg-muted -mx-2 rounded-md transition-colors">
      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-start gap-2 px-2 py-1 text-left">
          <Icon
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              greenTint ? "text-emerald-500" : iconClassName,
            )}
          />
          <span
            className={cn(
              "flex-1 text-sm",
              greenTint ? "text-emerald-600/70 line-through" : labelClassName,
            )}
          >
            {todo.label}
          </span>
          <ChevronRight className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0 rotate-90 transition-transform duration-200 in-data-[state=open]:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p
            className={cn(
              "pr-2 pb-1 pl-8 text-xs",
              greenTint ? "text-emerald-600/60" : "text-muted-foreground",
            )}
          >
            {todo.description}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function Plan({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = DEFAULT_MAX_VISIBLE,
  updatedAt,
  className,
}: PlanProps) {
  const { visibleTodos, hiddenTodos, completedCount, allComplete, progress } =
    useMemo(() => {
      const completed = todos.filter((t) => t.status === "completed").length;
      return {
        visibleTodos: todos.slice(0, maxVisibleTodos),
        hiddenTodos: todos.slice(maxVisibleTodos),
        completedCount: completed,
        allComplete: completed === todos.length,
        progress: (completed / todos.length) * 100,
      };
    }, [todos, maxVisibleTodos]);

  return (
    <Card className={cn("w-full max-w-md", className)} data-tool-ui-id={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "bg-muted/50 rounded-lg border p-3",
            allComplete && "border-emerald-500/50 bg-emerald-500/5",
          )}
        >
          <div className="mb-3 flex items-center justify-between text-xs font-medium">
            <span
              className={allComplete ? "text-emerald-600" : "text-muted-foreground"}
            >
              {completedCount} of {todos.length} complete
            </span>
            {allComplete && <span className="text-emerald-600">All done!</span>}
          </div>

          <div
            className={cn(
              "mb-3 h-1.5 overflow-hidden rounded-full",
              allComplete ? "bg-emerald-500/20" : "bg-muted",
            )}
          >
            <div
              className={cn(
                "h-full transition-all duration-500",
                allComplete ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="space-y-2">
            {visibleTodos.map((todo) => (
              <PlanTodoItem key={todo.id} todo={todo} allComplete={allComplete} />
            ))}

            {hiddenTodos.length > 0 && (
              <li>
                <Accordion type="single" collapsible>
                  <AccordionItem value="more" className="border-0">
                    <AccordionTrigger
                      className={cn(
                        "flex items-start justify-start gap-2 py-0 text-sm font-normal [&>svg:last-child]:hidden",
                        allComplete
                          ? "text-emerald-600/70 hover:text-emerald-600"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      <MoreHorizontal
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          allComplete ? "text-emerald-500" : "text-muted-foreground",
                        )}
                      />
                      <span>{hiddenTodos.length} more</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <ul className="space-y-2 px-2 -mx-2">
                        {hiddenTodos.map((todo) => (
                          <PlanTodoItem
                            key={todo.id}
                            todo={todo}
                            allComplete={allComplete}
                          />
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}
          </ul>

          {updatedAt && (
            <div
              className={cn(
                "mt-3 border-t pt-2 text-xs",
                allComplete
                  ? "border-emerald-500/30 text-emerald-600/70"
                  : "text-muted-foreground",
              )}
            >
              Updated {formatRelativeTime(updatedAt)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
