"use client";

import * as React from "react";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Loader2,
  Check,
  X,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import type { PlanProps, PlanTodo, PlanTodoStatus } from "./schema";
import {
  cn,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./_adapter";
import { ActionButtons, normalizeActionsConfig } from "../shared";

const INITIAL_VISIBLE_TODO_COUNT = 4;

function TodoIcon({ status }: { status: PlanTodoStatus }) {
  if (status === "pending") {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card motion-safe:transition-all motion-safe:duration-200"
        aria-hidden="true"
      />
    );
  }

  if (status === "in_progress") {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] motion-safe:transition-all motion-safe:duration-300"
        aria-hidden="true"
      >
        <Loader2 className="size-5 text-primary motion-safe:animate-[spin_0.7s_linear_infinite]" />
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary bg-primary shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      >
        <Check
          className="size-4 text-primary-foreground [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "24" }}
        />
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-full border border-destructive bg-destructive shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)] dark:border-red-600 dark:bg-red-600"
        aria-hidden="true"
      >
        <X
          className="size-4 text-white [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "16" }}
        />
      </span>
    );
  }

  return null;
}

interface PlanTodoItemProps {
  todo: PlanTodo;
  className?: string;
  style?: React.CSSProperties;
  showConnector?: boolean;
}

function PlanTodoItem({ todo, className, style, showConnector }: PlanTodoItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const labelElement = (
    <span
      className={cn(
        "text-sm font-medium leading-6 break-words",
        todo.status === "pending" && "text-muted-foreground",
        todo.status === "in_progress" && "motion-safe:shimmer shimmer-invert text-foreground",
        (todo.status === "completed" || todo.status === "cancelled") && "text-muted-foreground"
      )}
    >
      {todo.label}
    </span>
  );

  if (!todo.description) {
    return (
      <li className={cn("relative -mx-2 flex cursor-default items-start gap-3 rounded-md px-2 py-1.5", className)} style={style}>
        {showConnector && (
          <div
            className="absolute left-5 top-6 w-px bg-border"
            style={{
              height: "calc(100% + 0.25rem)",
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10">
          <TodoIcon status={todo.status} />
        </div>
        <div className="flex-1 min-w-0">
          {labelElement}
        </div>
      </li>
    );
  }

  return (
    <li className={cn("relative -mx-2 cursor-default rounded-md min-w-0", className)} style={style}>
      {showConnector && (
        <div
          className="absolute left-5 top-6 w-px bg-border"
          style={{
            height: "calc(100% + 0.25rem)",
          }}
          aria-hidden="true"
        />
      )}
      <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="min-w-0 data-[state=open]:bg-primary/5 rounded-md motion-safe:transition-all motion-safe:duration-200"
          style={{
            backdropFilter: isOpen ? "blur(2px)" : undefined,
          }}
        >
        <CollapsibleTrigger className="group/todo flex w-full cursor-default items-start gap-3 px-2 py-1.5 text-left">
          <div className="relative z-10">
            <TodoIcon status={todo.status} />
          </div>
          <span className="flex-1 min-w-0">
            {labelElement}
          </span>
          <ChevronRight className="text-muted-foreground/50 group-hover/todo:text-muted-foreground mt-0.5 size-4 shrink-0 rotate-90 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[state=open]/todo:[transform:rotateY(180deg)]" />
        </CollapsibleTrigger>
        <CollapsibleContent className="group/content" data-slot="collapsible-content">
          <div className="min-w-0 motion-safe:group-data-[state=open]/content:animate-[fade-in-stagger_120ms_ease-out_30ms_backwards] motion-safe:group-data-[state=closed]/content:animate-[fade-out-stagger_120ms_ease-out]">
            <p className="text-muted-foreground pr-2 pb-1.5 pl-11 text-sm text-pretty break-words min-w-0">
              {todo.description}
            </p>
          </div>
        </CollapsibleContent>
        </div>
      </Collapsible>
    </li>
  );
}

interface TodoListProps {
  todos: PlanTodo[];
  newTodoIds: Set<string>;
}

function TodoList({ todos, newTodoIds }: TodoListProps) {
  return (
    <>
      {todos.map((todo, index) => {
        const isNew = newTodoIds.has(todo.id);
        const staggerDelay = isNew ? index * 50 : 0;

        return (
          <PlanTodoItem
            key={todo.id}
            todo={todo}
            showConnector={index < todos.length - 1}
            className={cn(isNew && "motion-safe:animate-[fade-up_300ms_ease-out]")}
            style={
              isNew
                ? {
                    animationDelay: `${staggerDelay}ms`,
                    animationFillMode: "backwards",
                  }
                : undefined
            }
          />
        );
      })}
    </>
  );
}

interface ProgressBarProps {
  progress: number;
  isCelebrating: boolean;
}

function ProgressBar({ progress, isCelebrating }: ProgressBarProps) {
  return (
    <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          progress === 100
            ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 motion-safe:animate-[progress-pulse_600ms_ease-out]"
            : "bg-primary"
        )}
        style={{
          width: `${progress}%`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
      {isCelebrating && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full motion-safe:animate-[glow-pulse_600ms_ease-out]"
          style={{
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
          }}
        />
      )}
    </div>
  );
}

function PlanRoot({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = INITIAL_VISIBLE_TODO_COUNT,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  className,
  showProgress = true,
}: PlanProps & { showProgress?: boolean }) {
  const seenTodoIds = useRef(new Set<string>());
  const [newTodoIds, setNewTodoIds] = useState<Set<string>>(new Set());
  const isInitialMount = useRef(true);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const prevProgressRef = useRef(0);

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

  useEffect(() => {
    const newIds = new Set<string>();

    todos.forEach((todo) => {
      if (!seenTodoIds.current.has(todo.id)) {
        newIds.add(todo.id);
        seenTodoIds.current.add(todo.id);
      }
    });

    if (newIds.size > 0) {
      setNewTodoIds(newIds);

      // Clear animation class after entrance completes
      const timer = setTimeout(() => {
        setNewTodoIds(new Set());
      }, 500);

      return () => clearTimeout(timer);
    }

    // Mark initial mount complete
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [todos]);

  useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 1000);
      return () => clearTimeout(timer);
    }
    prevProgressRef.current = progress;
  }, [progress]);

  const resolvedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <Card
      className={cn("w-full max-w-xl min-w-80 gap-4 py-4", className)}
      data-tool-ui-id={id}
      data-slot="plan"
    >
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="leading-5 font-medium text-pretty">
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {allComplete && (
            <Check className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          )}
        </CardHeader>

        <CardContent className="px-4 min-w-0">
          <div className="bg-muted/70 rounded-lg px-6 py-4 min-w-0">
            {showProgress && (
              <>
                <div className="text-muted-foreground mb-2 text-sm">
                  {completedCount} of {todos.length} complete
                </div>

                <ProgressBar progress={progress} isCelebrating={isCelebrating} />
              </>
            )}

            <ul className="mt-4 space-y-1 min-w-0">
              <TodoList todos={visibleTodos} newTodoIds={newTodoIds} />

              {hiddenTodos.length > 0 && (
                <li className="mt-1">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="more" className="border-0">
                      <AccordionTrigger className="text-muted-foreground hover:text-primary flex cursor-default items-start justify-start gap-2 py-1 text-sm font-normal [&>svg:last-child]:hidden">
                        <MoreHorizontal className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
                        <span>{hiddenTodos.length} more</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        <ul className="-mx-2 space-y-2 px-2">
                          <TodoList todos={hiddenTodos} newTodoIds={newTodoIds} />
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              )}
            </ul>
          </div>
        </CardContent>

        {resolvedFooterActions && (
          <CardFooter className="@container/actions">
            <ActionButtons
              actions={resolvedFooterActions.items}
              align={resolvedFooterActions.align}
              confirmTimeout={resolvedFooterActions.confirmTimeout}
              onAction={(id) => onResponseAction?.(id)}
              onBeforeAction={onBeforeResponseAction}
              className="w-full"
            />
          </CardFooter>
        )}
    </Card>
  );
}

export function PlanCompact(props: PlanProps) {
  return <PlanRoot {...props} showProgress={false} />;
}

type PlanComponent = typeof PlanRoot & {
  Compact: typeof PlanCompact;
};

export const Plan = Object.assign(PlanRoot, { Compact: PlanCompact }) as PlanComponent;
