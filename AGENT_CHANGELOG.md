# Agent Changelog

> This file helps coding agents understand project evolution, key decisions, and deprecated patterns.
> Updated: 2026-02-11

## Current State Summary

Tool UI is a maintainer-owned copy/paste component library (shadcn/ui model) for AI assistant interfaces. Component APIs are flat, receipt semantics are unified on `choice`, and component directories are treated as the product surface (`schema`, `component`, `README`, exports). Interactive component modules import UI primitives through local `_adapter.tsx` files, and per-component `error-boundary.tsx` wrappers are no longer part of the component contract. Weather Widget is on a clean-break V3.1 payload contract with deterministic scene-time input via `time`.

## Stale Information Detected

| Location | States | Reality | Since |
|----------|--------|---------|-------|
| `.claude/plans/plan-sequential-munching-canyon.md` | References `hooks/use-code-gen.ts` TypeScript generation | Tuning flow is apply/recover via repo routes; `use-code-gen.ts` removed | 2026-02 |
| `.claude/plans/plan-sequential-munching-canyon.md` | Targets deletion of `app/sandbox/weather-compositor/` | `weather-tuning` still imports compositor presets/interpolation modules; compositor remains active | 2026-02 |
| `.claude/docs/component-workflow.md` | New component contract requires `error-boundary.tsx` | Error-boundary layer was removed from component contracts; index exports no longer include local error boundaries | 2026-02 |
| `.claude/agents/tool-ui-implementer.md` | Instructs creating `error-boundary.tsx` and using `createToolUiErrorBoundary` | Error-boundary wrappers were removed; component contract now centers on `_adapter`, schema, component, index, README | 2026-02 |
| `.claude/agents/tool-ui-reviewer.md` | Blocks review if `error-boundary.tsx` is missing | `error-boundary.tsx` is no longer required in component directories | 2026-02 |
| `.claude/compiled/component-creation.md` | Uses `../shared` barrel and error-boundary scaffolding in canonical template | Current standards forbid `../shared` barrel imports for core logic and remove per-component error boundary scaffolds | 2026-02 |
| `docs/plans/2026-01-22-feat-wizard-step-component-plan.md` | Active implementation target is `WizardStep` at `components/tool-ui/wizard-step/*` | Implemented component is `QuestionFlow` at `components/tool-ui/question-flow/*` | 2026-01 |
| `docs/plans/2026-01-23-feat-wizard-step-visual-polish-plan.md` | Polish targets `WizardStep` paths and naming | Final shipped component naming/path is `QuestionFlow` | 2026-01 |

## Timeline

### 2026-02-11 — Import Boundary Enforcement + Error Boundary Layer Removal

**What changed:** Tool UI component contracts were tightened around portability boundaries and local adapter ownership.

Highlights:
- Removed per-component `error-boundary.tsx` files and related exports across component directories
- Normalized component `_adapter.tsx` files to alias-based UI imports
- Enforced adapter-only UI primitive imports via ESLint (`@/components/ui/*` and `@/lib/ui/cn` are restricted outside `_adapter.tsx`)
- Hardened registry/ID contracts and tests (`data-table` row keys, `question-flow` ids, registry generation edge cases like OS metadata files)

**Why:** Reduce copy/paste friction, prevent component-internal import drift, and keep portability constraints enforceable by lint/tests instead of convention.

**Agent impact:** Do not add local `error-boundary.tsx` files for new components. In non-adapter component modules, import UI primitives and `cn` only from `./_adapter`; keep shared imports as direct leaf modules (`../shared/*`), not barrels.

**Files:** `eslint.config.ts`, `components/tool-ui/*/_adapter.tsx`, `components/tool-ui/*/index.ts*`, `lib/registry/tool-ui-registry.ts`, `lib/tests/tool-ui/data-table/row-keys-contract.test.ts`, `lib/tests/tool-ui/question-flow/ids-contract.test.ts`, `lib/tests/registry/tool-ui-registry.test.ts`

---

### 2026-02-11 — Maintainer Workflow + State Contract Hardening

**What changed:** Shifted docs and tooling to a maintainer-first workflow and added targeted regression contracts for high-risk UI state paths.

