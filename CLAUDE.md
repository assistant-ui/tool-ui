# Tool UI

Copy/paste component library (shadcn/ui model) for AI assistant interfaces. Users copy component directories into projects and modify them. Source code is the product—readability over cleverness.

## Commands

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm lint:fix     # Fix lint errors (run before committing)
pnpm typecheck    # TypeScript checking
pnpm test         # Run tests (Vitest)
```

## Stack

- **Package manager**: pnpm (required)
- **Dependencies**: Only shadcn/ui prerequisites (Tailwind, Radix, Lucide)—users shouldn't need new deps

## Architecture

### Component Structure

Each component lives in `components/tool-ui/{name}/`. Reference: `components/tool-ui/approval-card/`

Key files:
- `index.tsx` — Barrel exports
- `{name}.tsx` — Main component
- `schema.ts` — Zod schema + SerializableX types
- `_adapter.tsx` — shadcn re-exports
- `error-boundary.tsx` — Error wrapper

The `shared/` directory contains utilities all components need.

### Documentation Site

Interconnected registries:
- Component metadata: `lib/docs/component-registry.ts`
- Presets (example data): `lib/presets/{component}.ts`
- Preview rendering: `lib/docs/preview-config.tsx`
- Doc pages: `app/docs/{component}/content.mdx`
- Gallery: `app/docs/gallery/page.tsx`

## Key Patterns

### Component API

- **Tailwind for layout**: No `maxWidth`/`padding` props—users customize via `className`
- **Standard widths**: Cards use `min-w-80 max-w-md`, compact components use `max-w-sm`
- **Flat props**: Avoid nested config objects
- **Semantic action IDs**: Use `id: "confirm"` / `id: "cancel"` for response actions
- **Receipt state**: Use `choice` prop to render confirmed state (e.g., `<OptionList choice="option-a" />`)

### Main Component Structure

Reference: `components/tool-ui/approval-card/approval-card.tsx:183`

- Outer `<article>` with `data-slot`, `data-tool-ui-id`, `lang="en"`, `aria-busy`
- Loading skeleton via `isLoading` prop
- Optional `responseActions` via `ActionButtons`

## Discovery

| What                    | Where                                  |
| ----------------------- | -------------------------------------- |
| Tool UI components      | `components/tool-ui/` (scan barrels)   |
| Component docs metadata | `lib/docs/component-registry.ts`       |
| Preset configurations   | `lib/presets/*.ts`                     |
| Types & validation      | Colocated `schema.ts` files            |
| assistant-ui reference  | `private/reference-docs/assistant-ui/` |
| Design system specs     | `private/design-system/`               |

## Task Guides

- Adding/modifying components: `.claude/docs/component-workflow.md`
- Writing doc pages: `.claude/docs/mdx-authoring.md`
- Copy style for examples: `.claude/docs/copy-guide.md`
