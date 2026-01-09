# Video Staging Page

A minimal staging environment for recording Tool UI component demos for social media.

## Problem

When creating video content showcasing Tool UI components, there's no dedicated environment optimized for recording. The docs preview system has too much chrome (sidebars, tabs, code panels), and there's no way to visualize internal component behaviors like hitboxes, detection zones, or state transitions.

## Goals

- Clean, minimal staging environment for screen recording
- Thin top toolbar with essential controls (crops easily or blends in)
- Debug visualization system for exposing internal component mechanics
- Simulated chat context so components appear in realistic setting
- General-purpose infrastructure that any component can hook into

## Non-Goals (for now)

- Built-in recording (use external screen capture)
- Annotation/callout system (handle in post-production)
- Multiple components on screen simultaneously

---

## Architecture

### Route Structure

```
/staging
  └── page.tsx          # Main staging page
  └── layout.tsx        # Minimal layout (no site header/footer)
```

Single page with component selection via query param: `/staging?component=parameter-slider&preset=photo-adjustments`

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Component ▾] │ ● preset1  ● preset2  ● preset3 │ ⚙ toggles │  ← Toolbar (thin, ~40px)
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────────┐                      │
│                    │  User message   │                      │  ← Chat context
│                    └─────────────────┘                      │
│                                                             │
│     ┌───────────────────────────────────────────────┐       │
│     │                                               │       │
│     │              Component + Overlays             │       │  ← Main canvas
│     │                                               │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
app/staging/
  ├── page.tsx                    # Main page component
  ├── layout.tsx                  # Minimal layout wrapper
  └── _components/
      ├── staging-toolbar.tsx     # Top toolbar container
      ├── component-selector.tsx  # Dropdown to pick component
      ├── preset-pills.tsx        # Horizontal preset selector
      ├── toggle-popover.tsx      # Settings popover for toggles
      ├── staging-canvas.tsx      # Chat context + component area
      └── debug-overlay.tsx       # Renders component-specific overlays

lib/staging/
  ├── types.ts                    # Staging config types
  ├── staging-config.ts           # Per-component staging configurations
  └── use-staging-state.ts        # Zustand store for staging state
```

---

## Toolbar Design

A single horizontal bar at the top, approximately 40-48px tall.

### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Parameter Slider ▾]  │  ● photo  ● color  ● audio  ● single  │  [⚙]  │
└────────────────────────────────────────────────────────────────────────┘
     Component            Preset pills (scrollable if many)       Settings
```

### Components

**Component Selector** (`component-selector.tsx`)
- Dropdown listing all Tool UI components
- Shows current selection
- Changing component resets preset to default and clears debug state

**Preset Pills** (`preset-pills.tsx`)
- Horizontal row of pills/chips
- Active preset highlighted
- Keyboard: number keys 1-9 select presets
- Scrollable container if presets exceed width

**Settings Popover** (`toggle-popover.tsx`)
- Gear icon opens a popover with toggle groups
- Sections:
  - **Debug Level**: off / boundaries / margins / full (radio group)
  - **State Overrides**: loading (checkbox)
  - **Theme**: light / dark / system (respects site theme toggle pattern)

---

## Debug Overlay System

Components opt-in to debug visualizations by defining a staging config.

### Type Definitions (`lib/staging/types.ts`)

```typescript
type DebugLevel = "off" | "boundaries" | "margins" | "full";

interface StagingConfig<TProps = unknown> {
  // Which debug levels this component supports
  supportedDebugLevels: DebugLevel[];

  // Render debug overlays for the component
  // Returns a React node that renders absolutely positioned overlays
  // Overlay reads element positions directly from DOM via componentRef
  renderDebugOverlay?: (props: {
    level: DebugLevel;
    componentRef: RefObject<HTMLElement>;
    componentProps: TProps;
  }) => ReactNode;
}
```

### Staging Config Registry (`lib/staging/staging-config.ts`)

```typescript
import { parameterSliderStagingConfig } from "./configs/parameter-slider";

export const stagingConfigs: Partial<Record<ComponentId, StagingConfig>> = {
  "parameter-slider": parameterSliderStagingConfig,
  // Other components added as needed
};

export function getStagingConfig(componentId: ComponentId): StagingConfig | null {
  return stagingConfigs[componentId] ?? null;
}
```

### How Overlays Render

```tsx
// In staging-canvas.tsx
function StagingCanvas({ componentId, preset, debugLevel }: Props) {
  const componentRef = useRef<HTMLElement>(null);

  const stagingConfig = getStagingConfig(componentId);
  const previewConfig = getPreviewConfig(componentId);

  return (
    <div className="relative">
      {/* Chat context wrapper */}
      <ChatContextWrapper userMessage={previewConfig.chatContext?.userMessage}>
        {/* Actual component */}
        <div ref={componentRef}>
          {previewConfig.renderComponent({
            data: previewConfig.presets[preset].data,
            presetName: preset,
          })}
        </div>
      </ChatContextWrapper>

      {/* Debug overlay layer */}
      {stagingConfig?.renderDebugOverlay && debugLevel !== "off" && (
        <div className="absolute inset-0 pointer-events-none">
          {stagingConfig.renderDebugOverlay({
            level: debugLevel,
            componentRef,
            componentProps: previewConfig.presets[preset].data,
          })}
        </div>
      )}
    </div>
  );
}
```

---

## Parameter Slider Debug Overlays

### Visualization Levels

**Level: boundaries**
- Show rounded rectangle boundaries around label and value text
- Dashed border, semi-transparent fill
- Color-coded: label = blue, value = green