Highlights:
- Reframed onboarding/docs around maintainers (`README.md`, `CONTRIBUTING.md`, `app/docs/contributing/content.mdx`, `docs/playground.md`, `docs/tests.md`)
- Added component-local README coverage and scaffold automation via `pnpm component:new` (`scripts/new-tool-ui-component.ts`)
- Added `components/tool-ui/index.ts` aggregate export surface
- Added contract tests for deterministic row keys, outcome sync transitions, step ids, and tab search param resolution
- Closed component contract gaps and improved scaffold consistency

**Why:** Reduce time-to-first-working-component, make component directory contracts explicit, and keep state/ID behavior stable as internals evolve.

**Agent impact:** Use scaffold + maintainer docs as the default path for new components. When changing stateful behavior, expose deterministic helpers and add contract tests under `lib/tests/**`.

**Files:** `README.md`, `CONTRIBUTING.md`, `app/docs/contributing/content.mdx`, `scripts/new-tool-ui-component.ts`, `components/tool-ui/index.ts`, `lib/tests/tool-ui/**/*`

---

### 2026-02-10 — Registry Pipeline Hardened for Per-Component Install

**What changed:** Registry generation moved to component-directory discovery with per-item artifacts and minimal dependency closure (instead of relying on prefixed/manual lists and shared monolith assumptions).

Highlights:
- Component discovery from `components/tool-ui/*` (excluding `shared`)
- Registry items unprefixed (`tool-ui-foo` → `foo`)
- Shared artifact dependencies inlined per item where needed
- Registry tests assert discovered items match component directories

**Why:** Keep shadcn registry output aligned with the actual product surface and reduce drift from manually curated registry definitions.

**Agent impact:** Treat `components/tool-ui` directories as source of truth for registry coverage. After adding/refactoring components, run `pnpm registry:build` and `pnpm registry:check`.

**Files:** `lib/registry/tool-ui-registry.ts`, `lib/tests/registry/tool-ui-registry.test.ts`, `scripts/build-tool-ui-registry.ts`, `public/r/*.json`

---

### 2026-02-10 — CI 1.0 Quality Gates

**What changed:** CI now enforces lint/typecheck/test/registry artifact consistency on push/PR to `main`.

**Why:** Prevent state contract regressions and stale registry artifacts from landing.

**Agent impact:** A local "done" state for maintainer work is: `pnpm lint:ci`, `pnpm typecheck`, `pnpm test`, `pnpm registry:check`.

**Files:** `.github/workflows/ci.yml`, `package.json`

---

### 2026-02-10 — Weather Widget V3.1 Clean Break

**What changed:** Weather widget migrated to a strict V3.1 payload contract and removed legacy compatibility layers.

Key contract shifts:
- Canonical parser: `safeParseWeatherWidgetPayload`
- Payload shape is widget prop contract (+ UI-only props)
- Deterministic time input is now `time` (`timeBucket` or `localTimeOfDay`)
- Field names normalized (`current.conditionCode`, `units.temperature`, `forecast[].label`, etc.)

**Why:** Keep provider normalization in the tool layer, simplify widget rendering inputs, and make day/night/effects deterministic.

**Agent impact:** Emit only V3.1 payloads when rendering WeatherWidget. Do not use legacy serializable weather parser/types or provider-specific fields in widget render payloads.

**Files:** `components/tool-ui/weather-widget/schema.ts`, `components/tool-ui/weather-widget/time.ts`, `components/tool-ui/weather-widget/weather-widget.tsx`, `lib/presets/weather-widget.ts`

---

### 2026-02-10 — Weather Tuning Workflow Simplified (Apply-Only)

**What changed:** Removed client-side weather tuning codegen hook (`app/sandbox/weather-tuning/hooks/use-code-gen.ts`) and standardized on repo-backed apply/recover endpoints.

**Why:** Reduce duplicate export logic and keep one source of truth (`components/tool-ui/weather-widget/effects/tuned-presets.ts`).

**Agent impact:** In tuning flows, treat `Apply to repo` as the path to production. Use:
- `POST /api/weather-tuning/apply`
- `GET /api/weather-tuning/recover`

Do not add/restore parallel clipboard/download codegen paths for production tuning updates.

---

### 2026-02-10 — Test Location Policy Enforced

**What changed:** Weather + shared tests were moved under `lib/tests/**` to ensure they run under current Vitest include globs and are not copied with component folders.

**Why:** Components are copy-paste product surface; test fixtures/infra should stay internal to this repo.

