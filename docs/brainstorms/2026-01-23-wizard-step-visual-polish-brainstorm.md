---
date: 2026-01-23
topic: wizard-step-visual-polish
---

# WizardStep Visual Polish

## What We're Building

A comprehensive visual refinement pass on the WizardStep component to match the polish level established by Stats Display and Progress Tracker. This includes entrance animations, selection feedback with spring physics, step transitions, and a segmented progress bar.

## Why This Approach

The WizardStep component is functionally complete but lacks the microinteractions and visual refinements that make recent components feel premium. By applying the same animation patterns (spring easing, staggered entrances, SVG path animations) we establish a consistent feel across the library while raising the quality bar.

## Key Decisions

### 1. Segmented Progress Bar
Add a horizontal segmented progress bar below the step label. Segments fill with animation as the user advances. This provides clearer spatial orientation than "Step X of Y" text alone.

### 2. Selection Indicator Animation (Layered)
Combine multiple effects for rich feedback:
- **Spring bounce** on the indicator container (matches Progress Tracker)
- **Check-draw** SVG path animation for the checkmark
- **Scale pulse** subtle scale-up on selection
- **Fill sweep** color fills from center outward

### 3. Step Transitions (Morph Shared Elements)
In upfront mode, the progress bar and card frame remain stable while content morphs. Options crossfade with slight vertical offset. This grounds the user spatially while content changes.

### 4. Entrance Animations
- Quick cascade stagger (75ms between options)
- Options slide up + fade in with spring easing `cubic-bezier(0.16,1,0.3,1)`
- Header content animates first, then options, then footer buttons

### 5. Hover/Focus States
Replace current `bg-primary/5` hover with border highlight:
- Thin border appears around hovered option
- Glow ring (`box-shadow`) on keyboard focus for accessibility

### 6. Receipt State
Already has `fade-blur-in` - add staggered reveal for summary rows to match the polish.

## Animation Specifications

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Option entrance | fade + slide-up | 400ms | `cubic-bezier(0.16,1,0.3,1)` |
| Option stagger | delay between items | 75ms | - |
| Selection indicator | spring-bounce | 500ms | `cubic-bezier(0.34,1.56,0.64,1)` |
| Check path draw | strokeDashoffset | 400ms | `cubic-bezier(0.34,1.56,0.64,1)` |
| Progress segment fill | width + color | 300ms | `ease-out` |
| Step content morph | opacity + translateY | 250ms | `ease-out` |

## Open Questions

- Should the progress bar have a subtle glow/pulse on the current segment?
- Do we need reduced motion variants for all animations (`motion-safe:` prefix)?

## Next Steps

→ `/workflows:plan` for implementation details
