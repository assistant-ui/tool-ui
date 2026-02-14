# Tool UI

When an AI assistant calls a tool, the result is usually raw JSON dumped into the conversation. Tool UI turns those results into interactive React components: cards, tables, option lists that render inline and let users act without leaving the chat.

**[tool-ui.com](https://tool-ui.com)** | [Docs](https://tool-ui.com/docs/overview) | [Gallery](https://tool-ui.com/docs/gallery)

## Quick start

1. Run `pnpm dev` and open `/playground`.
2. Add a prototype entry in `lib/playground/registry.ts`.
3. Use an existing preset from `lib/presets/*.ts` to render your target tool payload.
4. Iterate on the matching component under `components/tool-ui/<component>/`.
5. Rebuild registry artifacts with `pnpm registry:build`.

## Components

- Approval Card: Binary confirmation for agent actions
- Audio: Playback with artwork and metadata
- Chart: Interactive data visualization
- Citation: Source references with attribution
- Code Block: Syntax-highlighted code snippets
- Data Table: Sortable columns, row actions, mobile accordion layout
- Image: Images with metadata and attribution
- Image Gallery: Grid layout for browsing collections
- Item Carousel: Horizontal browsing for collections
- Link Preview: Rich previews with OG data
- Option List: Single/multi-select with local and decision actions
- Order Summary: Itemized purchase confirmation with pricing
- Parameter Slider: Numeric parameter adjustment
- Plan: Step-by-step task workflows
- Preferences Panel: Compact settings surface
- Progress Tracker: Multi-step progress and status
- Question Flow: Guided multi-step input and selection
- Social Post: X/Instagram/LinkedIn renderers with media previews
- Stats Display: Metric cards and deltas
- Terminal: Command-line output and logs
- Video: Playback with controls and poster
- Weather Widget: Forecast and conditions

[Browse all components](https://tool-ui.com/docs/gallery)

## Development

```bash
pnpm install
pnpm dev
```

- `http://localhost:3000/docs/quick-start` for integration walkthrough
- `http://localhost:3000/docs/changelog` for release notes
- `http://localhost:3000/playground` for interactive prototype testing

## Testing

```bash
pnpm test
pnpm lint:ci
pnpm registry:check
```

## License

MIT License. See [LICENSE](LICENSE) for details.
