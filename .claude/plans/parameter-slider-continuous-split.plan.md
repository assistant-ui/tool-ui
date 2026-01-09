# Parameter Slider: Continuous Split Handle

## Problem

The current handle split behavior is binary—when the handle overlaps text, it jumps from 60% height to 32% height. This feels abrupt. We want a refined, continuous separation effect where the handle smoothly splits apart to avoid touching the text.

## Approach

Replace the binary `hitsLabel`/`hitsValue` state with continuous distance calculations. The handle becomes a single continuous bar that splits into two parts (top/bottom) as it approaches text elements, with the gap size varying based on proximity.

### Geometry Model

Each text element (label and value) has an invisible **rounded rectangle boundary**:

```
┌──────────────────────────┐
│    ╭──────────────╮      │  ← Outer detection zone (16px outside)
│    │   ╭──────╮   │      │  ← Rounded rect boundary (text + padding)
│    │   │ Text │   │      │  ← Actual text element
│    │   ╰──────╯   │      │
│    ╰──────────────╯      │
└──────────────────────────┘
```

**Rounded rectangle properties:**
- Width = text element width + horizontal padding
- Height = text element height + vertical padding
- Corner radius = ½ text element height (semicircular corners)

**Detection zone:**
- Starts 16px outside the rounded rectangle boundary
- This is where the handle first begins to split

### Gap Calculation

1. **Determine handle's x-position** relative to each text element's boundary
2. **Calculate signed distance** from handle center to the rounded rectangle boundary
   - Positive = outside boundary
   - Zero = on boundary
   - Negative = inside boundary
3. **Map distance to gap size** using ease-out interpolation:
   - At 16px outside boundary: gap = 0 (handle is one continuous bar)
   - At boundary edge: gap begins opening
   - At center of text: gap = text height + padding (maximum)
4. **When near both text elements:** use whichever requires the larger gap

### Ease-Out Curve

The gap opens quickly when entering the zone, then the rate slows:

```
gap = maxGap * easeOut(1 - (distance / detectionRadius))

where easeOut(t) = 1 - (1 - t)^2  // quadratic ease-out
```

This feels responsive—the handle reacts immediately when approaching text.

### Visual Result

- Handle is a single vertical bar when far from text
- As it approaches text, it splits into top and bottom parts
- The two parts arc around the text's rounded rectangle boundary
- Gap is largest when handle is centered on text
- Smooth, continuous transition throughout

## Implementation Steps

### Step 1: Replace boolean state with distance calculations

Replace:
```tsx
const [hitsLabel, setHitsLabel] = useState(false);
const [hitsValue, setHitsValue] = useState(false);
```

With:
```tsx
const [labelGap, setLabelGap] = useState(0);
const [valueGap, setValueGap] = useState(0);
```

### Step 2: Create distance-to-gap calculation function

```tsx
function calculateGap(
  thumbCenterX: number,
  thumbCenterY: number,
  textRect: { left: number; right: number; top: number; bottom: number },
  textHeight: number,
  padding: number,
  detectionRadius: number, // 16px
): number {
  // Build rounded rectangle boundary
  const boundaryLeft = textRect.left - padding;
  const boundaryRight = textRect.right + padding;
  const boundaryTop = textRect.top - padding;
  const boundaryBottom = textRect.bottom + padding;
  const cornerRadius = textHeight / 2;

  // Calculate signed distance to rounded rectangle
  const distanceToRoundedRect = signedDistanceToRoundedRect(
    thumbCenterX,
    thumbCenterY,
    boundaryLeft,
    boundaryRight,
    boundaryTop,
    boundaryBottom,
    cornerRadius,
  );

  // If outside detection zone, no gap
  if (distanceToRoundedRect > detectionRadius) return 0;

  // Calculate gap with ease-out
  const maxGap = textHeight + padding * 2;
  const t = 1 - Math.max(0, distanceToRoundedRect) / detectionRadius;
  const eased = 1 - Math.pow(1 - t, 2); // quadratic ease-out

  return maxGap * eased;
}
```

### Step 3: Implement signed distance to rounded rectangle

```tsx
function signedDistanceToRoundedRect(
  px: number,
  py: number,
  left: number,
  right: number,
  top: number,
  bottom: number,
  radius: number,
): number {
  // Clamp to inner rectangle (excluding corner regions)
  const innerLeft = left + radius;
  const innerRight = right - radius;
  const innerTop = top + radius;
  const innerBottom = bottom - radius;

  // Determine which region the point is in
  const inCorner = (px < innerLeft || px > innerRight) &&
                   (py < innerTop || py > innerBottom);

  if (inCorner) {
    // Distance to nearest corner circle
    const cornerX = px < innerLeft ? innerLeft : innerRight;
    const cornerY = py < innerTop ? innerTop : innerBottom;
    const distToCornerCenter = Math.hypot(px - cornerX, py - cornerY);
    return distToCornerCenter - radius;
  } else {
    // Distance to nearest edge
    const dx = Math.max(left - px, px - right, 0);
    const dy = Math.max(top - py, py - bottom, 0);

    if (dx === 0 && dy === 0) {
      // Inside the rectangle
      return -Math.min(px - left, right - px, py - top, bottom - py);
    }

    return Math.max(dx, dy);
  }
}
```

### Step 4: Update useLayoutEffect to calculate gaps

Replace the current hit detection with gap calculations for both label and value elements.

### Step 5: Update handle rendering

Replace the binary height classes:
```tsx
hitsLabel || hitsValue
  ? "before:h-[32%] after:h-[32%]"
  : "before:h-[60%] after:h-[60%]"
```

With inline styles that use the calculated gap:
```tsx
const effectiveGap = Math.max(labelGap, valueGap);
const handleHeight = trackHeight; // e.g., 48px
const partHeight = (handleHeight - effectiveGap) / 2;

// Apply via style prop on before/after or restructure to use actual elements
```

### Step 6: Consider restructuring handle from pseudo-elements to real elements

The current `before:`/`after:` pseudo-elements may be limiting for dynamic height calculations. Consider:
- Two actual `<span>` elements for top and bottom parts
- Easier to apply dynamic `height` via style prop
- Maintains same visual appearance

## Resolved Decisions

1. **Padding value:** 6px around text elements
2. **Animation:** 150ms CSS transition (matches existing handle transitions)
3. **Handle structure:** Switch to real `<span>` elements for top/bottom parts (easier dynamic height styling)

## Success Criteria

- Handle appears as one continuous bar when far from text
- Handle smoothly splits when approaching either text element
- Gap follows the rounded rectangle contour (feels like it's avoiding an invisible pill shape)
- No jarring jumps or discontinuities
- Performance is acceptable (calculations run in useLayoutEffect on value change)
