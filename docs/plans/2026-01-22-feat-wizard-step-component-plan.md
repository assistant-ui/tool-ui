---
title: "feat: Add WizardStep Component"
type: feat
date: 2026-01-22
---

# WizardStep Component

## Overview

A component for AI-controlled configuration wizards where users make sequential choices. Supports two modes in a single component:

1. **Progressive mode** — AI generates each step dynamically based on previous answers
2. **Upfront mode** — All steps defined ahead of time, component manages navigation

Both modes share the same visual design: clean, focused, one step at a time.

## Problem Statement / Motivation

Existing Tool UI components don't cover multi-step decision flows:

- **OptionList** — Single decision, no wizard context or step awareness
- **Plan** — Shows all steps at once, status-focused, not for collecting input
- **PreferencesPanel** — Flat settings, not sequential/branching

Using multiple OptionList calls in sequence is visually noisy and lacks:
- Step context/framing ("Step 2 of 4")
- Progress awareness
- Back/undo capability
- Unified schema for the AI

## Proposed Solution

A single `WizardStep` component with two modes controlled by props:

### Progressive Mode (AI-controlled)

```tsx
<WizardStep
  id="database-type"
  step={2}
  title="Select database type"
  description="Choose the database that best fits your needs"
  options={[
    { id: "postgres", label: "PostgreSQL", description: "Open source, feature-rich" },
    { id: "mysql", label: "MySQL", description: "Widely supported" },
  ]}
  onSelect={(optionId) => { /* AI generates next step */ }}
  onBack={() => { /* AI shows previous step */ }}
/>
```

### Upfront Mode (Component-managed)

```tsx
<WizardStep
  id="project-setup"
  steps={[
    {
      id: "language",
      title: "Pick a language",
      options: [
        { id: "python", label: "Python" },
        { id: "typescript", label: "TypeScript" },
      ],
    },
    {
      id: "framework",
      title: "Pick a framework",
      options: [
        { id: "fastapi", label: "FastAPI" },
        { id: "django", label: "Django" },
      ],
    },
  ]}
  onComplete={(answers) => {
    // answers: { language: "python", framework: "fastapi" }
  }}
/>
```

### Receipt State

```tsx
<WizardStep
  id="project-setup"
  choice={{
    title: "Configuration complete",
    summary: [
      { label: "Language", value: "Python" },
      { label: "Framework", value: "FastAPI" },
    ],
  }}
/>
```

## Technical Approach

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Component count | One unified component | Simpler API, discriminated union types handle mode switching |
| Forward navigation (upfront) | Explicit Next button | Matches OptionList pattern, allows correction before proceeding |
| Back behavior (progressive) | Clear subsequent answers | AI needs to re-generate based on new selection |
| Back behavior (upfront) | Preserve all answers | Linear flow, no branching, answers remain valid |
| Selection mode | Per-step configurable | Steps can be single or multi-select via `selectionMode` prop |
| Progress display | Show "Step N of M" in upfront, "Step N" in progressive | Users need orientation |

### File Structure

```
components/tool-ui/wizard-step/
├── index.tsx           # Barrel exports
├── wizard-step.tsx     # Main component (progressive + upfront modes)
├── schema.ts           # Zod schemas + SerializableWizardStep type
├── _adapter.tsx        # shadcn re-exports
└── error-boundary.tsx  # Error boundary wrapper
```

### Schema Design

**Note:** Uses structural discrimination (like OptionList) rather than explicit `mode` field. Mode is inferred from which props are present: `step` → progressive, `steps` → upfront, `choice` → receipt.

