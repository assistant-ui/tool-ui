# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Tool UI?

Tool UI is a copy/paste component library (shadcn/ui model) providing rich UI components for AI assistant interfaces. Users copy component directories into their projects and modify them. The source code is the product—readability matters more than cleverness.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix lint errors (run before committing)
pnpm typecheck    # TypeScript type checking
pnpm test         # Run tests (Vitest)
pnpm test:watch   # Run tests in watch mode
```

## Code Conventions

- **Package manager**: pnpm (required)
- **Imports**: Use `@/` path alias
- **File naming**: kebab-case for files, PascalCase for components
- **Styling**: Tailwind CSS classes only, no inline styles
- **Dependencies**: Only shadcn/ui prerequisites (Tailwind, Radix, Lucide)—users shouldn't need new deps

## Architecture

### Component Structure

Each Tool UI component lives in `components/tool-ui/{name}/`:

```
{name}/
  index.tsx          # Barrel exports
  {name}.tsx         # Main component
  schema.ts          # Zod schema + SerializableX types
  _adapter.tsx       # Re-exports from @/components/ui (shadcn)
  error-boundary.tsx # Error handling wrapper
  context.tsx        # Optional: for stateful components
```

Components are self-contained and copy-able. The `shared/` directory contains utilities (ActionButtons, schemas) that all components may need.

### Documentation Site

The docs site has interconnected registries:

1. **Component registry** (`lib/docs/component-registry.ts`) — Metadata for all components
2. **Presets** (`lib/presets/{component}.ts`) — Example data + code generation
3. **Preview config** (`lib/docs/preview-config.tsx`) — Renders components in the docs preview
4. **Doc pages** (`app/docs/{component}/`) — MDX content + opengraph-image.tsx
5. **Gallery** (`app/docs/gallery/page.tsx`) — Masonry grid of all components

### Presets

Presets power documentation examples. Each preset includes:
- `description`: What capability it demonstrates
- `data`: Props to render the component
- `generateExampleCode`: Function that generates copy-paste code

Guidelines:
- 4-5 presets per component, curated not exhaustive
- Pattern-descriptive names: `max-selections`, `receipt`, `destructive`
- Each preset demonstrates one distinct capability

## Key Patterns

### Component API Design

- **Tailwind for layout**: No `maxWidth` or `padding` props—users customize via `className`
- **Standard widths**: Cards use `min-w-80 max-w-md`, compact components use `max-w-sm`
- **Flat props**: Avoid nested config objects
- **Semantic action IDs**: Use `id: "confirm"` / `id: "cancel"` for response actions

### Main Component Structure

```tsx
<article data-slot="component-name" data-tool-ui-id={id} lang="en" aria-busy={isLoading}>
  <div className="border shadow rounded-lg ...">
    {/* Content */}
  </div>
</article>
```

- Loading skeleton via `isLoading` prop
- Optional `responseActions` rendered via `ActionButtons`

## Common Operations

### Adding a New Component

1. Create `components/tool-ui/{name}/` with standard files
2. Create `lib/presets/{name}.ts`
3. Add to `lib/docs/component-registry.ts`
4. Add to `lib/docs/preview-config.tsx`
5. Create `app/docs/{name}/page.tsx` and `content.mdx`
6. Create `app/docs/{name}/opengraph-image.tsx`
7. Add to `app/docs/gallery/page.tsx`

### Renaming a Preset

1. Update type in `lib/presets/{component}.ts`
2. Update object key
3. `grep` for old name across codebase
4. Update `defaultPreset` in `preview-config.tsx` if needed
5. Update `content.mdx` and `gallery/page.tsx` references

## MDX Authoring

Doc pages use MDX (`app/docs/{component}/content.mdx`). Key considerations:

- **GFM tables**: Supported via `remark-gfm` in `next.config.ts`. Standard markdown table syntax works.
- **Custom components**: Available via `mdx-components.tsx` — includes `TypeTable`, `Files`, `Feature`, `FeatureGrid`, preset examples
- **Prose styling**: Content wraps in `.prose` class from `docs-content.tsx`. Use `not-prose` class to escape for custom layouts.
- **Auto-linking**: Tool UI component names in text auto-link to their docs pages (configured in `withAutoLink`)

## Discovery Locations

| What                    | Where                                            |
| ----------------------- | ------------------------------------------------ |
| Tool UI components      | `components/tool-ui/` (scan `index.tsx` barrels) |
| Component docs metadata | `lib/docs/component-registry.ts`                 |
| Preset configurations   | `lib/presets/*.ts`                               |
| Types & validation      | Colocated `schema.ts` files                      |
| assistant-ui reference  | `private/reference-docs/assistant-ui/`           |
| Design system specs     | `private/design-system/`                         |
