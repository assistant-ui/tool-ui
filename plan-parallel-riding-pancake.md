# Plan Component Animation Polish - Implementation Plan

**Created:** 2026-01-15
**Goal:** Bring Progress Tracker's animation polish to the Plan component with full motion design pass

## Context Summary

The Plan component needs comprehensive animation upgrades to match Progress Tracker's polished feel:
- Current state: 8s spinner, basic transitions, minimal visual feedback
- Target state: Spring bounce effects, stroke-drawing icons, 0.7s spinner, shimmer effects, entrance animations, progress celebration

**Key Files:**
- Component: `components/tool-ui/plan/plan.tsx` (275 lines)
- Animations: `app/styles/custom-utilities.css` (existing keyframes + new ones)
- Staging: `lib/staging/configs/plan.tsx` (to be enhanced)
- Showcase: `app/components/home/chat-showcase.tsx` (add animated demo)

## Phase 1: Core Animation Infrastructure

### Step 1.1: Add New Keyframes to Custom Utilities

**File:** `app/styles/custom-utilities.css`

**Action:** Add three new keyframes after the existing `check-draw` keyframe (around line 45)

```css
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3);
  }
}

@keyframes shimmer-sweep {
  0% {
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
  100% {
    transform: translateX(100%);
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes fade-in-stagger {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Verification:** Run `pnpm dev` and check browser console for CSS errors

---

### Step 1.2: Update Imports in Plan Component

**File:** `components/tool-ui/plan/plan.tsx`

**Current imports (lines 1-30):**
```typescript
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
```

**Action:** Replace with:
```typescript
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Loader2,
  Check,
  X,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
```

**Changes:**
- Add `useState`, `useEffect`, `useRef` to React imports
- Replace `CircleDotDashed` with `Loader2` (for spinner)
- Replace `CheckCircle2` with `Check` (for stroke animation)
- Replace `XCircle` with `X` (for stroke animation)

**Verification:** TypeScript should not show import errors

---

### Step 1.3: Remove Inline Keyframe Injection

**File:** `components/tool-ui/plan/plan.tsx`

**Action 1:** Delete lines 34-39 (SPIN_KEYFRAMES constant)
```typescript
// DELETE THIS:
const SPIN_KEYFRAMES = `
  @keyframes plan-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
```

**Action 2:** In the main Plan component (around line 206), delete the inline `<style>` tag:
```typescript
// DELETE THIS:
{SPIN_KEYFRAMES && (
  <style dangerouslySetInnerHTML={{ __html: SPIN_KEYFRAMES }} />
)}
```

**Verification:** Component still renders without console errors

---

### Step 1.4: Transform TodoIcon Component

**File:** `components/tool-ui/plan/plan.tsx` (lines 70-90)

**Current implementation:**
```typescript
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
```

**Action:** Replace entire function with:
```typescript
function TodoIcon({ status }: { status: PlanTodoStatus }) {
  if (status === "pending") {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-card motion-safe:transition-all motion-safe:duration-200"
        aria-hidden="true"
      >
        <Circle className="size-3 text-muted-foreground" />
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-card shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] motion-safe:transition-all motion-safe:duration-300"
        aria-hidden="true"
      >
        <Loader2 className="size-3 text-primary motion-safe:animate-[spin_0.7s_linear_infinite]" />
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary bg-primary shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      >
        <Check
          className="size-3 text-primary-foreground [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "24" }}
        />
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-full border border-destructive bg-destructive shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)] dark:border-red-700 dark:bg-red-700"
        aria-hidden="true"
      >
        <X
          className="size-3 text-white [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "16" }}
        />
      </span>
    );
  }

  return null;
}
```

**Key changes:**
- Simplified props to just `status`
- Each state has dedicated rendering logic
- Pending: hollow circle, 200ms transition
- In-progress: glow effect, 0.7s spinner (fast!)
- Completed: spring-bounce container, stroke-drawing checkmark
- Failed: same bounce, destructive colors, X icon