```typescript
// schema.ts

// Shared option schema (reuse from OptionList pattern)
const WizardOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  disabled: z.boolean().optional(),
});

// Step definition (for upfront mode)
const WizardStepDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(WizardOptionSchema).min(1),
  selectionMode: z.enum(["single", "multi"]).optional(), // defaults to "single"
});

// Receipt summary item
const WizardSummaryItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

// Receipt state
const WizardChoiceSchema = z.object({
  title: z.string().min(1),
  summary: z.array(WizardSummaryItemSchema).min(1),
});

// Base props shared by all modes
const BaseSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
});

// Progressive mode props (single step, AI-controlled)
const ProgressiveModeSchema = BaseSchema.extend({
  step: z.number().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(WizardOptionSchema).min(1),
  selectionMode: z.enum(["single", "multi"]).optional(),
  // Mutually exclusive markers
  steps: z.undefined().optional(),
  choice: z.undefined().optional(),
});

// Upfront mode props (all steps defined, component manages)
const UpfrontModeSchema = BaseSchema.extend({
  steps: z.array(WizardStepDefinitionSchema).min(1),
  // Mutually exclusive markers
  step: z.undefined().optional(),
  choice: z.undefined().optional(),
});

// Receipt mode props
const ReceiptModeSchema = BaseSchema.extend({
  choice: WizardChoiceSchema,
  // Mutually exclusive markers
  step: z.undefined().optional(),
  steps: z.undefined().optional(),
});

// Combined schema using z.union (structural discrimination)
const SerializableWizardStepSchema = z.union([
  ProgressiveModeSchema,
  UpfrontModeSchema,
  ReceiptModeSchema,
]);
```

**Why structural discrimination?**
- Matches existing Tool UI patterns (OptionList uses `choice` presence, not a `mode` field)
- Simpler for AI to generate (no extra `mode` field to remember)
- TypeScript narrows types correctly via `"step" in props` checks

### Props Interface

**Note:** Answers are always stored/returned as `string[]` internally, even for single-select (normalized). This avoids type ambiguity for consumers.

```typescript
// Base props for runtime
interface BaseRuntimeProps {
  className?: string;
  isLoading?: boolean;
}

// Progressive mode callbacks
interface WizardStepProgressiveProps extends BaseRuntimeProps {
  id: string;
  step: number;
  title: string;
  description?: string;
  options: WizardOption[];
  selectionMode?: "single" | "multi";
  onSelect?: (optionIds: string[]) => void | Promise<void>; // Always array
  onBack?: () => void;
  // Structural discrimination markers (TypeScript only)
  steps?: never;
  choice?: never;
}

// Upfront mode callbacks
interface WizardStepUpfrontProps extends BaseRuntimeProps {
  id: string;
  steps: WizardStepDefinition[];
  onStepChange?: (stepId: string) => void; // Just navigation event
  onComplete?: (answers: Record<string, string[]>) => void | Promise<void>; // Always arrays
  // Structural discrimination markers (TypeScript only)
  step?: never;
  choice?: never;
}

// Receipt mode
interface WizardStepReceiptProps {
  id: string;
  choice: WizardChoice;
  className?: string;
  // Structural discrimination markers (TypeScript only)
  step?: never;
  steps?: never;
}

// Union type with structural discrimination
type WizardStepProps =
  | WizardStepProgressiveProps
  | WizardStepUpfrontProps
  | WizardStepReceiptProps;
```

**Key changes from review feedback:**
1. `onSelect` always receives `string[]` (normalized) - single-select returns `["selected-id"]`
2. `onComplete` answers are `Record<string, string[]>` - consistent type, no union
3. `onStepChange` simplified to just navigation event (step ID only)
4. Added `never` markers for TypeScript structural discrimination

### Component Structure

```tsx
// wizard-step.tsx

function WizardStep(props: WizardStepProps) {
  // Mode detection
  if ("choice" in props) {
    return <WizardStepReceipt {...props} />;
  }

  if ("steps" in props) {
    return <WizardStepUpfront {...props} />;
  }

  return <WizardStepProgressive {...props} />;
}

// Progressive mode: renders single step
function WizardStepProgressive({ ... }: WizardStepProgressiveProps) {
  // Internal selection state
  // Option rendering (similar to OptionList)
  // Back/Next action buttons
}

// Upfront mode: manages step navigation internally
function WizardStepUpfront({ ... }: WizardStepUpfrontProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  // Step navigation with preserved answers
  // Final step shows "Complete" instead of "Next"
}

// Receipt: read-only summary
function WizardStepReceipt({ ... }: WizardStepReceiptProps) {
  // Summary display with check icon
}
```

