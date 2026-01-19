# MDX Authoring

Guide for writing doc pages in Tool UI (`app/docs/{component}/content.mdx`).

## Configuration

MDX is configured in `next.config.ts:14` with `@next/mdx` and `remark-gfm`.

**Turbopack limitation:** Plugins must be strings (`"remark-gfm"`) not function imports. Turbopack requires serializable config.

## Available Features

### GFM Tables

Standard markdown table syntax works:

```markdown
| Column | Column |
|--------|--------|
| Cell   | Cell   |
```

### Custom Components

Available via `mdx-components.tsx`:

- `TypeTable` - Props documentation
- `Files`, `Folder`, `File` - Directory trees
- `Feature`, `FeatureGrid` - Feature highlights
- `Steps`, `Step` - Numbered procedures
- `Tabs`, `Tab` - Tabbed content
- Preset example components (per-component)

### Prose Styling

Content wraps in `.prose` class from `docs-content.tsx`. Use `not-prose` class to escape for custom layouts:

```tsx
<div className="not-prose">
  <ComponentPreview />
</div>
```

### Auto-linking

Tool UI component names in text auto-link to their docs pages. Configured in `lib/mdx/with-auto-link.ts`.

## Page Structure

Each doc page needs:

1. `page.tsx` - Imports and renders MDX content
2. `content.mdx` - The actual documentation
3. `opengraph-image.tsx` - OG image generation

See `app/docs/approval-card/` for reference implementation.
