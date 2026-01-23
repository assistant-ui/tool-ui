---
title: "feat: WizardStep Visual Polish"
type: feat
date: 2026-01-23
---

# WizardStep Visual Polish

## Overview

Add comprehensive visual refinements to the WizardStep component to match the polish level of Stats Display and Progress Tracker. This includes entrance animations, layered selection feedback with spring physics, step transitions, and a segmented progress bar.

## Problem Statement / Motivation

The WizardStep component is functionally complete but lacks the microinteractions and visual refinements that make recent Tool UI components feel premium. Users notice the quality gap when components are used side-by-side. By applying established animation patterns (spring easing, staggered entrances, SVG path animations), we maintain library consistency while raising the quality bar.

## Proposed Solution

Apply five categories of visual polish:

1. **Segmented Progress Bar** (Upfront mode only)
2. **Layered Selection Animation** (spring bounce + check-draw + scale pulse + fill sweep)
3. **Step Transitions** (morph shared elements in upfront mode)
4. **Entrance Animations** (75ms stagger cascade)
5. **Hover/Focus States** (border highlight + glow ring)

## Technical Approach

### File Changes

All changes are within `components/tool-ui/wizard-step/wizard-step.tsx` plus keyframe additions to `app/styles/custom-utilities.css`.

### Phase 1: Selection Indicator Animation

Enhance `SelectionIndicator` component with layered animations.

**Animation Choreography (concurrent with staggered starts):**
- 0ms: Spring bounce + scale pulse + fill sweep begin
- 100ms: Check-draw begins (multi-select only)
- 500ms: All complete

**Single-select (radio dot):**
- Spring bounce on container (500ms, `cubic-bezier(0.34,1.56,0.64,1)`)
- Scale pulse (0.95 → 1.05 → 1)
- Fill sweep (radial gradient reveal from center)
- No check-draw (dot, not checkmark)

**Multi-select (checkbox):**
- All of the above plus check-draw SVG animation (400ms, 100ms delayed)
- Uses existing `--check-path-length: 24` CSS variable

**Code location:** `SelectionIndicator` function (~lines 27-50)

```tsx
// New animation classes for SelectionIndicator
function SelectionIndicator({ mode, isSelected, disabled }: SelectionIndicatorProps) {
  const shape = mode === "single" ? "rounded-full" : "rounded";

  return (
    <div
      className={cn(
        "flex size-4 shrink-0 items-center justify-center border-2",
        "motion-safe:transition-all motion-safe:duration-200",
        shape,
        isSelected && [
          "border-primary bg-primary text-primary-foreground",
          "motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]",
        ],
        !isSelected && "border-muted-foreground/50",
        disabled && "opacity-50",
      )}
    >
      {mode === "multi" && isSelected && (
        <Check
          className="size-3 [&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]"
          strokeWidth={3}
          style={{ "--check-path-length": "24" } as React.CSSProperties}
        />
      )}
      {mode === "single" && isSelected && (
        <span className="size-2 rounded-full bg-current motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]" />
      )}
    </div>
  );
}
```

### Phase 2: Entrance Animations

Add staggered entrance animations to options with 75ms delay between items.

**Animation:** fade + slide-up (400ms, `cubic-bezier(0.16,1,0.3,1)`)

**Sequence:**
1. Header (step label, title, description) - base delay 0ms
2. Options - base delay 150ms + (index * 75ms) each
3. Footer buttons - base delay 150ms + (optionCount * 75ms) + 100ms

**Code location:** `StepContent` function, wrap option items and pass index for delay calculation

```tsx
// Option entrance animation
<OptionItem
  // ... existing props
  style={{
    animationDelay: `${150 + index * 75}ms`,
  }}
  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-400 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:fill-mode-both"
/>
```

### Phase 3: Segmented Progress Bar

Add horizontal segmented progress bar in **upfront mode only**. Progressive mode continues showing "Step N" text (total steps unknown).

**Visual spec:**
- Horizontal bar below step label
- Segments: equal width, 4px gap between
- Filled segments: `bg-primary`
- Unfilled segments: `bg-muted`
- Current segment: filled (no glow initially)
- Animation: width fill over 300ms ease-out

**Code location:** New `ProgressBar` component, rendered in `StepContent` when `totalSteps` is provided

```tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      className="flex gap-1 h-1.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-full motion-safe:transition-colors motion-safe:duration-300",
            i < current ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
```

### Phase 4: Step Transitions (Upfront Mode)

Implement "morph shared elements" pattern: progress bar and card frame remain stable, content crossfades.

**Stable elements:** Card border, progress bar, Back/Next button container
**Morphing elements:** Title, description, option list (crossfade with slight vertical offset)

**Animation:** 250ms ease-out opacity + translateY

**Implementation approach:**
- Track `prevStepIndex` with useRef
- Detect direction (forward/back) for animation direction
- Use CSS animation classes triggered by step change
- Key the content container by step ID to trigger remount animation

```tsx
// Step content transition wrapper
<div
  key={currentStep.id}
  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-250 motion-safe:ease-out"
>
  {/* Title, description, options */}
</div>
```

