# Generate Tool UI Command — Design Plan

## Overview

A Claude Code command (`/generate-tool-ui`) that creates complete Tool UI components through an interview-driven workflow, orchestrating 5 specialized subagents that handle distinct phases of component creation.

## Design Decisions (from interview)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Trigger workflow | Interview-driven | Claude gathers context before generating |
| Agent orchestration | Parallel where possible | designer → implementer → (examples ∥ documenter) → reviewer |
| Interview depth | Adaptive | Start minimal, probe deeper when complexity emerges |
| Preset approach | Mixed | Balance capability demos and realistic scenarios |
| Showcase addition | Curated | Only add visually distinctive components |
| Reviewer authority | Pragmatic | Block on functional issues; warn on pattern deviations |
| Pattern evolution | Propose upgrades | Create separate TODOs when improvements spotted |

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  /generate-tool-ui                                                          │
│                                                                             │
│  1. Launch designer agent (interviews user, produces design spec)           │
│                           ↓                                                 │
│  2. Launch implementer agent (creates component source files)               │
│                           ↓                                                 │
│  3. Launch in parallel:                                                     │
│     ├── examples agent (presets, showcase scene, gallery entry)             │
│     └── documenter agent (MDX, registry, preview-config, OG image)          │
│                           ↓                                                 │
│  4. Launch reviewer agent (quality gate)                                    │
│                           ↓                                                 │
│  5. Report completion or issues                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Agent Specifications

### 1. tool-ui:designer

**Purpose:** Interview user, explore codebase patterns, produce a design specification.

**Interview Strategy (Adaptive):**
- Start with core questions: name, purpose, primary use case
- Probe deeper if answers reveal:
  - Multiple variants or states
  - Complex data structures
  - User interaction patterns
  - Similarity to existing components
- Stop when sufficient clarity achieved

**Core Questions:**
1. What should this component be called?
2. In one sentence, what does it do?
3. What data does it display or collect?
4. What actions can users take?
5. Are there distinct states (loading, error, receipt/confirmed)?

**Conditional Deep-Dive:**
- If complex data: What's the shape? Nested objects? Arrays?
- If user actions: Destructive? Confirmation needed? Async?
- If similar to existing: Which component? What's different?
- If variants: Visual variants or behavioral variants?

**Exploration Tasks:**
- Search for similar patterns in `components/tool-ui/`
- Identify reusable schema patterns from `shared/schema.ts`
- Check if shadcn/ui prerequisites are already available
- Note accessibility patterns from comparable components

**Output:** Design spec document containing:
```markdown
## Component: {name}
### Purpose
{one-paragraph description}

### Props/Schema Design
{TypeScript interface or Zod schema outline}

### States
- Default: {description}
- Loading: {yes/no, behavior}
- Error: {yes/no, behavior}
- Receipt/Confirmed: {yes/no, behavior}

### Actions
- {action}: {behavior, async?, confirmation?}

### Variants
{if any}

### Accessibility Notes
{keyboard nav, ARIA, focus management}

### Similar Patterns
{references to existing components}

### Open Questions
{anything unresolved}
```

---

### 2. tool-ui:implementer

**Purpose:** Create all component source files following established patterns.

**Input:** Design spec from designer agent.

**Files Created:**
```
components/tool-ui/{name}/
  ├── _adapter.tsx      # Re-exports from @/components/ui
  ├── schema.ts         # Zod schema + types + parser
  ├── {name}.tsx        # Main component
  ├── error-boundary.tsx # Error handling wrapper
  └── index.tsx         # Barrel exports
```

**Pattern Sources (read these for reference):**
- `components/tool-ui/option-list/` — comprehensive example
- `components/tool-ui/shared/schema.ts` — shared schema utilities
- `components/tool-ui/shared/action-buttons.tsx` — if actions needed