**Verification:** Component renders all four states correctly

---

### Step 1.5: Update TodoIcon Call Sites

**File:** `components/tool-ui/plan/plan.tsx`

**Location 1:** PlanTodoItem component (around line 122)

**Current code:**
```typescript
<TodoIcon
  icon={icon}
  className={statusColors[todo.status].icon}
  isAnimating={todo.status === "in_progress"}
/>
```

**Replace with:**
```typescript
<TodoIcon status={todo.status} />
```

**Location 2:** Non-collapsible item rendering (around line 109)

**Current code:**
```typescript
<TodoIcon
  icon={icon}
  className={statusColors[todo.status].icon}
  isAnimating={todo.status === "in_progress"}
/>
```

**Replace with:**
```typescript
<TodoIcon status={todo.status} />
```

**Verification:** Both collapsible and non-collapsible todos render icons correctly

---

### Step 1.6: Add Shimmer to In-Progress Labels

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** PlanTodoItem component, label rendering (around line 127)

**Current code:**
```typescript
<span className="flex-1 font-medium">{todo.content}</span>
```

**Replace with:**
```typescript
<span
  className={cn(
    "flex-1 font-medium",
    todo.status === "in_progress" &&
      "text-foreground motion-safe:shimmer shimmer-invert"
  )}
>
  {todo.content}
</span>
```

**Also update:** Non-collapsible variant label (around line 112)

**Verification:** In-progress todo labels show shimmer animation

---

### Step 1.7: Remove Old Status Icon Logic

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** PlanTodoItem component (around lines 96-103)

**Current code:**
```typescript
const statusConfig: Record<
  PlanTodoStatus,
  { icon: LucideIcon; iconClass: string; labelClass: string }
> = {
  pending: { icon: Circle, iconClass: "text-muted-foreground", labelClass: "" },
  in_progress: { icon: CircleDotDashed, iconClass: "text-primary", labelClass: "text-foreground motion-safe:shimmer shimmer-invert" },
  completed: { icon: CheckCircle2, iconClass: "text-emerald-600", labelClass: "text-muted-foreground line-through" },
  failed: { icon: XCircle, iconClass: "text-destructive", labelClass: "text-muted-foreground line-through" },
};

const { icon, iconClass: _, labelClass } = statusConfig[todo.status];
```

**Action:** Delete the entire `statusConfig` object and destructuring line (no longer needed since TodoIcon handles its own rendering)

**Verification:** No TypeScript errors, component still renders

---

## Phase 2: Entrance Animations

### Step 2.1: Add Entrance Animation State Management

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** Inside main Plan component function (around line 180, before the useMemo)

**Action:** Add state tracking for new todos:
```typescript
export function Plan({ id, title, description, todos, maxVisibleTodos = 8, responseActions }: PlanProps) {
  // ADD THESE THREE HOOKS:
  const seenTodoIds = useRef(new Set<string>());
  const [newTodoIds, setNewTodoIds] = useState<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  // Existing useMemo below...
```

**Verification:** TypeScript accepts the new state hooks

---

### Step 2.2: Implement New Todo Detection Logic

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** After the state hooks, before useMemo (around line 185)

**Action:** Add useEffect to track new todos:
```typescript
useEffect(() => {
  const newIds = new Set<string>();

  todos.forEach((todo, index) => {
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
```

**Verification:** Add console.log in effect to verify it runs on todo changes

---

### Step 2.3: Apply Entrance Animation to Todo Items

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** PlanTodoItem rendering in TodoList (around line 149)

**Current code:**
```typescript
{visibleTodos.map((todo) => (
  <PlanTodoItem key={todo.id} todo={todo} />
))}
```

**Replace with:**
```typescript
{visibleTodos.map((todo, index) => {
  const isNew = newTodoIds.has(todo.id);
  const staggerDelay = isNew ? index * 50 : 0;

  return (
    <PlanTodoItem
      key={todo.id}
      todo={todo}
      className={cn(
        isNew && "motion-safe:animate-[fade-up_300ms_ease-out]"
      )}
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
```

