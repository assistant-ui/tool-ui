# Integration Recipes

Use recipes when a user asks for a capability, not a specific component.

## Planning Flow

Components: `plan`, `progress-tracker`, `approval-card`

Use for: multi-step execution with final approval.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/plan.json https://tool-ui.com/r/progress-tracker.json https://tool-ui.com/r/approval-card.json
```

## Research Output

Components: `citation`, `link-preview`, `code-block`

Use for: cited answers with source previews and code artifacts.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/citation.json https://tool-ui.com/r/link-preview.json https://tool-ui.com/r/code-block.json
```

## Commerce Flow

Components: `item-carousel`, `order-summary`, `approval-card`

Use for: browse items, review totals, confirm purchase-like actions.

Install:

```bash
npx shadcn@latest add https://tool-ui.com/r/item-carousel.json https://tool-ui.com/r/order-summary.json https://tool-ui.com/r/approval-card.json
```

## Recipe Command

```bash
python scripts/tool_ui_components.py bundle
python scripts/tool_ui_components.py bundle planning-flow
```