**Implementation Checklist:**
- [ ] Schema uses `ToolUIIdSchema` and `ToolUIRoleSchema.optional()` (no `.default()`)
- [ ] `parseSerializable{Name}` function using `parseWithSchema` helper
- [ ] Root element has `data-tool-ui-id={id}` and `data-slot="{name}"`
- [ ] Loading state via `isLoading` prop with skeleton
- [ ] `className` is client-only prop (not in serializable schema)
- [ ] `responseActions` + `onResponseAction` naming if actions present
- [ ] ActionButtons wrapped in `<div className="@container/actions">` for responsive layout
- [ ] `onAction` handler always defined (wrap `onResponseAction?.()` in useCallback)
- [ ] Default actions provided when `responseActions` is undefined
- [ ] Error boundary wraps with fallback UI
- [ ] Exports: component, error boundary, schema, types, parser

**Schema Patterns (Critical):**
```typescript
// ✅ CORRECT - use plain .optional(), handle defaults in component
export const SerializableSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  title: z.string().optional(),
  // ...
});

// ❌ WRONG - .default() causes type issues in presets
role: ToolUIRoleSchema.optional().default("decision"),
```

**ActionButtons Pattern (Critical):**
```tsx
// Component must wrap ActionButtons for container queries
<div className="@container/actions">
  <ActionButtons actions={actions} onAction={handleAction} />
</div>

// Handler must always be defined (ActionButtons requires it)
const handleAction = useCallback(
  async (actionId: string) => {
    await onResponseAction?.(actionId);
  },
  [onResponseAction]
);
```

**Accessibility Requirements:**
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation for interactive elements
- Focus management for dynamic content
- `aria-busy` during loading states

---

### 3. tool-ui:examples

**Purpose:** Create compelling presets and showcase integrations.

**Input:** Implemented component from implementer agent.

**Tasks:**