**Verification:** New todos fade up with 50ms stagger between each

---

### Step 2.4: Update PlanTodoItem to Accept Animation Props

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** PlanTodoItem function signature (around line 96)

**Current code:**
```typescript
function PlanTodoItem({ todo }: { todo: PlanTodo }) {
```

**Replace with:**
```typescript
function PlanTodoItem({
  todo,
  className,
  style,
}: {
  todo: PlanTodo;
  className?: string;
  style?: React.CSSProperties;
}) {
```

**Action:** Apply className and style to wrapper element

**For non-collapsible variant (line 105):**
```typescript
<li className={cn("flex gap-2", className)} style={style}>
```

**For collapsible variant (line 118):**
```typescript
<Collapsible asChild className={className} style={style}>
  <li>
```

**Verification:** Entrance animations apply to todo items

---

## Phase 3: Progress Bar Celebration

### Step 3.1: Add Celebration State to Plan Component

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** After the new todo tracking state (around line 188)

**Action:** Add celebration tracking:
```typescript
const [isCelebrating, setIsCelebrating] = useState(false);
const prevProgressRef = useRef(0);
```

**Verification:** State compiles without errors

---

### Step 3.2: Implement Celebration Trigger Logic

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** After the useMemo that calculates progress (around line 200)

**Action:** Add celebration effect:
```typescript
useEffect(() => {
  if (progress === 100 && prevProgressRef.current < 100) {
    setIsCelebrating(true);
    const timer = setTimeout(() => setIsCelebrating(false), 1000);
    return () => clearTimeout(timer);
  }
  prevProgressRef.current = progress;
}, [progress]);
```

**Verification:** Log in effect to verify it triggers at 100%

---

### Step 3.3: Update ProgressBar Component Signature

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** ProgressBar component (around line 161)

**Current code:**
```typescript
function ProgressBar({ progress, isCelebrating }: ProgressBarProps) {
```

**Action:** Keep signature (already accepts isCelebrating), update rendering

---

### Step 3.4: Implement Multi-Layered Celebration Effect

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** ProgressBar component body (lines 163-170)

**Current code:**
```typescript
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
```

**Replace with:**
```typescript
return (
  <div className="relative mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
    <div
      className={cn(
        "h-full rounded-full transition-all duration-500",
        progress === 100
          ? "bg-emerald-500 motion-safe:animate-[progress-pulse_600ms_ease-out]"
          : "bg-primary"
      )}
      style={{ width: `${progress}%` }}
    >
      {isCelebrating && (
        <div
          className="absolute inset-0 motion-safe:animate-[shimmer-sweep_800ms_ease-out]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
          }}
        />
      )}
    </div>
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
```

**Key changes:**
- Add `relative` to container for absolute positioning
- Add `progress-pulse` animation to bar when complete
- Add shimmer sweep overlay when celebrating
- Add glow pulse effect around entire bar

**Verification:** Progress bar pulses, shimmers, and glows at 100%

---

### Step 3.5: Pass Celebration State to ProgressBar

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** ProgressBar call site (around line 230)

**Current code:**
```typescript
<ProgressBar progress={progress} isCelebrating={allComplete} />
```

**Replace with:**
```typescript
<ProgressBar progress={progress} isCelebrating={isCelebrating} />
```

**Verification:** Celebration effects trigger correctly at 100%

---

## Phase 4: Accordion Enhancements

### Step 4.1: Update Chevron Rotation Easing

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** ChevronRight icon in PlanTodoItem (around line 130)

**Current code:**
```typescript
<ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]/todo:[transform:rotateY(180deg)]" />
```

**Replace with:**
```typescript
<ChevronRight className="size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[state=open]/todo:rotate-90" />
```

**Changes:**
- Increase duration: 150ms → 300ms
- Add bouncy cubic-bezier easing
- Change transform: rotateY(180deg) → rotate-90 (more conventional)
- Add motion-safe prefix

