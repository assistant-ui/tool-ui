"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Circle,
  CircleDotDashed,
  CheckCircle2,
  XCircle,
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

const SPIN_KEYFRAMES = `
  @keyframes plan-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface TodoStatusStyle {
  icon: LucideIcon;
  iconClassName: string;
  labelClassName: string;
}

const TODO_STATUS_STYLES: Record<PlanTodoStatus, TodoStatusStyle> = {
  pending: {
    icon: Circle,
    iconClassName: "text-muted-foreground",
    labelClassName: "",
  },
  in_progress: {
    icon: CircleDotDashed,
    iconClassName: "text-muted-foreground",
    labelClassName: "motion-safe:shimmer text-primary/50",
  },
  completed: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-500",
    labelClassName: "text-muted-foreground line-through",
  },
  cancelled: {
    icon: XCircle,
    iconClassName: "text-destructive/70",
    labelClassName: "text-muted-foreground line-through",
  },
};

function TodoIcon({
  icon: Icon,
  className,
  isAnimating,
}: {
  icon: LucideIcon;
  className: string;
  isAnimating?: boolean;
}) {
  const iconElement = <Icon className={cn("h-4 w-4 shrink-0", className)} />;

  if (isAnimating) {
    return (
      <span className="mt-0.5 inline-flex shrink-0 motion-safe:animate-[plan-spin_8s_linear_infinite]">
        {iconElement}
      </span>
    );
  }

  return <span className="mt-0.5 inline-flex shrink-0">{iconElement}</span>;
}

interface PlanTodoItemProps {
  todo: PlanTodo;
}

function PlanTodoItem({ todo }: PlanTodoItemProps) {
  const { icon, iconClassName, labelClassName } =
    TODO_STATUS_STYLES[todo.status];
  const isInProgress = todo.status === "in_progress";

  const labelElement = (
    <span className={cn("text-sm", labelClassName)}>{todo.label}</span>
  );

  if (!todo.description) {
    return (
      <li className="-mx-2 flex cursor-default items-start gap-2 rounded-md px-2 py-2">
        <TodoIcon
          icon={icon}
          className={iconClassName}
          isAnimating={isInProgress}
        />
        {labelElement}
      </li>
    );
  }

  return (
    <li className="hover:bg-muted -mx-2 cursor-default rounded-md">
      <Collapsible>
        <CollapsibleTrigger className="group/todo flex w-full cursor-default items-start gap-2 px-2 py-2 text-left">
          <TodoIcon
            icon={icon}
            className={iconClassName}
            isAnimating={isInProgress}
          />
          <span className={cn("flex-1 text-sm text-pretty", labelClassName)}>
            {todo.label}
          </span>
          <ChevronRight className="text-muted-foreground/50 mt-0.5 size-4 shrink-0 rotate-90 transition-transform duration-150 group-data-[state=open]/todo:[transform:rotateY(180deg)]" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-muted-foreground pr-2 pb-1.5 pl-8 text-sm text-pretty">
            {todo.description}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

interface TodoListProps {
  todos: PlanTodo[];
}

function TodoList({ todos }: TodoListProps) {
  return (
    <>
      {todos.map((todo) => (
        <PlanTodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
}

interface ProgressBarProps {
  progress: number;
  isCelebrating: boolean;
}

function ProgressBar({ progress, isCelebrating }: ProgressBarProps) {
  return (
    <div className="bg-muted mb-3 h-1.5 overflow-hidden rounded-full">
      <div
        className={cn(
          "h-full transition-all duration-500",
          isCelebrating ? "bg-emerald-500" : "bg-primary",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function Plan({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = INITIAL_VISIBLE_TODO_COUNT,
  showProgress = true,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
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

  const resolvedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <>
      <style>{SPIN_KEYFRAMES}</style>
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
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          )}
        </CardHeader>

        <CardContent className="px-4">
          <div className="bg-muted/70 rounded-lg border px-4 py-3">
            {showProgress && (
              <>
                <div className="text-muted-foreground mb-2 text-sm">
                  {completedCount} of {todos.length} complete
                </div>

                <ProgressBar progress={progress} isCelebrating={allComplete} />
              </>
            )}

            <ul className="space-y-0">
              <TodoList todos={visibleTodos} />

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
                          <TodoList todos={hiddenTodos} />
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
    </>
  );
}
