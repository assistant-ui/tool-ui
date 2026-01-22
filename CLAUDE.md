# Tool UI

Copy/paste component library (shadcn/ui model) for AI assistant interfaces. Users copy component directories into their projects. Source code is the product—readability matters more than cleverness.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix lint errors (run before committing)
pnpm typecheck    # TypeScript type checking
pnpm test         # Run tests (Vitest)
```

## Architecture

### Component Structure

Each component lives in `components/tool-ui/{name}/` with:
- `index.tsx` — Barrel exports
- `{name}.tsx` — Main component
- `schema.ts` — Zod schema + SerializableX types
- `_adapter.tsx` — Re-exports from @/components/ui (shadcn)
- `error-boundary.tsx` — Error handling wrapper

See `components/tool-ui/approval-card/` for canonical example.

### Component Wrapper Pattern

Components use `<article>` with `data-slot` and `data-tool-ui-id` attributes. See `components/tool-ui/approval-card/approval-card.tsx:185-197`.

### Documentation Site

Interconnected registries:
1. **Component registry** — `lib/docs/component-registry.ts`
2. **Presets** — `lib/presets/{component}.ts` (example data + code generation)
3. **Preview config** — `lib/docs/preview-config.tsx`
4. **Doc pages** — `app/docs/{component}/` (MDX + opengraph-image.tsx)
5. **Gallery** — `app/docs/gallery/page.tsx`

### Preset Guidelines

- 4-5 presets per component, curated not exhaustive
- Pattern-descriptive names: `max-selections`, `receipt`, `destructive`
- Each preset demonstrates one distinct capability

## Key Patterns

- **Tailwind for layout**: No `maxWidth` or `padding` props—users customize via `className`
- **Standard widths**: Cards use `min-w-80 max-w-md`, compact components use `max-w-sm`
- **Flat props**: Avoid nested config objects
- **Semantic action IDs**: Use `id: "confirm"` / `id: "cancel"` for response actions
- **Dependencies**: Only shadcn/ui prerequisites (Tailwind, Radix, Lucide)

## Discovery

| What                    | Where                                    |
|-------------------------|------------------------------------------|
| Tool UI components      | `components/tool-ui/`                    |
| Component docs metadata | `lib/docs/component-registry.ts`         |
| Preset configurations   | `lib/presets/*.ts`                       |
| Types & validation      | Colocated `schema.ts` files              |
| assistant-ui reference  | `private/reference-docs/assistant-ui/`   |
| Design system specs     | `private/design-system/`                 |
| Common operations       | `.claude/docs/operations.md`             |
