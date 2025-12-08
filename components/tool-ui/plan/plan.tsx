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
} from "./_ui";
import { ActionButtons, normalizeActionsConfig } from "../shared";

const DEFAULT_MAX_VISIBLE = 4;

const SPIN_KEYFRAMES = `
  @keyframes plan-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface StatusStyle {
  icon: LucideIcon;
  iconClassName: string;
  labelClassName: string;
}

const STATUS_STYLES: Record<PlanTodoStatus, StatusStyle> = {
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
  animate,
}: {
  icon: LucideIcon;
  className: string;
  animate?: boolean;
}) {
  const iconElement = <Icon className={cn("h-4 w-4 shrink-0", className)} />;

  if (animate) {
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
  const { icon, iconClassName, labelClassName } = STATUS_STYLES[todo.status];
  const isActive = todo.status === "in_progress";

  const todoLabel = (
    <span className={cn("text-sm", labelClassName)}>{todo.label}</span>
  );

  if (!todo.description) {
    return (
      <li className="-mx-2 flex cursor-default items-start gap-2 rounded-md px-2 py-1">
        <TodoIcon icon={icon} className={iconClassName} animate={isActive} />
        {todoLabel}
      </li>
    );
  }

  return (
    <li className="hover:bg-muted -mx-2 cursor-default rounded-md">
      <Collapsible>
        <CollapsibleTrigger className="group/todo flex w-full cursor-default items-start gap-2 px-2 py-1 text-left">
          <TodoIcon icon={icon} className={iconClassName} animate={isActive} />
          <span className={cn("flex-1 text-pretty text-sm", labelClassName)}>
            {todo.label}
          </span>
          <ChevronRight className="text-muted-foreground/50 mt-0.5 size-4 shrink-0 rotate-90 transition-transform duration-150 group-data-[state=open]/todo:[transform:rotateY(180deg)]" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="text-muted-foreground text-pretty pr-2 pb-1.5 pl-8 text-xs">
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

interface PlanClientProps {
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
}

export function Plan({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = DEFAULT_MAX_VISIBLE,
  showProgress = true,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  className,
}: PlanProps & PlanClientProps) {
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

  const normalizedActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <>
      <style>{SPIN_KEYFRAMES}</style>
      <Card className={cn("w-full max-w-md", className)} data-tool-ui-id={id}>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {allComplete && (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
          )}
        </CardHeader>

        <CardContent>
          <div className="bg-muted/50 rounded-lg border p-3">
            {showProgress && (
              <>
                <div className="text-muted-foreground mb-2 text-sm">
                  {completedCount} of {todos.length} complete
                </div>

                <ProgressBar progress={progress} isCelebrating={allComplete} />
              </>
            )}

            <ul className="space-y-2">
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

        {normalizedActions && (
          <CardFooter className="@container/actions">
            <ActionButtons
              actions={normalizedActions.items}
              align={normalizedActions.align}
              confirmTimeout={normalizedActions.confirmTimeout}
              onAction={(id) => onResponseAction?.(id)}
              onBeforeAction={onBeforeResponseAction}
            />
          </CardFooter>
        )}
      </Card>
    </>
  );
}