#### A. Preset Creation (`lib/presets/{name}.ts`)
- Create 4-5 distinct presets following mixed approach:
  - 1-2 capability demos (show what it can do)
  - 2-3 realistic scenarios (show when you'd use it)
  - 1 edge case if applicable (destructive, empty state, max constraints)
- Each preset needs:
  - Descriptive key name (kebab-case, pattern-descriptive)
  - `description` string
  - `data` object matching serializable schema
  - `generateExampleCode(data)` function

**Preset Naming Guidelines:**
- Good: `max-selections`, `receipt`, `with-artwork`, `destructive`
- Bad: `example1`, `travel`, `my-use-case`

#### B. Showcase Scene (if visually distinctive)
- Evaluate: Does this component deserve landing page real estate?
- If yes, design scene for `app/components/home/chat-showcase.tsx`:
  - `userMessage`: Natural question a user would ask
  - `preamble`: Conversational assistant response
  - `toolUI`: Component with appropriate preset data
  - `toolFallbackHeight`: Estimated height for loading placeholder

#### C. Gallery Entry
- Select the most visually striking preset
- Add to `app/docs/gallery/page.tsx`
- Consider placement in masonry flow (does it span columns? break-inside-avoid?)

**Output:**
- `lib/presets/{name}.ts`
- Edits to `chat-showcase.tsx` (if warranted)
- Edits to `gallery/page.tsx`

---

### 4. tool-ui:documenter

**Purpose:** Create documentation and registry entries.

**Input:** Implemented component + presets.

**Files Created/Modified:**

#### A. Documentation Page
```
app/docs/{name}/
  ├── page.tsx           # Imports content.mdx
  ├── content.mdx        # Full documentation
  └── opengraph-image.tsx # OG image generator
```

**content.mdx Structure:**
```mdx
import { DocsHeader } from "../_components/docs-header";

<DocsHeader
  title="{Label}"
  description="{One-line description}"
  mdxPath="app/docs/{name}/content.mdx"
/>

<{Name}PresetExample preset="{default}" />

## Key Features

<FeatureGrid>
  <Feature icon="{icon}" title="{feature}">
    {description}
  </Feature>
  {/* 3-4 features */}
</FeatureGrid>

## {State/Variant Section if applicable}

{Explanation + preset example}

## Source and Install

{Copy instructions + prerequisites + directory structure + download links}

## Usage

{Code example with makeAssistantTool pattern}

## Props

<TypeTable type={{...}} />

## {Additional Schema sections if needed}

## Accessibility

{Keyboard nav, ARIA, focus management notes}
```

#### B. Registry Updates
- Add entry to `lib/docs/component-registry.ts`
- Add preview config to `lib/docs/preview-config.tsx`

#### C. OG Image
- Create `opengraph-image.tsx` using shared generator

**Output:**
- Complete docs directory
- Updated registry files

---

### 5. tool-ui:reviewer

**Purpose:** Quality gate before declaring component complete.

**Checks (in order):**

#### Hard Gates (block on failure)
1. `pnpm typecheck` passes
2. `pnpm lint` passes (or `lint:fix` applied)
3. All required files exist
4. Exports are correct in index.tsx
5. Component renders without runtime errors

#### Warnings (report but don't block)
1. Pattern deviations from conventions
2. Missing optional features (e.g., no loading state)
3. Suboptimal accessibility patterns
4. Preset quality (too similar, unclear purpose)
5. Documentation gaps

#### Pattern Upgrade Proposals
When the reviewer spots an opportunity to improve library-wide conventions:
- Create a TODO item or proposal note
- Don't apply changes to other components
- Format: "PATTERN PROPOSAL: {description of improvement}"

**Output:**
- Pass/Fail status
- List of warnings (if any)
- Pattern upgrade proposals (if any)
- Summary of what was created

---

## Main Command Structure

**File:** `.claude/commands/generate-tool-ui.md`

```markdown
---
description: Generate a complete Tool UI component with docs and examples
---

# Generate Tool UI

Create a new Tool UI component: $ARGUMENTS

## Workflow

This command orchestrates 5 specialized agents:

1. **Designer** — Interviews you to understand the component
2. **Implementer** — Creates component source files
3. **Examples** — Curates presets and showcase entries
4. **Documenter** — Writes documentation and registry entries
5. **Reviewer** — Quality checks before completion

## Instructions

1. Launch the designer agent to interview the user
2. Wait for design spec completion
3. Launch implementer agent with the design spec
4. Once implementation complete, launch examples and documenter in parallel
5. Once both complete, launch reviewer agent
6. Report final status to user

{Detailed agent invocation instructions}
```

---

## Agent File Locations

```
.claude/
  ├── commands/
  │   └── generate-tool-ui.md      # Main orchestrator
  └── agents/
      ├── tool-ui-designer.md      # Discovery & design
      ├── tool-ui-implementer.md   # Source file creation
      ├── tool-ui-examples.md      # Presets & showcase
      ├── tool-ui-documenter.md    # Docs & registry
      └── tool-ui-reviewer.md      # Quality gate
```

---

## Reference Patterns

When implementing agents, use these as primary references:

| Concern | Reference File |
|---------|---------------|
| Component structure | `components/tool-ui/option-list/` |
| Schema patterns | `components/tool-ui/shared/schema.ts` |
| Preset format | `lib/presets/option-list.ts` |
| Docs structure | `app/docs/option-list/content.mdx` |
| Preview config | `lib/docs/preview-config.tsx` |
| Showcase scenes | `app/components/home/chat-showcase.tsx` |
| Gallery layout | `app/docs/gallery/page.tsx` |
| OG image | `app/docs/option-list/opengraph-image.tsx` |

---

## Open Questions / Future Enhancements

1. **Iteration support**: How should `/generate-tool-ui` handle "redo just the presets" requests? Separate commands or flags?

2. **Partial runs**: If reviewer finds issues, should it auto-fix or report back for manual intervention?

3. **Component variants**: Some components have sub-components (e.g., Citation + CitationList). How should the designer handle these?

4. **Testing**: Should implementer create test files? What testing patterns exist in the project?

5. **Changelog**: Should documenter update a changelog or release notes?

---

## Success Criteria

A successful `/generate-tool-ui` run produces:

- [ ] Complete component directory with all standard files
- [ ] 4-5 high-quality presets demonstrating distinct capabilities
- [ ] Full documentation page following existing patterns
- [ ] Component registry and preview config entries
- [ ] OpenGraph image
- [ ] Gallery entry with visually appropriate preset
- [ ] Showcase scene (if component is visually distinctive)
- [ ] Clean lint and typecheck
- [ ] Pattern upgrade proposals (if spotted)
