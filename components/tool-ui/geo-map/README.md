# Geo Map

Implementation for the "geo-map" Tool UI surface.

## Files

- public exports: components/tool-ui/geo-map/index.tsx
- serializable schema + parse helpers: components/tool-ui/geo-map/schema.ts
- main runtime orchestrator: components/tool-ui/geo-map/geo-map.tsx
- colocated Leaflet shell theme styles: components/tool-ui/geo-map/geo-map-theme.module.css
- viewport sync + controllers: components/tool-ui/geo-map/geo-map-viewport.tsx
- icon construction helpers: components/tool-ui/geo-map/geo-map-icons.ts
- popup/tooltip overlay renderer: components/tool-ui/geo-map/geo-map-overlays.tsx

## Companion assets

- Docs page: app/docs/geo-map/content.mdx
- Preset payload: lib/presets/geo-map.ts

## Quick check

Run this after edits:

pnpm test