**Agent impact:** Place new executable tests in:
- `lib/tests/**` (preferred)
- `lib/playground/**` (playground-specific)

Tests under `components/tool-ui/**` are out-of-policy and may not run by default.

**Files:** `vitest.config.ts`, `lib/tests/tool-ui/shared/*`, `lib/tests/tool-ui/weather-widget/*`

---

### 2026-01-30 — PostHog Analytics Added

**What changed:** Added PostHog instrumentation with Vercel Analytics dual-tracking.

**Why:** Track component usage, preset selection, and code copying to understand what components and presets are most valuable.

**Files added:**
- `instrumentation-client.ts` — Client-side PostHog initialization
- `lib/posthog-server.ts` — Server-side PostHog SDK
- `lib/analytics.ts` — Typed event tracking SDK

**Files modified:**
- `next.config.ts` — Added `/ph/*` proxy rewrites for PostHog
- `preset-selector.tsx` — Tracks `component_preset_selected`
- `component-preview-shell.tsx` — Tracks `component_code_copied`, now requires `componentId` prop

**Agent impact:** When adding new trackable interactions, use `analytics.*` methods from `lib/analytics.ts`. The `ComponentPreviewShell` now requires a `componentId` prop.

**Events tracked:**
- `component_preset_selected` — User selects a preset
- `component_code_copied` — User copies component code
- `component_viewed` — User views a component (ready to instrument)
- `search_no_results` — Search with no matches (ready to instrument)

---

### 2026-01-29 — Sandbox Middleware Added

**What changed:** Added middleware to gate `/sandbox/*` routes behind a `?sandbox=true` query param in production. Development mode always allows access.

**Why:** Keep experimental sandboxes (weather effects testing, etc.) accessible for development without exposing them in production.

**Agent impact:** Sandbox pages work normally in dev. In production, add `?sandbox=true` to URL to access.

---

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
| Use `ComponentPreviewShell` without `componentId` | Always pass `componentId` prop for analytics | 2026-01-30 |
| Use weather payload prop `visual` | Use weather payload prop `time` | 2026-02-10 |
| Use legacy serializable weather parser/types | Use `WeatherWidgetPayloadSchema` + `safeParseWeatherWidgetPayload` | 2026-02-10 |
| Put executable tests in `components/tool-ui/**` | Put tests in `lib/tests/**` (or `lib/playground/**`) | 2026-02-10 |
| Use `app/sandbox/weather-tuning/hooks/use-code-gen.ts` export flow | Use apply/recover API routes and `tuned-presets.ts` | 2026-02-10 |
| Curate registry component lists by hand | Discover from `components/tool-ui/*` and validate with registry tests | 2026-02-10 |
| Import from `../shared` barrel in core interactive components | Import direct leaf modules from `../shared/*` | 2026-02-10 |
| Import shadcn primitives (`@/components/ui/*`, `@/lib/ui/cn`) directly in non-adapter component files | Import those primitives from local `./_adapter` files | 2026-02-11 |
| Require/export per-component `error-boundary.tsx` wrappers | Export component + schema contracts directly; rely on caller/app-level boundaries | 2026-02-11 |
| Add new components without local READMEs and contract scaffold files | Use `pnpm component:new` and keep the full component directory contract | 2026-02-11 |

## Trajectory

Based on recent changes, the project is:
- **Standardizing APIs** — Receipt props unified, flat prop patterns enforced
- **Maintainer-first DX** — onboarding and docs tuned for direct maintenance in this repo
- **Polishing copy** — Moving from capability demos to believable scenarios
- **Keeping dependencies current** — AI SDK v6, assistant-ui v0.12
- **Reducing bundle** — View Transitions over Framer Motion where possible
- **Adding specialized components** — MessageDraft, QuestionFlow, StatsDisplay for specific use cases
- **Adding visual effects** — SVG-based glass refraction for weather widget, preferring CSS/SVG over WebGL
- **Adding analytics** — PostHog + Vercel Analytics for usage tracking
- **Hardening weather contracts** — V3.1 clean-break payloads with deterministic `time` input and apply-only tuning workflow
- **Hardening delivery rails** — registry auto-discovery + CI gates to catch drift early
- **Tightening portability boundaries** — adapter-only UI imports and removal of per-component error-boundary wrappers
