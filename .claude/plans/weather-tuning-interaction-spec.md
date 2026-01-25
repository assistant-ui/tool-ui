# Weather Tuning Studio: Interaction Specification

## Overview

This document defines the ideal interaction model for the Weather Tuning Studio—a specialized tool for adjusting weather effect parameters across 13 weather conditions and 4 time-of-day checkpoints.

---

## User Goal Analysis

### End Goal
Tune weather effect parameters to perfection across all conditions and lighting scenarios, then export the configuration for use in production.

### Experience Goals
- Feel confident about which parameters are being edited and when
- Feel in control of the tuning process without fear of losing work
- Feel accomplished as conditions are signed off

### User Archetype
**Expert creative tool user** — Someone comfortable with slider-based parameter tuning (like motion graphics or game dev tools) who will develop muscle memory for this specific interface. They want precision and efficiency.

### Excise to Eliminate
| Current Excise | Remedy |
|----------------|--------|
| Uncertain which checkpoint is being edited | Clear, always-visible editing context |
| Re-navigating to find changed parameters | Quick filters for "changed only" |
| Imprecise slider dragging for exact values | Direct numeric input |
| No way to undo recent changes | Multi-step undo/redo |
| Manually tracking which checkpoints remain | Auto-advance through workflow |

---

## Conceptual Model: The Key Insight

### The Mental Model Gap

**Current model (confusing):**
The time dial and checkpoint buttons both affect time, but they serve different purposes:
- Dial dragging = preview/scrub (view-only interpolation)
- Checkpoint click = edit mode switch + time jump

Users don't naturally understand this distinction.

**Proposed model (clear):**
Separate **viewing** from **editing**:
- **Time scrubbing** = exploration, seeing interpolated results
- **Checkpoint selection** = choosing which keyframe to edit

### Visual Metaphor: Keyframe Animation

Like After Effects or motion graphics tools:
- Checkpoints are **keyframes** (specific moments with explicit values)
- Time between checkpoints shows **interpolated** values
- Editing happens at keyframes, not arbitrary times

This metaphor is familiar to the target user and maps cleanly to the system's actual behavior.

---

## States & Transitions

### Primary Application States

```
┌─────────────────┐         ┌─────────────────┐
│  No Condition   │──pick──▶│   Editing Mode  │
│    Selected     │         │                 │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
           ┌───────────────┐                 ┌───────────────┐
           │ Edit Keyframe │◀──────┬────────▶│ Preview Time  │
           │    (dawn)     │       │         │  (scrubbing)  │
           └───────────────┘       │         └───────────────┘
                    │              │
                    └──next/prev───┘
```

### Editing Context States

| State | Trigger | Appearance | User Feeling |
|-------|---------|------------|--------------|
| **Keyframe Edit Mode** | Click checkpoint button | Active checkpoint highlighted; "Editing [checkpoint]" badge prominent | Focused, precise |
| **Preview Mode** | Drag time dial | "Preview" badge; parameters read-only appearance | Exploratory, safe |
| **Comparison Mode** | Toggle compare | Split view or A/B overlay | Evaluative, decisive |

### Keyframe Transition

| Transition | Animation | Duration | Emotional Tone |
|------------|-----------|----------|----------------|
| Checkpoint → Checkpoint | Crossfade canvas + slide badge | 200ms ease-out | Snappy, responsive |
| Edit → Preview | Fade to "Preview" state | 150ms | Shift to exploration |
| Preview → Edit | Pop active keyframe | 200ms ease-out | Return to precision |

---

## Interaction Patterns

### 1. Time Control (Redesigned)

#### Proposed: Separate Scrub from Edit

**Scrub Control** (horizontal timeline):
```
[Dawn]────────[Noon]────────[Dusk]────────[Midnight]
   🔶            ○              ○              ○
   ↑ playhead
```

- Horizontal track with keyframe markers
- Draggable playhead for preview
- Click keyframe dot to enter edit mode for that checkpoint
- Visual distinction: filled dot = editing, hollow = not editing

**Keyframe Selector** (replaces current checkpoint buttons):
```
┌─────────────────────────────────────────────────┐
│  🌅 Dawn     🌞 Noon     🌆 Dusk     🌙 Midnight │
│  [EDITING]   (reviewed)  (pending)   (pending)  │
└─────────────────────────────────────────────────┘
```

- Click any to select as edit target
- Badge shows edit state + review status
- Current editing checkpoint is prominent
- Keyboard 1-4 jumps and selects

**Key change:** When scrubbing the timeline, show "Preview" state. Parameter sliders can display interpolated values but with visual indication they're not directly editable. Click a keyframe to exit preview and enter edit mode.

#### States & Feedback

| Action | Visual Response | Canvas | Parameters |
|--------|----------------|--------|------------|
| Drag playhead | Playhead follows; "Preview" badge | Real-time interpolation | Read-only display |
| Click keyframe dot | Dot fills; "Editing [name]" badge | Jumps to checkpoint time | Editable |
| Click current keyframe | No change | No change | No change |
| Click keyframe while previewing | Exit preview, enter edit | Jump to time | Editable |