**Button disable during transition:** Disable Back/Next buttons for 250ms during transition to prevent rapid navigation state issues.

### Phase 5: Hover/Focus States

Replace `bg-primary/5` hover with border highlight.

**Hover:** Thin border appears around option row
**Focus:** Glow ring (box-shadow) for keyboard accessibility

```tsx
// OptionItem hover/focus classes
<Button
  className={cn(
    // ... existing classes
    // Replace: "bg-primary/5 ... group-hover:opacity-100"
    // With:
    "hover:ring-1 hover:ring-border hover:ring-inset",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  )}
>
```

### Phase 6: Receipt State Enhancement

Add staggered reveal to summary rows (matching option stagger).

**Animation:** fade-up (existing keyframe), 75ms stagger

```tsx
// Receipt summary row stagger
{choice.summary.map((item, index) => (
  <div
    key={index}
    className="flex justify-between text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 motion-safe:fill-mode-both"
    style={{ animationDelay: `${index * 75}ms` }}
  >
    {/* ... */}
  </div>
))}
```

## Acceptance Criteria

### Functional Requirements

- [x] Selection indicators animate with spring bounce when selected/deselected
- [x] Multi-select checkmarks draw with stroke animation
- [x] Options cascade in with 75ms stagger on initial render
- [x] Upfront mode shows segmented progress bar that fills as user advances
- [x] Step transitions in upfront mode crossfade content while card frame remains stable
- [x] Options show border highlight on hover
- [x] Options show glow ring on keyboard focus
- [x] Receipt summary rows stagger in with 75ms delay

### Non-Functional Requirements

- [x] All animations use `motion-safe:` prefix for accessibility
- [x] Animations respect `prefers-reduced-motion: reduce` (instant state changes)
- [x] No animation blocks user interaction (decorative only)
- [x] Button disable during 250ms step transition prevents state bugs

### Quality Gates

- [x] TypeScript compiles without errors (`pnpm typecheck`)
- [x] ESLint passes (`pnpm lint:fix`)
- [ ] Visual inspection in browser matches spec (requires manual verification)
- [ ] Test with DevTools "Emulate CSS media feature" → `prefers-reduced-motion: reduce`

## Edge Cases Addressed

| Scenario | Behavior |
|----------|----------|
| Rapid option toggling | Animations layer naturally, no blocking |
| Interaction during entrance | Allowed - selection animation plays immediately |
| Back/Next during transition | Buttons disabled for 250ms transition duration |
| Progressive mode (no total steps) | No segmented progress bar, keeps "Step N" text |
| Disabled options | Participate in entrance stagger with muted opacity |
| Single-select indicator | Spring bounce + scale, no check-draw (uses dot) |
| Multi-select indicator | Full layered animation including check-draw |

## Dependencies & Prerequisites

- Existing keyframes in `custom-utilities.css`: `spring-bounce`, `check-draw`, `fade-blur-in`
- Tailwind `animate-in` utilities from `tw-animate-css`
- `motion-safe:` Tailwind variant (built-in)

No new dependencies required.

## Implementation Order

1. **Phase 1: Selection Indicator** - Core interaction feedback
2. **Phase 5: Hover/Focus** - Quick win, improves interaction before animations
3. **Phase 2: Entrance Animations** - Visual polish on initial render
4. **Phase 3: Progress Bar** - New UI element (upfront mode only)
5. **Phase 4: Step Transitions** - Most complex, depends on progress bar
6. **Phase 6: Receipt State** - Final polish

## Testing Checklist

- [ ] Progressive mode: entrance animations, selection feedback, no progress bar
- [ ] Upfront mode: all features including progress bar and step transitions
- [ ] Multi-select step: check-draw animation fires
- [ ] Single-select step: dot animation (no check-draw)
- [ ] Keyboard navigation: focus ring visible and accessible
- [ ] Reduced motion: all animations disabled, instant state changes
- [ ] Receipt state: summary rows stagger correctly
- [ ] Rapid interactions: no animation state bugs

## References

### Internal

- Brainstorm: `docs/brainstorms/2026-01-23-wizard-step-visual-polish-brainstorm.md`
- Animation keyframes: `app/styles/custom-utilities.css:1-154`
- Progress Tracker reference: `components/tool-ui/progress-tracker/progress-tracker.tsx`
- Stats Display reference: `components/tool-ui/stats-display/stats-display.tsx`

### Animation Specifications

| Element | Animation | Duration | Easing | Delay |
|---------|-----------|----------|--------|-------|
| Selection indicator | spring-bounce | 500ms | `cubic-bezier(0.34,1.56,0.64,1)` | 0ms |
| Check-draw (multi) | stroke-dashoffset | 400ms | `cubic-bezier(0.34,1.56,0.64,1)` | 100ms |
| Option entrance | fade + slide-up | 400ms | `cubic-bezier(0.16,1,0.3,1)` | 150ms + (index × 75ms) |
| Progress segment | bg-color | 300ms | ease-out | 0ms |
| Step content morph | fade + translateY | 250ms | ease-out | 0ms |
| Receipt row stagger | fade-up | 300ms | ease-out | index × 75ms |
