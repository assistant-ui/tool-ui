# Agent Changelog

> This file helps coding agents understand project evolution, key decisions, and deprecated patterns.
> Updated: 2026-01-29

## Current State Summary

Tool UI is a copy/paste component library (shadcn/ui model) with 25+ components for AI assistant interfaces. Components use a unified `choice` prop for receipt state, follow flat prop APIs, and rely on Tailwind for layout customization. The project uses pnpm, Next.js with Turbopack, and assistant-ui v0.12.

## Stale Information Detected

| Location | States | Reality | Since |
|----------|--------|---------|-------|
| README.md | Lists 16 components | Actually 25+ components exist | 2026-01 |
| README.md | Missing MessageDraft, QuestionFlow, StatsDisplay, etc. | These components exist | 2026-01 |

## Timeline

### 2026-01-29 — SVG Glass Panel Effect Added

**What changed:** Added `GlassPanel` component and `useGlassStyles` hook for frosted glass refraction effects using SVG displacement maps via CSS `backdrop-filter`.

**Why:** Provide realistic glass distortion effects for weather widget overlays without WebGL complexity. SVG approach composes naturally with DOM, handles transparency correctly, and doesn't require canvas management.

**Technical approach:**
- SVG `feDisplacementMap` filter encodes X/Y displacement via R/G color channels
- Chromatic aberration displaces RGB channels by different amounts (R most, G middle, B least)
- Filter embedded as data URI in `backdrop-filter` CSS property
- Graceful degradation on unsupported browsers (no effect, content still visible)

**Agent impact:** Use `useGlassStyles` hook or `GlassPanel` component for glass effects. Don't implement WebGL-based glass effects—the SVG approach is simpler and sufficient.

```tsx
// Hook for applying to existing elements
const glassStyles = useGlassStyles({
  width: 300,
  height: 200,
  depth: 12,
  strength: 40,
  chromaticAberration: 8,
});

// Component wrapper
<GlassPanel depth={10} strength={40}>content</GlassPanel>
```

**Files:** `components/tool-ui/weather-widget/effects/glass-panel-svg.tsx`

---

### 2026-01-26 — AI SDK v5 → v6 Upgrade

**What changed:** Upgraded AI SDK from v5 to v6, assistant-ui to v0.12 with new hook APIs.

**Why:** Keep dependencies current with latest AI SDK patterns.

**Agent impact:** When referencing AI SDK or assistant-ui patterns, use v6/v0.12 APIs. Don't reference deprecated v5 patterns.

---

### 2026-01-23 — Question Flow Component Added

**What changed:** Added Question Flow component (renamed from "Wizard Step" during development). Includes variants: `inline` (default) and `upfront`.

**Why:** Provide structured multi-step question UI for AI assistants.

**Agent impact:** Use `QuestionFlow` for multi-step user input. Component was briefly in showcase, then removed—current best practice is to use `defaultValue` prop for pre-selected state.

**Files:** `components/tool-ui/question-flow/`

---

### 2026-01-22 — Copy Humanization Pass

**What changed:** Systematic rewrite of component docs and non-component docs to remove promotional language and improve voice.

**Why:** Copy should feel like real, believable interactions (see `.claude/docs/copy-guide.md`).

**Agent impact:** Follow copy-guide.md when writing example content. Avoid promotional language, generic placeholders, and tech demo patterns.

---

### 2026-01-19 — Unified Receipt Prop (`choice`)

**What changed:** All receipt state props unified to `choice` across components.

**Before:** `confirmed`, `decision` (inconsistent per component)
**After:** `choice` (universal)

**Why:** Consistent API for LLM serialization and code readability.

**Agent impact:** Always use `choice` prop for receipt state. Never use `confirmed` or `decision`.

```tsx
// Correct
<ApprovalCard choice="approved" />
<OptionList choice="option-a" />

// Deprecated (don't use)
<ApprovalCard decision="approved" />
<OptionList confirmed="option-a" />
```

**Files:** Plan at `.claude/plans/2025-01-19-unified-receipt-prop.md`

---

### 2026-01-16 — MessageDraft Component Added

**What changed:** Added MessageDraft component for email and Slack message previews.

**Agent impact:** Use `MessageDraft` for email/Slack preview UIs, not custom implementations.

**Files:** `components/tool-ui/message-draft/`

---

### 2026-01-14 — Gallery Removals (X Post, ParameterSlider)

**What changed:** X Post and ParameterSlider removed from gallery (components still exist in codebase).

**Why:** X Post scenario didn't pass believability test. ParameterSlider was experimental.

**Agent impact:** Components exist but aren't prominently featured. ParameterSlider is still usable; X Post exists but has copy issues.

---

### 2026-01-06 — ImageGallery Migration to View Transitions API

**What changed:** ImageGallery migrated from Framer Motion to native View Transitions API.

**Why:** Reduce bundle size, use platform features.

**Agent impact:** Don't add Framer Motion for ImageGallery animations. Use View Transitions API patterns.

---

## Deprecated Patterns

| Don't | Do Instead | Since |
|-------|------------|-------|
| Use `confirmed` prop | Use `choice` prop | 2026-01-19 |
| Use `decision` prop | Use `choice` prop | 2026-01-19 |
| Add `maxWidth`/`padding` props | Let users customize via `className` | Project inception |
| Use nested config objects | Use flat props | Project inception |
| Add Framer Motion to ImageGallery | Use View Transitions API | 2026-01-06 |
| Use AI SDK v5 patterns | Use AI SDK v6 patterns | 2026-01-26 |
| Implement WebGL glass effects | Use `useGlassStyles` or `GlassPanel` from glass-panel-svg | 2026-01-29 |

## Trajectory

Based on recent changes, the project is:
- **Standardizing APIs** — Receipt props unified, flat prop patterns enforced
- **Polishing copy** — Moving from capability demos to believable scenarios
- **Keeping dependencies current** — AI SDK v6, assistant-ui v0.12
- **Reducing bundle** — View Transitions over Framer Motion where possible
- **Adding specialized components** — MessageDraft, QuestionFlow, StatsDisplay for specific use cases
- **Adding visual effects** — SVG-based glass refraction for weather widget, preferring CSS/SVG over WebGL