**Level: margins**
- Everything from `boundaries` plus:
- Outer detection zone (16px margin) shown as second concentric rounded rect
- Lighter/more transparent than inner boundary

**Level: full**
- Everything from `margins` plus:
- Real-time distance value displayed near handle
- Current gap size shown
- Easing curve visualization (small graph or numeric values)

### Implementation (`lib/staging/configs/parameter-slider.tsx`)

```typescript
export const parameterSliderStagingConfig: StagingConfig<ParameterSliderProps> = {
  supportedDebugLevels: ["off", "boundaries", "margins", "full"],

  renderDebugOverlay: ({ level, componentRef }) => {
    // Query DOM for all slider rows and their elements
    const sliderElements = getSliderElements(componentRef);

    return (
      <>
        {sliderElements.map((row, index) => (
          <Fragment key={index}>
            {/* Label boundary */}
            {row.label && (
              <RoundedRectOverlay
                rect={row.label}
                padding={6}
                cornerRadius={row.label.height / 2}
                color="blue"
                showMargin={level === "margins" || level === "full"}
                marginSize={16}
              />
            )}

            {/* Value boundary */}
            {row.value && (
              <RoundedRectOverlay
                rect={row.value}
                padding={6}
                cornerRadius={row.value.height / 2}
                color="green"
                showMargin={level === "margins" || level === "full"}
                marginSize={16}
              />
            )}

            {level === "full" && row.thumb && (
              <ThumbPositionIndicator thumb={row.thumb} />
            )}
          </Fragment>
        ))}
      </>
    );
  },
};
```

### Component Integration

The overlay reads element positions directly from the DOM—no component modification needed.

**Approach: External DOM measurement**

The staging page queries the component's DOM to find elements by data attributes or class names:

```typescript
// In the overlay renderer
function getSliderElements(containerRef: RefObject<HTMLElement>) {
  const container = containerRef.current;
  if (!container) return [];

  // Find all slider rows
  const rows = container.querySelectorAll('[data-slot="slider-row"]');

  return Array.from(rows).map(row => ({
    label: row.querySelector('[data-slot="slider-label"]')?.getBoundingClientRect(),
    value: row.querySelector('[data-slot="slider-value"]')?.getBoundingClientRect(),
    thumb: row.querySelector('[data-radix-slider-thumb]')?.getBoundingClientRect(),
    track: row.querySelector('[data-slot="slider-track"]')?.getBoundingClientRect(),
  }));
}
```

This keeps the component clean and puts all debug logic in the staging system. The overlay re-measures on animation frames or pointer events to stay in sync.

**All slider rows get overlays** — when debug mode is on, every slider in the component shows its hitbox visualizations, not just the one being dragged.

---

## State Toggles

### Loading State

Toggle that forces `isLoading={true}` on the component. Useful for showcasing loading skeletons.

### Theme

Light/dark toggle. Uses existing theme system.

---

## State Management (`lib/staging/use-staging-state.ts`)

```typescript
interface StagingState {
  componentId: ComponentId;
  presetName: string;
  debugLevel: DebugLevel;
  isLoading: boolean;
  theme: "light" | "dark" | "system";

  // Actions
  setComponent: (id: ComponentId) => void;
  setPreset: (name: string) => void;
  setDebugLevel: (level: DebugLevel) => void;
  toggleLoading: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useStagingState = create<StagingState>((set) => ({
  componentId: "parameter-slider",
  presetName: "photo-adjustments",
  debugLevel: "off",
  isLoading: false,
  theme: "system",

  setComponent: (id) => set({
    componentId: id,
    presetName: getPreviewConfig(id).defaultPreset,
    debugLevel: "off",
  }),
  setPreset: (name) => set({ presetName: name }),
  setDebugLevel: (level) => set({ debugLevel: level }),
  toggleLoading: () => set((s) => ({ isLoading: !s.isLoading })),
  setTheme: (theme) => set({ theme }),
}));
```

---

## URL Sync

State syncs bidirectionally with URL query params for shareability:

```
/staging?component=parameter-slider&preset=photo-adjustments&debug=margins
```

Use `nuqs` or manual `useSearchParams` sync.

---

## Implementation Steps

### Phase 1: Basic Infrastructure
1. Create `/staging` route with minimal layout
2. Build toolbar skeleton (component selector, preset pills, settings icon)
3. Implement staging canvas with chat context wrapper
4. Wire up Zustand state store
5. Sync state with URL params

### Phase 2: Debug Overlay System
6. Define staging config types
7. Create staging config registry
8. Build `RoundedRectOverlay` component for drawing boundaries
9. Implement debug overlay container with proper positioning

### Phase 3: Parameter Slider Integration
10. Create Parameter Slider staging config with DOM measurement
11. Implement all three debug levels (boundaries, margins, full)
12. Ensure overlays display for all slider rows simultaneously
13. Test overlay positioning across different slider configurations

### Phase 4: State Toggles
14. Implement loading state toggle
15. Wire up theme toggle to existing theme system

### Phase 5: Polish
16. Keyboard shortcuts (1-9 for presets, D to cycle debug levels)
17. Responsive behavior (works at various viewport sizes)
18. Ensure clean appearance for recording (no visual artifacts)

---

## Success Criteria

- Can select any Tool UI component and cycle through its presets
- Parameter Slider shows hitbox visualizations at all three debug levels
- All slider rows show overlays simultaneously (not just the active one)
- Toolbar is thin and unobtrusive (easy to crop or leave in frame)
- Component appears in realistic chat context
- Loading toggle works as expected
- Page loads fast and feels responsive