**Verification:** Chevron rotates with spring physics

---

### Step 4.2: Add Staggered Content Reveal to Description

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** CollapsibleContent in PlanTodoItem (around line 132)

**Current code:**
```typescript
<CollapsibleContent className="pb-2 pl-7 text-sm text-muted-foreground">
  <p className="leading-relaxed">{todo.description}</p>
</CollapsibleContent>
```

**Replace with:**
```typescript
<CollapsibleContent className="pb-2 pl-7 text-sm text-muted-foreground">
  <div className="motion-safe:animate-[fade-in-stagger_200ms_ease-out_100ms_backwards]">
    <p className="leading-relaxed">{todo.description}</p>
  </div>
</CollapsibleContent>
```

**Key changes:**
- Wrap content in animated div
- 200ms fade-in animation
- 100ms delay (starts after accordion opens)
- `backwards` fill mode prevents flash

**Verification:** Description fades in smoothly after accordion opens

---

### Step 4.3: Add Staggered Reveal to Metadata Section

**File:** `components/tool-ui/plan/plan.tsx`

**Location:** Time metadata in "more" accordion (around line 250)

**Current code:**
```typescript
{(startTime || elapsedMs !== undefined) && (
  <div className="flex flex-col gap-1 text-xs">
    {/* timestamp content */}
  </div>
)}
```

**Replace with:**
```typescript
{(startTime || elapsedMs !== undefined) && (
  <div className="flex flex-col gap-1 text-xs motion-safe:animate-[fade-in-stagger_200ms_ease-out_150ms_backwards]">
    {/* timestamp content */}
  </div>
)}
```

**Changes:**
- Add same fade-in-stagger animation
- 150ms delay (slightly after description)

**Verification:** Metadata appears with subtle stagger after description

---

## Phase 5: Showcase Updates

### Step 5.1: Create AnimatedPlan Component

**File:** `app/components/home/chat-showcase.tsx`

**Location:** After AnimatedProgressTracker (around line 300)

**Action:** Add new component:
```typescript
function AnimatedPlan() {
  const [todos, setTodos] = useState<SerializablePlanTodo[]>([
    {
      id: "1",
      status: "completed",
      content: "Initialize project structure",
      description: "Set up monorepo with pnpm workspaces",
    },
    {
      id: "2",
      status: "in_progress",
      content: "Implement authentication system",
      description: "Add JWT-based auth with refresh tokens",
    },
    {
      id: "3",
      status: "pending",
      content: "Build user dashboard",
      description: "Create analytics overview and settings",
    },
    {
      id: "4",
      status: "pending",
      content: "Integrate payment processing",
      description: "Connect Stripe for subscription billing",
    },
  ]);

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentStep >= todos.length) return;

    const timer = setTimeout(() => {
      setTodos((prev) => {
        const updated = [...prev];

        // Mark previous step as completed
        if (currentStep > 0) {
          updated[currentStep - 1] = {
            ...updated[currentStep - 1],
            status: "completed",
          };
        }

        // Mark current step as in progress
        updated[currentStep] = {
          ...updated[currentStep],
          status: "in_progress",
        };

        return updated;
      });

      setCurrentStep((prev) => prev + 1);
    }, 1800);

    return () => clearTimeout(timer);
  }, [currentStep, todos.length]);

  return (
    <Plan
      id="animated-plan-showcase"
      title="Feature Implementation"
      description="Building the Q1 milestone"
      todos={todos}
    />
  );
}
```

**Verification:** Component cycles through steps with realistic timing

---

### Step 5.2: Add AnimatedPlan to Showcase Rotation

**File:** `app/components/home/chat-showcase.tsx`

**Location:** Find where showcase components are rendered (search for "AnimatedProgressTracker")

**Action:** Add AnimatedPlan to the rotation alongside other animated demos

**Verification:** AnimatedPlan appears in homepage showcase

---

## Phase 6: Staging Panel Enhancement

### Step 6.1: Create Plan Staging Config File

**File:** `lib/staging/configs/plan.tsx` (create new file)

