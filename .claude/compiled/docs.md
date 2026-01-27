# Documentation Reference
<!-- @task:write-docs @task:create-doc-page @task:add-documentation @task:mdx @load:docs -->

## Page Structure

### `app/docs/{name}/page.tsx`
```tsx
import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import { ComponentPreview } from "../_components/component-preview";

export const metadata: Metadata = {
  title: "Label",
  description: "One-line description",
};

export default function NameDocsPage() {
  return (
    <ComponentDocsTabs
      docs={<Content />}
      examples={<ComponentPreview componentId="name" />}
    />
  );
}
```

### `app/docs/{name}/opengraph-image.tsx`
```tsx
import { generateOgImage, size as ogSize, contentType as ogContentType } from "@/lib/og/og-image";

export const runtime = "nodejs";
export const alt = "Tool UI - Label";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  return generateOgImage("Label", "Short description");
}
```

### `app/docs/{name}/content.mdx`
```mdx
import { DocsHeader } from "../_components/docs-header";
import { Name } from "@/components/tool-ui/name";

<DocsHeader
  title="Label"
  description="Ultra-concise (5-6 words)."
  mdxPath="app/docs/name/content.mdx"
/>

<Tabs items={["Preview", "Code"]}>
  <Tab>
    <div className="not-prose mx-auto max-w-sm">
      <Name id="example" /* props */ />
    </div>
  </Tab>
  <Tab>
    ```tsx
    import { Name } from "@/components/tool-ui/name";
    // usage example
    ```
  </Tab>
</Tabs>

## Key Features

<FeatureGrid>
  <Feature icon="IconName" title="Feature">Description</Feature>
</FeatureGrid>

## Source and Install

Copy [`components/tool-ui/name`](...) and [`shared`](...)

### Prerequisites
```bash
pnpm dlx shadcn@latest add button separator
```

### Directory Structure
<Files>...</Files>

## Usage
```tsx
// makeAssistantTool example
```

## Props
<TypeTable type={{ ... }} />

## Accessibility
- Keyboard: ...
- ARIA: ...
```

## DocsHeader Description

**5-6 words max!**

| Good ✅ | Bad ❌ |
|---------|--------|
| "Binary confirmation for agent actions." | "Display confirmation dialogs for important agent actions with customizable options." |
| "Provide single or multi-select choices." | "A component that allows users to select one or multiple options from a list." |

## MDX Components

| Component | Use For |
|-----------|---------|
| `TypeTable` | Props documentation |
| `Files`, `Folder`, `File` | Directory trees |
| `Feature`, `FeatureGrid` | Feature highlights |
| `Steps`, `Step` | Numbered procedures |
| `Tabs`, `Tab` | Tabbed content |

### Prose Escaping
```tsx
<div className="not-prose">
  <ComponentPreview />
</div>
```

## Registration Files

### `lib/docs/component-registry.ts`
```typescript
{
  id: "name",
  label: "Label",
  description: "One-line description",
  path: "/docs/name",
},
```

### `lib/docs/preview-config.tsx`
1. Add to `ComponentId` type union
2. Import component + presets
3. Add to `previewConfigs`

**Wrapper selection:**
| Wrapper | When |
|---------|------|
| `MaxWidthStartWrapper` | Chat-style (most components) |
| `MaxWidthWrapper` | Centered, symmetric |
| `MaxWidthSmWrapper` | Small, centered |
| `MaxWidthSmStartWrapper` | Small, left-aligned |

### `app/docs/_components/preset-selector.tsx`
```typescript
import { namePresets } from "@/lib/presets/name";
// In PRESET_REGISTRY:
"name": namePresets,
```

## Icon Registration

Icons in `<FeatureGrid>` must exist in:
`app/components/mdx/features.tsx` → `ICON_MAP`

## Patterns

### Hero Example
Use inline `<Tabs>` — NOT PresetExample components.

### Content Focus
- One hero example
- Rely on Examples tab for preset exploration
- Keep docs concise

## Checklist

- [ ] `page.tsx` uses `ComponentDocsTabs`
- [ ] `content.mdx` uses inline `<Tabs>` for hero
- [ ] DocsHeader description ≤6 words
- [ ] Icons exist in ICON_MAP
- [ ] `component-registry.ts` entry added
- [ ] `preview-config.tsx` entry + type
- [ ] `preset-selector.tsx` PRESET_REGISTRY entry
- [ ] `pnpm build` passes
