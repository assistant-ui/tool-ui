---
description: Generate a complete Tool UI component with docs and examples
---

# Generate Tool UI

Create a new Tool UI component through an interview-driven workflow.

## Arguments

$ARGUMENTS

If no arguments provided, start with the designer interview. If a component name is provided, use it as a starting point.

## Workflow

This command orchestrates 5 specialized agents in sequence:

```
designer → implementer → (examples ∥ documenter) → reviewer
```

## Execution Steps

### Step 1: Design Phase

Launch the `tool-ui-designer` agent to interview the user and produce a design specification.

```
Use Task tool with subagent_type="tool-ui-designer"
Prompt: "Interview the user to design a new Tool UI component. {Include $ARGUMENTS context if provided}"
```

Wait for the design spec to be complete before proceeding.

### Step 2: Implementation Phase

Launch the `tool-ui-implementer` agent with the design spec.

```
Use Task tool with subagent_type="tool-ui-implementer"
Prompt: "Implement the component based on this design spec: {design_spec}"
```

Wait for implementation to complete before proceeding.

### Step 3: Examples & Documentation Phase (Parallel)

Launch both agents simultaneously:

```
Use Task tool with subagent_type="tool-ui-examples"
Prompt: "Create presets and showcase entries for {component_name}"

Use Task tool with subagent_type="tool-ui-documenter"
Prompt: "Create documentation for {component_name}"
```

Both can run in parallel since they only read the implemented component.

### Step 4: Review Phase

Launch the `tool-ui-reviewer` agent.

```
Use Task tool with subagent_type="tool-ui-reviewer"
Prompt: "Review the {component_name} component for quality and pattern compliance"
```

### Step 5: Report Results

Summarize what was created:
- Component files created
- Presets created
- Documentation added
- Showcase/gallery entries (if any)
- Any warnings or pattern upgrade proposals from reviewer

## Notes

- If any phase fails, report the issue and ask user how to proceed
- The designer uses adaptive interviewing—it will ask more questions if complexity emerges
- The examples agent will only add to the landing showcase if the component is visually distinctive
- The reviewer blocks on functional issues (lint/types) but only warns on style deviations

## Critical Registration Points (Often Missed!)

The documenter agent must update ALL of these files for a component to work fully:

| File | Purpose | What happens if missed |
|------|---------|------------------------|
| `lib/docs/component-registry.ts` | Component metadata | Component won't appear in nav |
| `lib/docs/preview-config.tsx` | Interactive preview config + ComponentId type | Examples tab won't render |
| `app/docs/_components/preset-selector.tsx` | PRESET_REGISTRY mapping | Examples tab shows empty/wrong presets |
| `app/docs/{name}/page.tsx` | Uses `ComponentDocsTabs` wrapper | Broken layout, missing Examples tab |

## Documentation Patterns

### Page Structure
- `page.tsx` MUST use `ComponentDocsTabs` with `docs` and `examples` props
- Do NOT return `<Content />` directly - this breaks the layout

### Content.mdx Patterns
- **DocsHeader description must be ultra-concise** (5-6 words max). Examples:
  - ✅ "Binary confirmation for agent actions."
  - ✅ "Provide single or multi-select choices."
  - ✅ "Itemized purchase confirmation with pricing."
  - ❌ "Display agent-suggested purchases with itemized pricing for user confirmation."
- Use inline `<Tabs items={["Preview", "Code"]}>` for the hero example
- Do NOT use PresetExample components throughout docs
- Rely on the Examples tab for preset exploration
- Keep docs concise; one hero example is sufficient

### Icon Registration
- Icons used in `<FeatureGrid>` must exist in `app/components/mdx/features.tsx` ICON_MAP
- Missing icons fall back to HelpCircle but should be added

## Lessons Learned

1. **Always verify the Examples tab works** - check preset-selector.tsx has the registry entry
2. **Test the built page** - layout issues aren't caught by build/lint
3. **Follow existing patterns exactly** - compare with audio.mdx for content structure
4. **Run the full checklist** in the documenter agent before declaring completion

## Implementation Patterns (Critical!)

### ResponseActions & ActionButtons

Components with CTAs (confirm, cancel, submit, etc.) MUST follow the responseActions pattern:

1. **Accept `responseActions` and `onResponseAction` props** - use standard naming
2. **Wrap ActionButtons in `@container/actions`** - enables responsive container queries:
   ```tsx
   <div className="@container/actions">
     <ActionButtons actions={actions} onAction={handleAction} />
   </div>
   ```
3. **Create a handler function** - ActionButtons requires `onAction` to be defined:
   ```tsx
   const handleAction = useCallback(
     async (actionId: string) => {
       await onResponseAction?.(actionId);
     },
     [onResponseAction]
   );
   ```
4. **Provide default actions** when `responseActions` is not passed

### Zod Schema Patterns

**Never use `.default()` on schema fields** - it changes the output type and causes TypeScript errors in presets:

```tsx
// ❌ BAD - causes type errors in presets
role: ToolUIRoleSchema.optional().default("decision"),
title: z.string().optional().default("Order Summary"),

// ✅ GOOD - handle defaults in component props
role: ToolUIRoleSchema.optional(),
title: z.string().optional(),

// Then in component:
export function MyComponent({ title = "Default Title", ...props }) { }
```

### Container Query Classes

The component must provide container context for ActionButtons' responsive styles:
- ActionButtons uses `@sm/actions:flex-row`, `@sm/actions:w-auto`, etc.
- These require a parent with `@container/actions` class

### Loading States & Component Lifecycle

**Understand when Tool UI components render:**

```
1. User sends message
2. AI streams response...
3. AI decides to call a tool
4. Tool executes → returns payload
5. Tool UI component renders WITH the payload
```

The component only mounts **after** the tool call completes. There's no moment where we render a Tool UI without its data—the payload is what triggers the render.

**What this means for loading states:**

| Scenario | Appropriate? | Notes |
|----------|--------------|-------|
| Full skeleton while "waiting for data" | ❌ No | Component doesn't exist until data arrives |
| Loading after user action (e.g., clicked "Purchase") | ✅ Yes | `isLoading` prop for post-interaction feedback |
| Image placeholders while URLs load | ✅ Yes | Browser handles natively, optional shimmer |
| Streaming partial tool results | ⚠️ Rare | Some frameworks support this, but uncommon |

**Guidelines:**
- Don't create "loading" presets that show full skeletons—they don't reflect real usage
- Use `isLoading` prop for feedback after user interactions, not initial render
- External URLs (images, etc.) load async naturally; consider placeholder styling if needed
- The `{Name}Progress` skeleton component is rarely needed in practice