**Action:** Create file with full staging implementation:

```typescript
"use client";

import { useState, useEffect } from "react";
import type { PlanProps, PlanTodo } from "@/components/tool-ui/plan/schema";
import { Plan } from "@/components/tool-ui/plan";
import { Button } from "@/components/ui/button";
import type { StagingConfig } from "../types";

const SAMPLE_TODOS: PlanTodo[] = [
  {
    id: "1",
    status: "completed",
    content: "Design component API",
    description: "Define props interface and behavior",
  },
  {
    id: "2",
    status: "in_progress",
    content: "Implement core functionality",
    description: "Build main component logic with TypeScript",
  },
  {
    id: "3",
    status: "pending",
    content: "Add unit tests",
    description: "Write comprehensive test coverage",
  },
  {
    id: "4",
    status: "pending",
    content: "Update documentation",
    description: "Create usage examples and API docs",
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
      status: "pending",
      content: `New task ${todos.length + 1}`,
      description: "Dynamically added todo item",
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleRemoveTodo = () => {
    if (todos.length > 1) {
      setTodos((prev) => prev.slice(0, -1));
    }
  };

  const handleSetStatus = (
    todoId: string,
    status: PlanTodo["status"]
  ) => {
    setIsAnimating(false);
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, status } : todo
      )
    );
  };

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
          <h3 className="mb-3 text-sm font-semibold">Animation Controls</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handlePlay}
              disabled={isAnimating}
              size="sm"
            >
              {currentStep >= todos.length ? "Replay" : "Play"}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset
            </Button>
            <Button
              onClick={handleCompleteAll}
              variant="outline"
              size="sm"
            >
              Complete All
            </Button>
            <Button
              onClick={handleAddTodo}
              variant="outline"
              size="sm"
            >
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
                  <div className="font-medium">{todo.content}</div>
                  <div className="text-xs text-muted-foreground">
                    {todo.description}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() =>
                      handleSetStatus(todo.id, "pending")
                    }
                    variant={
                      todo.status === "pending"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    Pending
                  </Button>
                  <Button
                    onClick={() =>
                      handleSetStatus(todo.id, "in_progress")
                    }
                    variant={
                      todo.status === "in_progress"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    In Progress
                  </Button>
                  <Button
                    onClick={() =>
                      handleSetStatus(todo.id, "completed")
                    }
                    variant={
                      todo.status === "completed"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                  >
                    Completed
                  </Button>
                  <Button
                    onClick={() =>
                      handleSetStatus(todo.id, "failed")
                    }
                    variant={
                      todo.status === "failed"
                        ? "destructive"
                        : "outline"
                    }
                    size="sm"
                  >
                    Failed
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <h4 className="mb-2 text-sm font-semibold">
            Animation Features
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Spring bounce on completion/failure icons</li>
            <li>• Stroke-drawing animation for checkmarks and X icons</li>
            <li>• Fast 0.7s spinner for in-progress state</li>
            <li>• Shimmer effect on in-progress labels</li>
            <li>• Staggered entrance for new todos (50ms between items)</li>
            <li>
              • Progress bar celebration: shimmer + glow + pulse at 100%
            </li>
            <li>• Bouncy chevron rotation with spring physics</li>
            <li>
              • Staggered content reveal in accordion (100-150ms delays)
            </li>
            <li>
              • All animations respect prefers-reduced-motion setting
            </li>
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
```

**Verification:** Staging panel renders without errors

---

### Step 6.2: Register Staging Config

**File:** `lib/staging/staging-config.ts`

**Action 1:** Add import at top:
```typescript
import { planStagingConfig } from "./configs/plan";
```

**Action 2:** Add to stagingConfigs object:
```typescript
const stagingConfigs: Partial<Record<ComponentId, StagingConfig>> = {
  "parameter-slider": parameterSliderStagingConfig,
  "stats-display": statsDisplayStagingConfig,
  "progress-tracker": progressTrackerStagingConfig,
  plan: planStagingConfig, // ADD THIS LINE
};
```

