# Weather Condition Tuning Studio - Implementation Plan

## Overview

Create a comprehensive tuning interface for systematically composing all 13 weather conditions with full visibility, time-of-day testing, and sign-off workflow.

**New page**: `app/sandbox/weather-tuning/`

## Architecture

### File Structure

```
app/sandbox/weather-tuning/
├── page.tsx                      # Main page component
├── components/
│   ├── condition-matrix.tsx      # 13-thumbnail grid
│   ├── condition-card.tsx        # Individual thumbnail with status badges
│   ├── detail-editor.tsx         # Expanded editor with preview + controls
│   ├── parameter-panel.tsx       # Accordion-based parameter groups
│   ├── parameter-row.tsx         # Individual slider/toggle control
│   ├── time-bar.tsx              # Global time slider + checkpoint buttons
│   ├── checkpoint-dots.tsx       # 4-dot review indicator
│   ├── delta-badge.tsx           # "3 changed" badge for groups
│   ├── comparison-view.tsx       # Side-by-side condition comparison
│   └── export-panel.tsx          # Export options + code generation
├── hooks/
│   ├── use-tuning-state.ts       # Central state management
│   ├── use-checkpoints.ts        # Review status per condition
│   └── use-code-gen.ts           # TypeScript output generation
├── lib/
│   ├── constants.ts              # Time checkpoints, defaults
│   └── snapshot.ts               # Thumbnail capture utilities
└── types.ts                      # Page-specific types
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| New page vs extend compositor | New page, then deprecate compositor | Cleaner architecture; tuning studio becomes the single tool |
| Parameter UI | Accordion groups | 70+ params need hierarchy; tabs would hide context |
| Thumbnails | Placeholder → real snapshots | Start with placeholders in Phase 1, add canvas snapshots in Phase 6 |
| Controls | Native shadcn | Better integration than Leva for workflow UI |

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Weather Tuning Studio                    Progress: 3/13    [Export ▼]  │
├─────────────────────────────────────────────────────────────────────────┤
│ Time: ◀━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶  [🌅] [🌞] [🌆] [🌙]     │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│ │ clear   │ │ p-cloudy│ │ cloudy  │ │overcast │ │  fog    │            │
│ │    ✓    │ │    ●    │ │    ○    │ │    ○    │ │    ○    │            │
│ │ ●●●●    │ │ ●●○○    │ │ ○○○○    │ │ ○○○○    │ │ ○○○○    │            │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │
│ │ drizzle │ │  rain   │ │hvy-rain │ │ t-storm │  ... (13 total)        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │
├─────────────────────────────────────────────────────────────────────────┤
│ DETAIL EDITOR (expanded when condition selected)                        │
│ ┌────────────────────────┬──────────────────────────────────────────────┤
│ │                        │ partly-cloudy           [Reset] [Sign Off]  │
│ │                        │ Checkpoints: [6AM ✓] [12PM ●] [6PM] [12AM] │
│ │    Preview Canvas      ├──────────────────────────────────────────────┤
│ │       480×340          │ ▼ Layers                                     │
│ │                        │   ☑ Celestial  ☑ Clouds  ☐ Rain  ☐ Snow     │
│ │  [☑ Widget Overlay]    │ ▼ Celestial (2 changed)                      │
│ │  [Compare: Base/Tuned] │   sunSize      ━━━●━━━  0.18  (was 0.14)    │
│ │                        │   celestialX   ━━━━●━━  0.70  (base)        │
│ │                        │ ▶ Clouds (0 changed)                         │
│ │                        │ ▶ Rain (disabled)                            │
│ └────────────────────────┴──────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────┘
```

## State Structure

```typescript
interface TuningState {
  // Data
  overrides: Record<WeatherCondition, ConditionOverrides>;
  globalTimeOfDay: number;

  // UI
  selectedCondition: WeatherCondition | null;
  expandedGroups: Set<string>;
  compareMode: 'off' | 'ab' | 'side-by-side';
  compareTarget: WeatherCondition | null;
  showWidgetOverlay: boolean;

  // Workflow
  checkpoints: Record<WeatherCondition, {
    dawn: 'pending' | 'reviewed';
    noon: 'pending' | 'reviewed';
    dusk: 'pending' | 'reviewed';
    midnight: 'pending' | 'reviewed';
  }>;
  signedOff: Set<WeatherCondition>;
}
```

