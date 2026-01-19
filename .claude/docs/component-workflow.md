# Component Workflow

Procedures for common component operations in Tool UI.

## Adding a New Component

1. Create `components/tool-ui/{name}/` with standard files:
   - `index.tsx` (barrel exports)
   - `{name}.tsx` (main component)
   - `schema.ts` (Zod schema + types)
   - `_adapter.tsx` (shadcn re-exports)
   - `error-boundary.tsx`

2. Create `lib/presets/{name}.ts` with 4-5 example presets

3. Add to `lib/docs/component-registry.ts`

4. Add to `lib/docs/preview-config.tsx`

5. Create doc page:
   - `app/docs/{name}/page.tsx`
   - `app/docs/{name}/content.mdx`
   - `app/docs/{name}/opengraph-image.tsx`

6. Add to `app/docs/gallery/page.tsx`

## Renaming a Preset

1. Update type in `lib/presets/{component}.ts`
2. Update object key in same file
3. `grep` for old name across codebase
4. Update `defaultPreset` in `preview-config.tsx` if needed
5. Update `content.mdx` and `gallery/page.tsx` references

## Preset Guidelines

- 4-5 presets per component, curated not exhaustive
- Pattern-descriptive names: `max-selections`, `receipt`, `destructive`
- Each preset demonstrates one distinct capability
- Follow copy guidelines in `.claude/docs/copy-guide.md`
