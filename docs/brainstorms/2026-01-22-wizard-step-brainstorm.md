# WizardStep Component Brainstorm

**Date:** 2026-01-22
**Status:** Ready for planning

## What We're Building

A component for AI-controlled configuration wizards where users make sequential choices that can branch based on previous answers.

### Core Concept

WizardStep presents one question at a time in a wizard flow. It supports two modes:

1. **Progressive mode** — AI generates each step dynamically based on previous answers
2. **Upfront mode** — All steps defined ahead of time, component manages navigation

Both modes share the same visual design: clean, focused, one step at a time.

### Key Characteristics

- **AI controls the flow** in progressive mode
- **Component manages navigation** in upfront mode (instant back/forward)
- **Choices only** — each step is multiple-choice (like OptionList)
- **Just current step visible** — previous context handled by AI, not cluttering UI
- **Final configuration summary** as receipt state

## Why This Approach

### Gap Analysis

Existing components don't cover this use case well:

- **OptionList** — Single decision, no wizard context or step awareness
- **Plan** — Shows all steps at once, status-focused, not for collecting input
- **PreferencesPanel** — Flat settings, not sequential/branching

Using multiple OptionList calls in sequence is visually noisy and lacks:
- Step context/framing ("Step 2 of 4")
- Progress awareness
- Back/undo capability
- Unified schema for the AI

### Single Component, Two Modes

The UI is nearly identical between modes—both show one step at a time. The difference is in how content is determined and who controls navigation:

| Aspect | Progressive Mode | Upfront Mode |
|--------|------------------|--------------|
| Steps defined | One at a time by AI | All upfront |
| Total steps | Unknown (`totalSteps` omitted) | Known (`totalSteps={5}`) |
| Navigation | AI controls | Component manages |
| Back button | Triggers `onBack` callback | Works instantly |
| Branching | AI decides next step | Linear or predefined branches |

## Key Decisions

1. **Named `WizardStep`** — Clear metaphor, familiar pattern

2. **Variant-based design** — One component with two modes, not separate components

3. **Choices-only scope** — Each step is multiple-choice. Complex inputs (text, dates) are out of scope for v1.

4. **Receipt state** — Shows final configuration summary with all collected answers

5. **No visible history** — Previous steps not shown in UI. AI tracks context.

## API Sketch

### Progressive Mode (AI-controlled)

```tsx
<WizardStep
  id="database-type"
  step={2}
  // totalSteps omitted = progressive mode
  title="Select database type"
  description="Choose the database that best fits your needs"
  options={[
    { id: "postgres", label: "PostgreSQL", description: "Open source, feature-rich" },
    { id: "mysql", label: "MySQL", description: "Widely supported" },
    { id: "sqlite", label: "SQLite", description: "Embedded, zero config" },
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
    // ...more steps
  ]}
  onComplete={(answers) => {
    // answers: { language: "python", framework: "fastapi", ... }
  }}
/>
```

### Receipt State

```tsx
<WizardStep
  id="project-setup"
  complete={{
    title: "Configuration complete",
    summary: [
      { label: "Language", value: "Python" },
      { label: "Framework", value: "FastAPI" },
      { label: "Database", value: "PostgreSQL" },
    ],
  }}
/>
```

## Open Questions

1. **Branching in upfront mode** — Should steps support conditional `next` logic, or is that only for progressive mode?

2. **Step validation** — Should options support disabling based on previous answers?

3. **Skip logic** — Can steps be skipped? What happens to those answers?

4. **Animation** — Transition between steps? Slide left/right?

5. **Keyboard shortcuts** — Arrow keys to navigate options, Enter to select, Escape to go back?

## Success Criteria

- AI can define a multi-step wizard and receive structured configuration output
- Users can navigate back without AI roundtrip (in upfront mode)
- Visual design clearly communicates "you're in a wizard, step N of M"
- Receipt state shows clear summary of all decisions made
- Works well in AI assistant chat interfaces (not too wide, readable)

## Next Steps

Run `/workflows:plan` to design the implementation.