**Persistence:**
- `localStorage`: Overrides + global settings (reuse existing key)
- `sessionStorage`: Checkpoint/sign-off status (session-scoped)
- File export: Full state including workflow metadata

## Implementation Phases

### Phase 1: Foundation
Create page shell and condition matrix with basic selection.

**Files:**
- `page.tsx` - Page layout with time bar and matrix
- `components/condition-matrix.tsx` - Grid container
- `components/condition-card.tsx` - Clickable thumbnail
- `components/time-bar.tsx` - Slider + preset buttons
- `hooks/use-tuning-state.ts` - Basic state (selectedCondition, timeOfDay, overrides)

**Scope:**
- Static thumbnails (placeholder images initially)
- Time slider functional
- Click to select condition (no editor yet)
- Import existing overrides from localStorage

### Phase 2: Detail Editor
Build the expanded parameter editing panel.

**Files:**
- `components/detail-editor.tsx` - Split layout with preview
- `components/parameter-panel.tsx` - Accordion wrapper
- `components/parameter-row.tsx` - Individual control

**Scope:**
- Live preview canvas using WeatherEffectsCanvas
- Accordion groups for each layer type
- Slider controls bound to state
- Delta indicators (value changed from base)
- Reset-to-base per parameter and per group

### Phase 3: Time Checkpoints
Add systematic time-of-day review workflow.

**Files:**
- `components/checkpoint-dots.tsx` - 4-dot indicator
- `hooks/use-checkpoints.ts` - Review tracking

**Scope:**
- Checkpoint buttons jump to specific times
- Mark checkpoint as reviewed when visiting
- Visual status on thumbnails
- Keyboard shortcuts (1-4 for checkpoints)

### Phase 4: Sign-off & Comparison
Complete workflow with comparison tools.

**Files:**
- `components/comparison-view.tsx` - Side-by-side layout
- Update `detail-editor.tsx` for A/B toggle

**Scope:**
- A/B comparison (base vs tuned)
- Side-by-side condition comparison
- Sign-off button (requires all checkpoints reviewed)
- Progress indicator in header

### Phase 5: Export & Code Generation
Enable output for integration into codebase.

**Files:**
- `components/export-panel.tsx` - Export dialog
- `hooks/use-code-gen.ts` - TypeScript generation

**Scope:**
- Export JSON (overrides only or full params)
- Generate TypeScript for `parameter-mapper.ts`
- Copy to clipboard
- Download as file

### Phase 6: Polish & Migration
Refinements, optimizations, and compositor deprecation.

**Scope:**
- Live thumbnail snapshots (capture from canvas)
- Keyboard navigation (arrow keys between conditions)
- Undo/redo for parameter changes
- Performance optimization (debouncing, memoization)
- Widget overlay toggle functional
- Migrate `presets.ts` utilities to `weather-tuning/lib/`
- Remove `app/sandbox/weather-compositor/` directory
- Update sandbox index page links

## Critical Files to Modify/Reference

| File | Action |
|------|--------|
| `app/sandbox/weather-tuning/` | CREATE - New directory |
| `app/sandbox/page.tsx` | MODIFY - Add link to new tuning page |
| `app/sandbox/weather-compositor/presets.ts` | MOVE - Migrate utilities to new location |
| `app/sandbox/weather-compositor/` | DELETE - Remove after tuning studio is complete |
| `components/tool-ui/weather-widget/effects/parameter-mapper.ts` | REFERENCE - Target for generated code |

## Verification

After each phase:

1. **Visual check**: Navigate to `/sandbox/weather-tuning` and verify UI renders
2. **Interaction**: Click conditions, adjust sliders, verify preview updates
3. **Persistence**: Refresh page, confirm state restored from storage
4. **Time system**: Use slider and presets, verify preview responds

Final verification:
1. Tune a condition across all 4 time checkpoints
2. Sign off the condition
3. Export as TypeScript
4. Verify output matches expected format for `parameter-mapper.ts`
