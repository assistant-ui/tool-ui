# Celestial Effects for Weather Widget

## Overview

Add sun and moon rendering to the weather widget's effect compositor, appearing behind the cloud layer for realistic depth.

## Design Decisions

1. **Layer order**: Celestial renders first (bottommost), clouds composite over naturally
2. **Time source**: Derive `timeOfDay` from existing `updatedAt` timestamp
3. **Visibility**: Sun/moon always render at full intensity; clouds occlude them visually
4. **Position**: Fixed position (upper-center), no orbital movement

## What timeOfDay Controls

- Which celestial body is visible (sun during day, moon at night)
- Sky gradient colors (day → sunset → night transitions)
- Star visibility (fade in at dusk, fade out at dawn)

## What timeOfDay Does NOT Control

- Sun/moon position (fixed at ~0.5, 0.7 in UV space)
- Orbital arc animation (removed)

## File Changes

### New File
- `components/tool-ui/weather-widget/effects/celestial-canvas.tsx`
  - Simplified WebGL canvas (~150 lines)
  - Fixed position sun/moon rendering
  - Props: `timeOfDay`, `moonPhase`, `starDensity`

### Modified Files
- `effects/types.ts` — Add `CelestialConfig` interface
- `effects/parameter-mapper.ts` — Add `getTimeOfDay()` and `configToCelestialProps()`
- `effects/effect-compositor.tsx` — Import and render `CelestialCanvas` as first layer

## Implementation Steps

1. Create `celestial-canvas.tsx` with fixed-position rendering
2. Add `CelestialConfig` type to `types.ts`
3. Add time calculation and mapper to `parameter-mapper.ts`
4. Update `effect-compositor.tsx` to render celestial layer first
5. Test with various timestamps (morning, noon, evening, night)
