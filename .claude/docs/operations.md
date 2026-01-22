# Common Operations

## Adding a New Component

1. Create `components/tool-ui/{name}/` with standard files
2. Create `lib/presets/{name}.ts`
3. Add to `lib/docs/component-registry.ts`
4. Add to `lib/docs/preview-config.tsx`
5. Create `app/docs/{name}/page.tsx` and `content.mdx`
6. Create `app/docs/{name}/opengraph-image.tsx`
7. Add to `app/docs/gallery/page.tsx`

## Renaming a Preset

1. Update type in `lib/presets/{component}.ts`
2. Update object key
3. `grep` for old name across codebase
4. Update `defaultPreset` in `preview-config.tsx` if needed
5. Update `content.mdx` and `gallery/page.tsx` references
