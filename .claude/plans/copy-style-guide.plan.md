# Copy Style Guide Plan

## Goal

Create a comprehensive style guide for Tool UI example copy that ensures all preset data, showcase scenes, and chat bubbles feel like real, believable interactions. The guide serves two audiences:
1. Human collaborators adding or modifying components
2. Claude agents (especially /generate-tool-ui) creating new components

## Decisions from Interview

| Decision | Choice |
|----------|--------|
| Assistant voice | Adaptive to context—professional for business, casual for personal |
| User persona | Deliberately diverse—different people in different scenes |
| "Clever" means | Thoughtful specificity: real names, plausible numbers, believable scenarios |
| Realism standard | Same bar for presets and showcase—every example should feel like a real use case |
| What to keep | Nothing sacred—full review of all existing copy |
| Anti-patterns | Generic placeholders, mismatched stakes, tech demo smell |

## Deliverables

### 1. Copy Style Guide (`/.claude/docs/copy-guide.md`)

**Structure:**

```
# Tool UI Copy Style Guide

## Core Principle
[One sentence: every example should pass the "would someone actually do this?" test]

## Voice Guidelines
- Adaptive tone (professional ↔ casual based on context)
- When to be terse vs. conversational
- Examples of good/bad assistant responses

## Scenario Selection
- The believability test
- Matching stakes to UI treatment
- Diverse personas across examples

## Specificity Standards
- Use real names, products, numbers
- Plausible data that could exist
- Details that ground the scenario

## Anti-Patterns (with examples)
- Generic placeholder data
- Mismatched stakes
- Tech demo smell
- Scenarios that don't map to real behavior

## Component-Specific Guidance
[Per-component notes where needed]

## Checklist
[Quick validation checklist for new copy]
```

### 2. Agent-Embeddable Version

A condensed version (~500 words) suitable for embedding in:
- `/.claude/agents/tool-ui-examples.md`
- `/.claude/agents/tool-ui-designer.md`

This version distills the guide into actionable rules an agent can follow without extensive context.

### 3. Audit of Existing Copy

After the guide is written, systematically review:
- **Showcase scenes** (10 scenes in `chat-showcase.tsx`)
- **Preset files** (18 files in `lib/presets/`)
- **Mock data** (`lib/mocks/chat-showcase-data.ts`)

For each, identify:
- What works (keep or refine)
- What violates the guide (rewrite)
- Opportunities for better scenarios

## Execution Sequence

### Phase 1: Write the Guide
1. Draft core principles and voice guidelines
2. Document anti-patterns with concrete examples from current copy
3. Write specificity standards
4. Create the validation checklist
5. Review and tighten

### Phase 2: Create Agent Version
1. Distill guide into essential rules
2. Format for embedding in agent prompts
3. Test by having Claude evaluate a few existing presets against it

### Phase 3: Audit Current Copy
1. Showcase scenes (highest visibility)
2. Presets by component, prioritizing:
   - Components with weak/generic examples
   - Components featured prominently in docs
3. Document proposed changes before implementing

### Phase 4: Apply Changes
1. Rewrite showcase scenes
2. Rewrite presets that fail the guide
3. Update mock data as needed
4. Verify all examples still demonstrate intended component capabilities

## Current Copy Issues (Examples)

These emerged during the interview and exploration:

**Showcase:**
- "Draft a review for that ramen place" → X post draft. Not believable—who does this?
- Some preambles too terse ("Here's a draft:"), others chatty ("On it!")—inconsistent voice

**Presets:**
- Chart `minimal` preset: `{ category: "A", value: 100 }` — pure placeholder
- CodeBlock `collapsible`: 30 lines of `console.log("Line N")` — tech demo, not real
- Some presets excellent (ItemCarousel with real TV shows, DataTable with computing history theme)

**Opportunities:**
- DataTable has a fun vintage computing theme (Grace, Dennis, Ken) but it's isolated—could be a deliberate choice or inconsistency
- ItemCarousel albums use real Apple Music artwork—good specificity

## Success Criteria

- [ ] Guide is clear enough that a new contributor could write copy matching existing quality
- [ ] Agent version is concise enough to embed without bloating prompts
- [ ] All showcase scenes pass the believability test
- [ ] All presets demonstrate real use cases (not just capabilities)
- [ ] Copy feels consistent in quality, diverse in scenarios
- [ ] No generic placeholders, mismatched stakes, or tech demo smell remains

## Open Questions

1. **The vintage computing theme in DataTable**—intentional flavor to keep, or incidental? (User said everything's fair game, so probably rethink)
2. **Preset naming**—current names are capability-focused (`with-actions`, `collapsible`). Should they hint at scenarios instead?
3. **How much rewriting is too much?**—some presets are fine, some need total replacement. Trust judgment per-case.
