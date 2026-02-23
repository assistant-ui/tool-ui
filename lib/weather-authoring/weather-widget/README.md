# Weather Widget

Implementation for the "weather-widget" Tool UI surface.

## Files

- preferred runtime entrypoint: components/tool-ui/weather-widget/runtime.ts
- authoring exports: lib/weather-authoring/weather-widget/index.tsx
- authoring schema + parse helpers: lib/weather-authoring/weather-widget/schema.ts

## Companion assets

- Docs page: app/docs/weather-widget/content.mdx
- Preset payload: lib/presets/weather-widget.ts
- authoring presets: lib/weather-authoring/presets/tuned-presets.json
- authoring shaders: lib/weather-authoring/shaders/\*.glsl
- authoring runtime modules: lib/weather-authoring/runtime/\*.tsx
- generated runtime artifacts:
  - lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated.ts
  - lib/weather-authoring/weather-widget/effects/generated/weather-effect-shaders.generated.ts
  - lib/weather-authoring/weather-widget/effects/generated/glass-panel-svg.generated.tsx
  - lib/weather-authoring/weather-widget/weather-data-overlay.generated.ts
  - components/tool-ui/weather-widget/generated/weather-runtime-core.generated.ts

## Build workflow

- compile generated weather runtime artifacts: `pnpm weather:compile`
- watch authoring sources and regenerate on change: `pnpm weather:watch`
- fail if generated artifacts are stale: `pnpm weather:check`

## Quick check

Run this after edits:

pnpm test
