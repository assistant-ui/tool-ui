# Knowledge Manifest
<!-- Auto-generated. Source: CLAUDE.md, .claude/docs/, .claude/agents/ -->
<!-- @task:any @load:CLAUDE.md -->

## Task → Knowledge Map

| When working on... | Load | Search |
|-------------------|------|--------|
| New component | `.claude/compiled/component-creation.md` | component, schema, props |
| Component API design | `.claude/agents/tool-ui-designer.md` | interview, spec, design |
| Implementing component | `.claude/agents/tool-ui-implementer.md` | schema, pattern, export |
| Writing presets | `.claude/compiled/presets.md` | preset, example, scenario |
| Writing docs | `.claude/agents/tool-ui-documenter.md` | mdx, registry, preview |
| Copy/examples | `.claude/docs/copy-guide.md` | preamble, believable, voice |
| MDX authoring | `.claude/docs/mdx-authoring.md` | mdx, table, prose |
| Code review | `.claude/agents/tool-ui-reviewer.md` | lint, pattern, checklist |
| Full component workflow | `.claude/commands/generate-tool-ui.md` | workflow, agent, phase |

## Quick Reference

### Commands
| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint:fix` | Fix lint errors (pre-commit) |
| `pnpm typecheck` | TypeScript checking |
| `pnpm test` | Run tests (Vitest) |

### Key Paths
| Path | Contents |
|------|----------|
| `components/tool-ui/{name}/` | Component source |
| `components/tool-ui/shared/` | Shared utilities |
| `lib/presets/{name}.ts` | Example presets |
| `lib/docs/component-registry.ts` | Component metadata |
| `lib/docs/preview-config.tsx` | Preview rendering |
| `app/docs/{name}/` | Documentation pages |
| `app/docs/gallery/page.tsx` | Gallery page |

### Component File Structure
```
components/tool-ui/{name}/
├── index.tsx       # Barrel exports
├── {name}.tsx      # Main component
├── schema.ts       # Zod schema + types
├── _adapter.tsx    # shadcn re-exports
└── error-boundary.tsx
```

### Required Exports
```typescript
export { Name, NameProgress } from "./name";
export { NameErrorBoundary } from "./error-boundary";
export {
  SerializableNameSchema,
  parseSerializableName,
  type SerializableName,
  type NameProps,
} from "./schema";
```

## Critical Rules

### Schema Rules
- Use `ToolUIIdSchema` for `id` field
- Use plain `.optional()` — **NEVER `.default()`** (breaks preset types)
- Handle defaults in component props destructuring
- `className` is client-only, never in serializable schema

### Component Structure
- Root: `<article data-slot="{name}" data-tool-ui-id={id}>`
- Standard widths: `min-w-80 max-w-md` (cards), `max-w-sm` (compact)
- Loading: `aria-busy="true"` on skeleton
- Actions: `responseActions` / `onResponseAction` props

### ActionButtons Pattern
```tsx
<div className="@container/actions">
  <ActionButtons actions={actions} onAction={handleAction} />
</div>
```

### Unified Receipt Rendering
- **ONE component** handles both interactive and receipt states
- Use `isReceipt` flag, NOT separate rendering functions
- Prevents spacing/typography drift between states

### Registration Checklist (All Required!)
| File | What to add | Failure mode |
|------|-------------|--------------|
| `lib/docs/component-registry.ts` | Component entry | Not in nav |
| `lib/docs/preview-config.tsx` | Config + ComponentId type | Examples tab broken |
| `app/docs/_components/preset-selector.tsx` | PRESET_REGISTRY entry | Wrong presets shown |

### Copy Quality Rules
- **Believability test**: "Would someone actually do this?"
- **Brief preambles**: 1 sentence max, no filler
- **Specific data**: No "Category A", "Item 1", "$99.99"
- **Color semantics**: Green = positive, Red = negative

## Non-Goals
- Not an npm package (copy-paste is intentional)
- No abstractions that obscure intent
- No dependencies beyond shadcn prerequisites
- UI only, no backend

## Decision Principles
1. Simplicity > Features
2. Convention > Novel
3. Readability > Clever
