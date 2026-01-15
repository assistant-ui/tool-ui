# Plan Component Animation Polish

**Created:** 2026-01-15
**Status:** Ready for implementation
**Reference:** Progress Tracker animations (commit c1aff1b)

## Goal

Bring the same level of animation polish from the Progress Tracker component to the Plan component, creating a cohesive motion language across Tool UI while respecting the Plan component's unique accordion-based structure.

## Context

The Progress Tracker recently received comprehensive animation polish including:
- Spring bounce effects with cubic-bezier timing (0.34, 1.56, 0.64, 1)
- Stroke-drawing animations for checkmark and X icons
- Inverse shimmer effect on in-progress labels
- Fast spinner rotation (0.7s vs Plan's current 8s)
- Smooth 300ms state transitions
- Glow effects on active states

The Plan component currently has minimal animations:
- Slow 8s spinner for in-progress todos
- Basic 500ms progress bar transition
- Default Radix accordion animations
- No state-change celebrations or entrance effects

## Design Decisions

### Animation Personality
**Decision:** Match Progress Tracker's energy level exactly
- Use the same bouncy cubic-bezier (0.34, 1.56, 0.64, 1) for playful overshoot
- Fast 0.7s spinner rotation
- Bold shimmer effects
- Keep playful, energetic personality consistent across components

**Rationale:** Consistency across the library creates a cohesive brand. Users expect Tool UI components to feel similar.

### Scope
**Decision:** Full motion design pass covering:
1. Todo icon state animations (pending → in-progress → completed/failed)
2. Progress bar completion celebration
3. Accordion expand/collapse enhancements
4. Entrance animations for new todos

**Rationale:** Comprehensive polish creates a premium feel. Half-measures would create inconsistency with Progress Tracker.

### Entrance Animation Behavior
**Decision:** Animate on initial render AND when dynamically added, but skip re-animations on updates
- Initial render: Stagger fade-up effect (~50ms between items)
- New todo added: Single entrance animation for the new item only
- Updates to existing todos: No entrance re-animation, only state change animations

**Rationale:** Purposeful animations without being repetitive or annoying.

### Progress Bar Completion
**Decision:** Multi-layered celebration effect at 100%
- Shimmer sweep across the bar
- Brief glow effect (shadow-based)
- Color pulse/intensification of the emerald color
- All effects combined for a satisfying moment

**Rationale:** The 100% moment is a key milestone worth celebrating. Progress Tracker doesn't have an overall completion state, so this is Plan's unique opportunity to shine.

### Accordion Interactions
**Decision:** Staggered content reveal
- Accordion opens with enhanced spring physics on height animation
- Content (description/metadata) fades up with slight stagger after accordion opens
- Chevron rotation uses the same cubic-bezier personality

**Rationale:** Adds polish without overwhelming the interaction. Full spring physics on accordion can cause layout thrashing with many items; staggered content is more performant.

### Performance
**Decision:** Optimize for polish, assume 5-10 todos typical use case
- No animation capping for large lists
- No virtualization needed
- BUT: Strictly respect `prefers-reduced-motion` - all animations must be fully disabled when user prefers reduced motion

**Rationale:** Tool UI is a premium component library. Polish is the priority. Accessibility is non-negotiable.

### Demo Updates
**Decision:** Update both showcase and staging
- Homepage showcase: Animated demo cycling through todo states
- Staging panel: Interactive controls for testing all animation states

**Rationale:** Comprehensive demos help users understand and appreciate the animation work.

## Implementation Plan

### Phase 1: Core Animation Infrastructure

#### 1.1 Add Keyframe Definitions
**File:** `app/styles/custom-utilities.css`

Add the same keyframes used by Progress Tracker:
- `spring-bounce` - For completed/failed state icons
- `check-draw` - For checkmark stroke animation
- Consider adding `shimmer-sweep` for progress bar celebration

**Notes:**
- These already exist from Progress Tracker work
- May need additional keyframes for progress bar effects

#### 1.2 Update TodoIcon Component
**File:** `components/tool-ui/plan/plan.tsx` (TodoIcon function, lines 70-90)

Transform icon rendering to match Progress Tracker's StepIndicator:

**Pending state:**
```tsx
<Circle className="size-4 text-muted-foreground motion-safe:transition-all motion-safe:duration-200" />
```

**In-Progress state:**
```tsx
<div className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] motion-safe:transition-all motion-safe:duration-300">
  <Loader2 className="size-3 text-primary motion-safe:animate-[spin_0.7s_linear_infinite]" />
</div>
```
- Add glow effect (shadow)
- Speed up spinner from 8s → 0.7s
- Maintain size consistency

**Completed state:**
```tsx
<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary border border-primary shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]">
  <Check
    className="size-3 text-primary-foreground [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
    style={{ ["--check-path-length" as string]: "24" }}
  />
</div>
```
- Spring bounce on container
- Stroke-drawing animation on checkmark (100ms delay)
- Custom CSS variable for path length

**Failed state:**
```tsx
<div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive dark:bg-red-700 border border-destructive dark:border-red-700 shadow-sm motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]">
  <X
    className="size-3 text-white [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
    style={{ ["--check-path-length" as string]: "16" }}
  />
</div>
```
- Same bounce as completed but destructive colors
- X icon with drawing animation

**Remove:** The inline SPIN_KEYFRAMES and <style> injection (lines 34-39, 68-69)

#### 1.3 Add Shimmer to In-Progress Labels
**File:** `components/tool-ui/plan/plan.tsx` (TodoItem component)

Add shimmer effect to todo content when status is "in_progress":
```tsx
<span className={cn(
  "flex-1 font-medium",
  todo.status === "in_progress" && "motion-safe:shimmer shimmer-invert text-foreground"
)}>
  {todo.content}
</span>
```

### Phase 2: Entrance Animations

#### 2.1 Implement Staggered Entrance
**File:** `components/tool-ui/plan/plan.tsx`

Strategy:
- Track which todo IDs have been seen before (useRef with Set)
- On render, determine which todos are new
- Apply entrance animation class to new todos only
- Use CSS animation with stagger delay based on index

Add state management:
```tsx
const seenTodoIds = useRef(new Set<string>());
const [newTodoIds, setNewTodoIds] = useState<Set<string>>(new Set());

useEffect(() => {
  const newIds = new Set<string>();
  todos.forEach((todo) => {
    if (!seenTodoIds.current.has(todo.id)) {
      newIds.add(todo.id);
      seenTodoIds.current.add(todo.id);
    }
  });
  setNewTodoIds(newIds);

  // Clear new IDs after animation completes
  if (newIds.size > 0) {
    const timer = setTimeout(() => setNewTodoIds(new Set()), 500);
    return () => clearTimeout(timer);
  }
}, [todos]);
```

Add entrance animation class to AccordionItem:
```tsx
<AccordionItem
  className={cn(
    newTodoIds.has(todo.id) && "motion-safe:animate-[fade-up_300ms_ease-out]"
  )}
  style={newTodoIds.has(todo.id) ? {
    animationDelay: `${Array.from(newTodoIds).indexOf(todo.id) * 50}ms`
  } : undefined}
  // ...
>
```

Add keyframe to custom-utilities.css:
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
```

### Phase 3: Progress Bar Celebration

#### 3.1 Implement Multi-Layered Completion Effect
**File:** `components/tool-ui/plan/plan.tsx` (ProgressBar component, lines 161-173)

Add celebration state management:
```tsx
const [isCelebrating, setIsCelebrating] = useState(false);
const prevProgress = useRef(progress);

useEffect(() => {
  if (progress === 100 && prevProgress.current < 100) {
    setIsCelebrating(true);
    const timer = setTimeout(() => setIsCelebrating(false), 1000);
    return () => clearTimeout(timer);
  }
  prevProgress.current = progress;
}, [progress]);
```

Update progress bar rendering:
```tsx
<div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
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
      <div className="absolute inset-0 motion-safe:animate-[shimmer-sweep_800ms_ease-out]" />
    )}
  </div>
  {isCelebrating && (
    <div className="absolute inset-0 rounded-full motion-safe:animate-[glow-pulse_600ms_ease-out]"
         style={{ boxShadow: "0 0 20px hsl(var(--emerald-500))" }} />
  )}
