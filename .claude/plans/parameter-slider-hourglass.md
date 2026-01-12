# Parameter Slider: Hourglass Handle Effect

## Goal

Transform the parameter-slider handle from two separating segments into a single continuous hourglass shape that morphs from a pill at rest to a dramatic pinched hourglass when active.

## Current Implementation

The handle currently uses two separate `<span>` elements:
- **Top segment**: Positioned at top, 50% height, rounds top corners
- **Bottom segment**: Positioned at bottom, 50% height, rounds bottom corners
- **Separation**: Segments translate apart vertically when near text labels
- **Width states**: 1px (rest) → 1.5px (hover) → 2px (drag)

Location: `components/tool-ui/parameter-slider/parameter-slider.tsx` lines 489-564

## Target Design

### Visual
- **Single continuous shape** with text overlaid at center
- **Pill at rest**: Simple rounded rectangle (similar to current collapsed state)
- **Hourglass when active**: Dramatic organic curves tapering to a hairline waist
- **Waist width**: 0.5-1px (maximum contrast with segment ends)
- **Curve style**: Smooth organic bezier-like curves (not linear/geometric)

### Behavior
- **Rest → Active**: Shape morphs from pill to hourglass on hover/drag
- **Animation**: Butter-smooth transitions using matched polygon points
- **Text**: Overlays the center of the shape (no gap needed)

## Technical Approach

### 1. Replace Two Segments with Single Element

Remove the two-span structure. Use a single element with `clip-path` to define the shape.

```tsx
// Before: Two spans
<span className="...top segment..." />
<span className="...bottom segment..." />

// After: Single clipped element
<span
  className="..."
  style={{ clipPath: isActive ? hourglassPath : pillPath }}
/>
```

### 2. Define Clip-Path States

Use `clip-path: polygon()` with matched point counts for smooth transitions.

**Pill state (rest):**
```
A simple rounded rectangle approximated with polygon points
```

**Hourglass state (active):**
```
Same number of points, but middle points pulled inward to create waist
```

### 3. Point Matching Strategy

For smooth CSS transitions, both states need identical point counts. Approximate the curves with 8-12 points per side:

```
Top cap: 3-4 points (rounded top)
Left edge: 4-6 points (curves in then out)
Bottom cap: 3-4 points (rounded bottom)
Right edge: 4-6 points (mirrors left)
```

The pill state uses the same points but positioned to form a rectangle with rounded ends.

### 4. Dynamic Sizing

The clip-path percentages should work with the element's natural dimensions:
- Width controlled by Tailwind classes (w-2, w-1.5, w-px)
- Height remains 100% of thumb
- Clip-path uses percentage values to scale with size

### 5. Animation

```css
transition: clip-path 100ms ease-in-out, width 100ms ease-in-out;
```

## Implementation Steps

1. **Prototype the clip-paths**
   - Create pill polygon with ~16-20 points
   - Create hourglass polygon with same point count
   - Test transitions in isolation

2. **Refactor handle rendering**
   - Replace two-segment logic with single-element approach
   - Wire up clip-path based on `isActive` state
   - Maintain existing width/opacity transitions

3. **Handle edge cases**
   - Terminal positions (0%/100%) with reflection gradient
   - Text positioning (now overlays instead of fitting in gap)
   - Touch targets and accessibility

4. **Polish**
   - Fine-tune curve aesthetics
   - Adjust timing functions
   - Test across themes

## Design Decisions

- **Waist position**: Shifts vertically using the same `TEXT_VERTICAL_OFFSET` logic as current segments — the pinch tracks where the segment boundaries would be
- **Text treatment**: No backdrop — text overlays directly
- **Pinch intensity**: Fixed shape when active, no variation with drag intensity

## Risks

- **Browser support**: `clip-path: polygon()` transitions are well-supported in modern browsers, but worth testing
- **Performance**: Animating clip-path is GPU-accelerated but more expensive than simple transforms
- **Complexity**: Single shape is conceptually simpler but clip-path math can be fiddly

## References

- Current implementation: `parameter-slider.tsx` lines 489-564
- CSS clip-path polygon syntax: `polygon(x1 y1, x2 y2, ...)`
- Transition support: Modern browsers support `transition: clip-path`