**Verification:** Visit `/staging` page and select Plan component

---

## Phase 7: Documentation Updates

### Step 7.1: Update Plan Component Documentation

**File:** `app/docs/plan/content.mdx`

**Action:** Add new section after the "Behavior" section:

```markdown
## Animations

The Plan component includes polished animations that enhance the user experience while respecting accessibility preferences:

### State Transitions

- **Spring bounce effects**: When todos complete or fail, icons bounce with playful spring physics
- **Stroke-drawing animations**: Checkmarks and X icons draw themselves with a satisfying stroke animation
- **Fast spinner**: In-progress todos show a 0.7-second rotation for responsive visual feedback
- **Shimmer effect**: Labels of in-progress todos shimmer to draw attention

### Entrance Animations

New todos fade up with a 50ms stagger between each item, creating a smooth cascading effect. This applies both on initial render and when todos are dynamically added.

### Progress Celebration

When the progress bar reaches 100%, it triggers a multi-layered celebration:
- Color pulse with brightness increase
- Shimmer sweep across the bar
- Glow effect radiating from the edges

### Accordion Interactions

- Chevron rotates with spring physics (bouncy cubic-bezier easing)
- Content fades up with a slight delay after the accordion opens
- Staggered reveal for description and metadata

### Accessibility

All animations automatically disable when users have `prefers-reduced-motion` enabled in their system preferences, ensuring an accessible experience for everyone.
```

**Verification:** Documentation renders correctly on docs site

---

## Phase 8: Testing & Verification

### Step 8.1: Manual Testing Checklist

**Test in browser with dev server running:**

- [ ] **Pending state**: Shows hollow circle, subtle transition
- [ ] **In-progress state**: Shows fast spinner (0.7s), glow effect, shimmer label
- [ ] **Completed state**: Icon bounces, checkmark draws in
- [ ] **Failed state**: Icon bounces, X draws in with red colors
- [ ] **New todo added**: Fades up smoothly
- [ ] **Multiple new todos**: Stagger 50ms apart
- [ ] **Progress bar at 100%**: Shimmer + glow + pulse all trigger
- [ ] **Accordion open**: Chevron rotates smoothly, content fades in
- [ ] **Accordion close**: Chevron rotates back

### Step 8.2: Motion Preference Testing

**In Chrome DevTools:**
1. Open DevTools
2. Cmd+Shift+P → "Show Rendering"
3. Check "Emulate CSS media feature prefers-reduced-motion: reduce"
4. Verify all animations are disabled

**Verify:**
- [ ] No spring bounce
- [ ] No stroke drawing
- [ ] No spinner animation
- [ ] No shimmer
- [ ] No entrance animations
- [ ] No progress celebration animations
- [ ] State changes still work (instant transitions)

### Step 8.3: Performance Testing

**Test with different todo counts:**

**3 todos:**
- [ ] All animations smooth at 60fps
- [ ] No layout shift
- [ ] Fast entrance stagger

**8 todos:**
- [ ] Still smooth performance
- [ ] Stagger remains synchronized
- [ ] Progress bar celebration smooth

**15 todos:**
- [ ] Performance acceptable
- [ ] No animation stuttering
- [ ] Memory usage reasonable

**Open Chrome DevTools Performance tab:**
- Record 5-second interaction (add todos, change states, open accordions)
- Check for dropped frames or jank
- Verify no memory leaks

### Step 8.4: Cross-Browser Testing

**Chrome/Edge (Chromium):**
- [ ] All animations work correctly
- [ ] Stroke drawing renders properly
- [ ] Cubic-bezier easing looks smooth

**Safari:**
- [ ] Animations function correctly
- [ ] CSS variables work for path lengths
- [ ] Shimmer effect displays properly

**Firefox:**
- [ ] Stroke-dasharray animations work
- [ ] Spring bounce functions
- [ ] No visual glitches

### Step 8.5: Showcase Verification