</div>
```

Add keyframes to custom-utilities.css:
```css
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  }
  100% {
    transform: translateX(100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
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
```

### Phase 4: Accordion Enhancements

#### 4.1 Staggered Content Reveal
**File:** `components/tool-ui/plan/plan.tsx` (TodoItem component)

Update AccordionContent rendering:
```tsx
<AccordionContent className="pb-3 pt-1 text-sm text-muted-foreground">
  <div className="motion-safe:animate-[fade-in-stagger_200ms_ease-out_100ms_backwards]">
    {todo.description && <p className="mb-2">{todo.description}</p>}
    {(startTime || elapsedMs !== undefined) && (
      <div className="flex flex-col gap-1 text-xs motion-safe:animate-[fade-in-stagger_200ms_ease-out_150ms_backwards]">
        {/* timestamps */}
      </div>
    )}
  </div>
</AccordionContent>
```

Add keyframe:
```css
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

Update chevron rotation to use bounce easing:
```tsx
<ChevronRight className="size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] group-data-[state=open]/todo:rotate-90" />
```

### Phase 5: Showcase & Staging Updates

#### 5.1 Create Animated Plan Showcase
**File:** `app/components/home/chat-showcase.tsx`

Add AnimatedPlan component similar to AnimatedProgressTracker (lines 264-299):

```tsx
function AnimatedPlan() {
  const [todos, setTodos] = useState<SerializablePlanTodo[]>([
    { id: "1", status: "completed", content: "Initialize project structure" },
    { id: "2", status: "in_progress", content: "Set up authentication" },
    { id: "3", status: "pending", content: "Implement user dashboard" },
    { id: "4", status: "pending", content: "Add payment integration" },
  ]);

  useEffect(() => {
    let currentIndex = 1;
    const interval = setInterval(() => {
      setTodos((prev) => {
        if (currentIndex >= prev.length) {
          clearInterval(interval);
          return prev;
        }

        const updated = [...prev];
        if (currentIndex > 0) {
          updated[currentIndex - 1] = { ...updated[currentIndex - 1], status: "completed" };
        }
        updated[currentIndex] = { ...updated[currentIndex], status: "in_progress" };
        currentIndex++;
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Plan
      id="animated-plan-showcase"
      title="Feature Implementation"
      description="Building the next milestone"
      todos={todos}
    />
  );
}
```

Add to showcase rotation in the chat interface.

#### 5.2 Enhance Staging Panel
**File:** `lib/staging/configs/plan.tsx`

Add interactive controls similar to Progress Tracker staging (reference: `lib/staging/configs/progress-tracker.tsx`, 189 lines):

Features to add:
- Play/Pause animation controls
- Individual state toggles per todo (pending/in_progress/completed/failed)
- "Add Todo" button to test entrance animations
- "Remove Todo" button
- "Complete All" button to trigger celebration effect
- Reset button

Structure:
```tsx
export const planStagingConfig: StagingConfig = {
  presets: planPresets,
  defaultPreset: "implementation-plan",
  renderControls: ({ data, onDataChange }) => {
    // State management for animation control
    // Interactive buttons for each todo
    // Play/pause for auto-progression
    // Add/remove todo controls
  },
  features: [
    // Document animation features
  ],
};
```

### Phase 6: Testing & Polish

#### 6.1 Motion Preference Testing
Verify all animations are properly disabled with `prefers-reduced-motion: reduce`:
```bash
# Test in browser DevTools
# Rendering > Emulate CSS media feature prefers-reduced-motion: reduce
```

All animations should:
- Be prefixed with `motion-safe:`
- Gracefully degrade to instant state changes
- Maintain functionality without visual motion

#### 6.2 Performance Testing
Test with various todo counts:
- 3 todos (minimal)
- 8 todos (typical)
- 15 todos (edge case)
- 25 todos (stress test)

Monitor:
- Frame rate during animations
- Layout shift
- Memory usage
- Animation stutter

#### 6.3 Cross-Browser Testing
Verify animations work correctly in:
- Chrome/Edge (Chromium)
- Safari (WebKit)
- Firefox

Known issues to watch for:
- Safari sometimes needs `-webkit-` prefixes for custom properties
- Firefox stroke-dasharray/offset behavior
- Backdrop-filter support

### Phase 7: Documentation Updates

#### 7.1 Update Component Documentation
**File:** `app/docs/plan/content.mdx`

Add section documenting animation features:
```markdown
## Animations

The Plan component includes polished animations that respect user motion preferences:

- **State transitions**: Spring bounce effects when todos complete or fail
- **Icon animations**: Stroke-drawing for checkmarks and X icons
- **Progress celebration**: Multi-layered effect when reaching 100%
- **Entrance animations**: Staggered fade-up for new todos
- **Shimmer effects**: Visual feedback for in-progress todos

All animations automatically disable when users have `prefers-reduced-motion` enabled.
```

#### 7.2 Update Preset Examples
**File:** `lib/presets/plan.ts`

Ensure presets showcase animation capabilities:
- Add preset that demonstrates dynamic todo addition
- Add preset showing completion celebration
- Update `generateExampleCode` if needed

## Success Criteria

- [ ] Todo icons animate with spring bounce on completion/failure
- [ ] Checkmark and X icons have stroke-drawing animation
- [ ] Spinner rotates at 0.7s (matches Progress Tracker)
- [ ] In-progress todo labels have shimmer effect
- [ ] New todos fade up with 50ms stagger on initial render
- [ ] Dynamically added todos get entrance animation
- [ ] Progress bar has shimmer + glow + pulse at 100%
- [ ] Accordion content reveals with stagger on expand
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Showcase includes animated demo
- [ ] Staging panel has interactive controls
- [ ] Documentation updated with animation features
- [ ] No performance regressions with 15+ todos
- [ ] Cross-browser compatibility verified

## Open Questions

None - all decisions finalized through interview process.

## References

- Progress Tracker implementation: `components/tool-ui/progress-tracker/progress-tracker.tsx`
- Animation keyframes: `app/styles/custom-utilities.css`
- Progress Tracker commit: c1aff1b
- Staging reference: `lib/staging/configs/progress-tracker.tsx`

## Timeline Considerations

This is a significant enhancement touching multiple files and requiring thorough testing. No specific timeline - focus on quality and polish over speed.