### 2. Parameter Sliders (Enhanced)

#### Current Issues
- No direct value input
- No visual indication of base vs. modified
- Reset button appears on hover (hidden affordance)

#### Proposed Enhancements

**Inline Value Input:**
```
Coverage     [━━━━━━━━━○━━━]    0.73  ⟲
                               ↑ click to edit
```

- Click numeric value to edit directly
- Press Enter or blur to commit
- Press Escape to cancel
- Arrow keys increment/decrement (Shift for 10x)

**Modified State Visibility:**
```
Coverage     [━━━━●━━━━━━━━]    0.73 ← 0.50  ⟲
             ↑ delta indicator           ↑ base value
```

- Small marker on track shows base value
- "← 0.50" suffix shows what it was
- Amber tint indicates modification
- Reset button always visible when modified

**Keyboard Support:**
| Key | Action |
|-----|--------|
| ↑/↓ | Increment/decrement by step |
| Shift+↑/↓ | Increment/decrement by 10× |
| Page Up/Down | Jump to 25%/75% of range |
| Home/End | Jump to min/max |
| Escape | Revert to base value (with confirmation for large delta) |

### 3. Layer Toggle Bar (Improved)

#### Current State
Layer toggles (Celestial, Clouds, Rain, etc.) at top of parameter panel.

#### Enhancement: Semantic Grouping

```
┌────────────────────────────────────────────────────────┐
│ Atmosphere                    Precipitation            │
│ [☀ Celestial] [☁ Clouds]     [🌧 Rain] [⚡ Lightning] [❄ Snow] │
│      ●2            ●5             ○          ●1            ○   │
└────────────────────────────────────────────────────────┘
```

- Group layers by semantic category
- Dot badge shows modification count per layer
- Collapsed layers stay in view but take less space
- Expand layer accordion on first modification

### 4. Checkpoint Progress (Enhanced)

#### Current State
Checkpoint dots in sidebar + "Checkpoints" card in editor.

#### Proposed: Unified Progress Indicator

**Condition Row (Sidebar):**
```
☀ Clear         ✓
  ●●●● [4/4]   SIGNED OFF
```

**Checkpoint Progress Bar (Editor, always visible):**
```
┌──────────────────────────────────────────────────────┐
│ Clear: Dawn ●───────Noon ●───────Dusk ○───────Midnight ○ │
│        ✓            ✓            •            •          │
│                           [2/4 reviewed]                 │
└──────────────────────────────────────────────────────────┘
```

- Linear progress representation
- Filled = reviewed, hollow = pending
- Current editing position highlighted
- Click any to navigate

### 5. Undo/Redo System (New)

#### Proposed Implementation

**History Stack:**
- Track every parameter change as discrete action
- Group rapid slider movements (debounce 500ms)
- Store: condition, checkpoint, parameter, old value, new value

**UI Integration:**
```
┌─ Toolbar ─────────────────────────────────────────┐
│ ← Undo  →  Redo    |    History ▾    |    ...    │
└───────────────────────────────────────────────────┘
```

- Cmd/Ctrl+Z: Undo
- Cmd/Ctrl+Shift+Z: Redo
- History dropdown shows recent changes with timestamps
- Click history item to restore to that point

**History Item Display:**
```
• Cloud Coverage: 0.73 → 0.50 (Clear, Dawn)    2m ago
• Rain Intensity: 0.0 → 0.8 (Rain, Noon)       5m ago
• [Checkpoint] Switched to Dusk                 6m ago
```

### 6. Workflow Progression (Enhanced)

#### Current State
Manual: select condition, cycle through checkpoints, sign off, repeat.

#### Proposed: Guided Flow Option

**Auto-Advance Mode:**
```
[Auto-advance ○ off]
```

When enabled:
1. After reviewing a checkpoint (any parameter change), mark as reviewed
2. After all 4 checkpoints reviewed, prompt to sign off
3. After sign-off, auto-advance to next unsigned condition

**Toast on Sign-Off:**
```
┌────────────────────────────────────────┐
│ ✓ Clear signed off                      │
│   Up next: Partly Cloudy                │
│   [Go] [Stay on Clear]                  │
└────────────────────────────────────────┘
```

### 7. Comparison Mode (Clarified)

#### Current State
"Compare" button opens A/B or side-by-side view.

#### Enhancement: Clear Purpose

**Two comparison types with distinct UX:**

1. **A/B (Current vs. Base):**
   - Purpose: See effect of your changes
   - Interaction: Press and hold to see base, release to see current
   - OR: Toggle button switches between states
   - Best for: "Did my change improve things?"

2. **Side-by-Side (Condition vs. Condition):**
   - Purpose: Match parameters across conditions
   - Interaction: Left pane = current, right pane = selected condition
   - Parameter values shown for both; click to copy
   - Best for: "I want Rain to match Thunderstorm's clouds"

**Keyboard:**
| Key | Action |
|-----|--------|
| C | Toggle compare mode |
| Space (in compare) | Hold to show "before" state |
| 1-9 (in side-by-side) | Quick-select condition to compare |
| Escape | Exit compare mode |