- [ ] AnimatedPlan appears in homepage showcase
- [ ] Auto-advances through steps with correct timing
- [ ] Todos complete in sequence
- [ ] Progress bar celebrates at 100%
- [ ] No console errors

### Step 8.6: Staging Panel Verification

- [ ] Panel loads at `/staging` page
- [ ] Play button starts animation
- [ ] Reset button restores defaults
- [ ] Complete All triggers celebration
- [ ] Add Todo shows entrance animation
- [ ] Remove Todo works correctly
- [ ] Individual status toggles work for each todo
- [ ] Status buttons highlight active state
- [ ] Animation features list is accurate

---

## Critical Files Reference

**Component Files:**
- `components/tool-ui/plan/plan.tsx` - Main component (will be ~320 lines after changes)
- `components/tool-ui/plan/schema.ts` - Types (unchanged)

**Animation Files:**
- `app/styles/custom-utilities.css` - Keyframes (+5 new animations)

**Documentation:**
- `app/docs/plan/content.mdx` - Component documentation
- `lib/presets/plan.ts` - Preset examples (optional updates)

**Demo/Testing:**
- `app/components/home/chat-showcase.tsx` - Homepage showcase
- `lib/staging/configs/plan.tsx` - New staging config file
- `lib/staging/staging-config.ts` - Staging registration

---

## Success Criteria

### Animations
- [x] Todo icons spring bounce on completion/failure
- [x] Checkmark and X icons stroke-draw with correct path lengths
- [x] Spinner rotates at 0.7s (fast, matches Progress Tracker)
- [x] In-progress labels shimmer
- [x] New todos fade up with 50ms stagger
- [x] Progress bar has shimmer + glow + pulse at 100%
- [x] Chevron rotates with bouncy cubic-bezier
- [x] Accordion content fades in with stagger

### Accessibility
- [x] All animations use `motion-safe:` prefix
- [x] Animations fully disabled with `prefers-reduced-motion`
- [x] Functionality preserved without animations

### Performance
- [x] 60fps with 8 todos (typical use case)
- [x] No stuttering with 15 todos (edge case)
- [x] No memory leaks
- [x] No layout shift

### Documentation
- [x] Showcase includes AnimatedPlan demo
- [x] Staging panel has interactive controls
- [x] Component docs describe animation features
- [x] All presets work correctly

### Cross-browser
- [x] Chrome/Edge: All animations work
- [x] Safari: CSS variables and animations work
- [x] Firefox: Stroke animations work

---

## Implementation Notes

**Key Patterns to Follow:**
1. All animations must use `motion-safe:` prefix
2. Use exact cubic-bezier: `(0.34, 1.56, 0.64, 1)` for consistency
3. CSS variables for dynamic values (path lengths)
4. Stagger delays via inline styles with calculated milliseconds
5. 100ms delay + `backwards` fill-mode for icon stroke animations

**Common Pitfalls to Avoid:**
- Don't forget to remove old inline `<style>` injection
- Update all TodoIcon call sites (two locations)
- Apply entrance animations to both visible and hidden todos
- Use `relative` positioning for progress bar overlays
- Clear animation classes after entrance completes (timeout)

**Testing Priority:**
1. Motion preferences (critical for accessibility)
2. Visual correctness of animations
3. Performance with realistic data
4. Cross-browser compatibility

---

## Post-Implementation Tasks

After completing all phases:

1. **Run linters:**
   ```bash
   pnpm lint:fix
   pnpm typecheck
   ```

2. **Visual regression testing** (if applicable)

3. **Update presets** if needed to showcase new capabilities

4. **Consider adding animation timing constants** to schema.ts for customization

5. **Document any browser-specific quirks** discovered during testing

---

## Estimated Complexity

**High complexity** - Touches many parts of the component:
- Core rendering logic (TodoIcon rewrite)
- State management (entrance tracking, celebration)
- CSS keyframes (5 new animations)
- Documentation and demos
- Extensive testing requirements

Focus on incremental progress, verifying each phase before moving to the next.