### UI Layout

```
┌─────────────────────────────────────────┐
│ Step 2 of 4                             │  <- Progress (upfront) or "Step 2" (progressive)
├─────────────────────────────────────────┤
│ Select database type                    │  <- Title
│ Choose the database that best fits...   │  <- Description (optional)
├─────────────────────────────────────────┤
│ ○ PostgreSQL                            │  <- Options (radio/checkbox based on selectionMode)
│   Open source, feature-rich             │
│                                         │
│ ○ MySQL                                 │
│   Widely supported                      │
│                                         │
│ ○ SQLite                                │
│   Embedded, zero config                 │
├─────────────────────────────────────────┤
│                        [Back] [Next]    │  <- Action buttons
└─────────────────────────────────────────┘
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Up/Down | Move focus between options |
| Space/Enter | Toggle/select focused option |
| Escape | Cancel (if onCancel provided) |
| Tab | Move to action buttons |

### Accessibility

- `role="form"` on outer container
- `aria-labelledby` pointing to step title
- `aria-describedby` pointing to step description
- Step progress announced: `aria-label="Step 2 of 4"`
- Focus moves to first option on step transition
- Live region announces step changes

### Animation

- Step transitions: `motion-safe:animate-[fade-blur-in_300ms]`
- Option selection: subtle highlight transition
- Receipt entrance: same fade-blur pattern as other components

## Acceptance Criteria

### Functional Requirements

- [ ] Progressive mode renders single step with title, description, options
- [ ] Progressive mode calls `onSelect` with option ID(s) when user confirms
- [ ] Progressive mode calls `onBack` when user clicks Back
- [ ] Progressive mode hides Back button on step 1
- [ ] Upfront mode renders steps array with internal navigation
- [ ] Upfront mode shows progress indicator ("Step N of M")
- [ ] Upfront mode preserves answers when navigating back
- [ ] Upfront mode calls `onComplete` with all answers on final step confirm
- [ ] Receipt state shows summary with title and key-value pairs
- [ ] Single-select mode allows exactly one selection
- [ ] Multi-select mode allows multiple selections
- [ ] `isLoading` prop shows skeleton state

### Non-Functional Requirements

- [ ] Keyboard fully accessible (arrow keys, enter, escape)
- [ ] Screen reader announces step progress
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Component width follows Tool UI standards (`min-w-80 max-w-md`)

### Quality Gates

- [ ] Schema validates correctly with Zod
- [ ] TypeScript discriminated union prevents invalid prop combinations
- [ ] Unit tests for mode detection and navigation
- [ ] Visual regression tests for all states
- [ ] Lighthouse accessibility score 100

## Implementation Phases

### Phase 1: Foundation

**Files:**
- `components/tool-ui/wizard-step/schema.ts`
- `components/tool-ui/wizard-step/_adapter.tsx`
- `components/tool-ui/wizard-step/index.tsx`

**Tasks:**
- [ ] Create schema with discriminated union for modes
- [ ] Define TypeScript types for all props
- [ ] Create parseSerializableWizardStep function
- [ ] Set up adapter with shadcn re-exports
- [ ] Create barrel exports

### Phase 2: Progressive Mode

**Files:**
- `components/tool-ui/wizard-step/wizard-step.tsx`

**Tasks:**
- [ ] Implement WizardStepProgressive component
- [ ] Render step title, description, options
- [ ] Implement single-select option interaction
- [ ] Implement multi-select option interaction
- [ ] Add Back/Next action buttons
- [ ] Wire up onSelect, onBack, onCancel callbacks
- [ ] Add keyboard navigation (arrows, enter, escape)
- [ ] Add loading skeleton state

### Phase 3: Upfront Mode

**Files:**
- `components/tool-ui/wizard-step/wizard-step.tsx`

**Tasks:**
- [ ] Implement WizardStepUpfront component
- [ ] Add internal step navigation state
- [ ] Add answers accumulation state
- [ ] Implement Back navigation (preserves answers)
- [ ] Implement Next navigation
- [ ] Show "Complete" on final step
- [ ] Wire up onStepChange, onComplete callbacks
- [ ] Add step progress indicator ("Step N of M")

### Phase 4: Receipt State

**Files:**
- `components/tool-ui/wizard-step/wizard-step.tsx`

**Tasks:**
- [ ] Implement WizardStepReceipt component
- [ ] Render summary title with check icon
- [ ] Render key-value summary items
- [ ] Add fade-blur-in animation

### Phase 5: Error Boundary & Polish

**Files:**
- `components/tool-ui/wizard-step/error-boundary.tsx`
- `components/tool-ui/wizard-step/wizard-step.tsx`

**Tasks:**
- [ ] Create WizardStepErrorBoundary
- [ ] Add ARIA labels and live regions
- [ ] Ensure focus management on step transitions
- [ ] Add motion-safe animations
- [ ] Final accessibility audit

### Phase 6: Documentation & Presets

**Files:**
- `lib/presets/wizard-step.ts`
- `lib/docs/component-registry.ts`
- `lib/docs/preview-config.tsx`
- `app/docs/wizard-step/content.mdx`

**Tasks:**
- [ ] Create 4-5 presets (project setup, database selection, deployment config, etc.)
- [ ] Add to component registry
- [ ] Configure preview rendering
- [ ] Write documentation page

## Review Feedback & Decisions

Plan reviewed by DHH, Kieran (TypeScript), and Simplicity reviewers. Key feedback addressed:

| Concern | Decision |
|---------|----------|
| **DHH: Two modes is over-engineered** | Keeping both modes per user preference. Upfront mode serves use cases where AI provides complete wizard definition. |
| **Kieran: Discriminated union incorrectly structured** | Fixed. Now uses structural discrimination (matching OptionList pattern) instead of explicit `mode` field. |
| **Kieran: Answer type ambiguity (`string \| string[]`)** | Fixed. Normalized to always `string[]` internally and in callbacks. |
| **Kieran: `onStepChange` signature too broad** | Fixed. Simplified to `(stepId: string) => void` - just navigation event. |
| **Simplicity: Remove `totalSteps`** | Kept but made truly optional. Progressive mode can work without it. |
| **Simplicity: Remove `defaultValue`** | Removed from plan. Add in v2 if needed. |
| **Simplicity: Remove `onCancel`** | Removed from plan. Add in v2 if needed. |

**Deferred to v2:**
- `defaultValue` / `defaultAnswers` props
- `onCancel` callback
- Controlled navigation in upfront mode
- Per-step validation (minSelections)

## Dependencies & Prerequisites

- Existing shared utilities: `ActionButtons`, `useActionButtons`, schema helpers
- OptionList patterns for option rendering and keyboard navigation
- No external dependencies beyond existing shadcn/ui stack

## Risk Analysis & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TypeScript discriminated union complexity | Medium | Medium | Start with simpler union, iterate |
| Upfront mode state management edge cases | Medium | Medium | Write comprehensive tests for navigation |
| Focus management between steps | Low | Medium | Follow OptionList patterns closely |
| Schema validation edge cases | Low | Low | Extensive Zod schema tests |

## References

### Internal References

- Component workflow guide: `.claude/docs/component-workflow.md`
- OptionList implementation: `components/tool-ui/option-list/option-list.tsx`
- ApprovalCard receipt pattern: `components/tool-ui/approval-card/approval-card.tsx:22-78`
- Keyboard navigation: `components/tool-ui/option-list/option-list.tsx:465-527`
- Shared action buttons: `components/tool-ui/shared/action-buttons.tsx`

### Design Documents

- Brainstorm: `docs/brainstorms/2026-01-22-wizard-step-brainstorm.md`

### Related Patterns

- ProgressTracker for step visualization
- PreferencesPanel for form-like interactions
- Plan for multi-item workflows