---

## Keyboard Shortcuts Reference

| Key | Scope | Action |
|-----|-------|--------|
| **Navigation** | | |
| ↑/↓ | Global | Previous/next condition |
| 1-4 | Global | Jump to checkpoint (Dawn=1, Midnight=4) |
| Tab | Parameter panel | Next parameter |
| Shift+Tab | Parameter panel | Previous parameter |
| **Editing** | | |
| ←/→ | Focused slider | Decrement/increment |
| Shift+←/→ | Focused slider | Large decrement/increment |
| Enter | Focused slider | Edit value directly |
| Escape | Focused slider | Reset to base |
| **Actions** | | |
| Cmd/Ctrl+Z | Global | Undo |
| Cmd/Ctrl+Shift+Z | Global | Redo |
| C | Global | Toggle compare mode |
| E | Global | Toggle data overlay |
| S | With selection | Sign off current condition |
| R | With selection | Reset current condition |
| ? | Global | Show keyboard shortcuts |

---

## Error Prevention & Recovery

### Preventing Errors

| Error Type | Prevention Mechanism |
|------------|---------------------|
| Editing wrong checkpoint | Always-visible "Editing [checkpoint]" badge at locus of attention |
| Losing work | Auto-save to localStorage; undo/redo stack |
| Signing off incomplete | Disable sign-off until all checkpoints reviewed |
| Accidental reset | Confirmation dialog for reset; "Reset" disabled when no changes |
| Wrong comparison target | Clear visual labeling of which condition is selected |

### Recovery Mechanisms

| Scenario | Recovery Path |
|----------|---------------|
| Changed wrong parameter | Cmd+Z to undo; individual reset buttons |
| Reset condition accidentally | Undo supports reset reversal |
| Lost track of what changed | History panel shows all changes with timestamps |
| Need to restore previous session | LocalStorage persistence + manual export/import |

---

## Accessibility Requirements

### Screen Reader Support

- Announce current editing context: "Editing Clear condition, Dawn checkpoint"
- Announce parameter changes: "Cloud coverage changed to 0.73"
- Announce mode changes: "Entered comparison mode"
- Announce sign-off: "Clear condition signed off, 1 of 13 complete"

### Keyboard Navigation

- All controls reachable via Tab
- Focus trap in modals (export panel)
- Focus returns to trigger when modal closes
- Skip links for major sections

### Reduced Motion

When `prefers-reduced-motion: reduce`:
- Canvas transitions instant
- No animated playhead
- Badge transitions instant
- Slider thumb doesn't animate

---

## Responsive Considerations

This is primarily a desktop tool (precise parameter tuning requires pointer accuracy), but should degrade gracefully:

### Medium Screens (< 1280px)
- Collapse sidebar to icons
- Stack timeline controls vertically
- Parameter labels truncate with tooltip

### Narrow Screens (< 1024px)
- Full sidebar drawer (overlay)
- Simplified checkpoint selector
- Consider: "This tool works best on larger screens" notice

---

## Animation Timing Reference

| Element | Enter | Exit | Easing |
|---------|-------|------|--------|
| Checkpoint badge | 200ms | 150ms | ease-out |
| Parameter highlight | 150ms | 100ms | ease-out |
| Canvas crossfade | 200ms | — | ease-in-out |
| Undo toast | 200ms slide-up | 150ms fade | spring(1, 80, 10) |
| Compare overlay | 250ms | 200ms | ease-out |
| History dropdown | 150ms | 100ms | ease-out |

---

## Implementation Priority

### P0: Critical for Usability
1. **Clear editing context indicator** — Always-visible badge showing which checkpoint is being edited
2. **Preview vs. Edit mode distinction** — Separate scrubbing from keyframe selection
3. **Direct numeric input on sliders** — Click value to type exact number

### P1: Significant Improvement
4. **Undo/Redo system** — Multi-step history with keyboard shortcuts
5. **Enhanced modified state visibility** — Base value markers, consistent reset buttons
6. **Keyboard shortcut discoverability** — Help overlay, consistent shortcuts

### P2: Polish & Workflow
7. **Auto-advance mode** — Optional guided workflow through conditions
8. **History panel** — Visual history of all changes
9. **Improved comparison UX** — Hold-to-compare, side-by-side parameter copying

### P3: Nice to Have
10. **Session restore** — Prompt to restore on page load if previous session exists
11. **Parameter search/filter** — Filter to "changed only"
12. **Condition templates** — Copy all settings from one condition to another

---

## Summary: The Core Changes

1. **Conceptual clarity:** Treat checkpoints as keyframes. Separate preview (scrubbing) from editing (keyframe selection).

2. **Direct manipulation:** Add numeric input to sliders. Make reset buttons always visible when modified.

3. **Reversibility:** Implement undo/redo to enable confident exploration.

4. **Progressive disclosure:** Keep the interface simple for basic use, reveal power features (history, comparison, templates) on demand.

5. **Keyboard-first:** Make the entire workflow efficient for users who develop muscle memory.

The result should feel like a professional creative tool where users can explore fearlessly, edit precisely, and track their progress clearly.
