# Tool UI Component Catalog

Use this file to map user intent to component choices quickly.

## Progress

- `plan`: Step-by-step workflows with todo states.
- `progress-tracker`: Real-time operation progress across steps.

## Input / Decision

- `option-list`: Single or multi-select choices.
- `parameter-slider`: Numeric controls and constrained ranges.
- `preferences-panel`: Grouped settings with staged confirmation.
- `question-flow`: Guided, multi-step questionnaires.

## Display

- `citation`: Source references and attribution.
- `link-preview`: Rich URL previews.
- `item-carousel`: Horizontal item browsing.
- `stats-display`: KPI-style metric cards.
- `terminal`: Command and log output surfaces.
- `weather-widget`: Current weather plus forecast.

## Artifacts

- `chart`: Data visualization (series, axes, legends).
- `code-block`: Syntax-highlighted code output.
- `data-table`: Structured tabular data.
- `message-draft`: Draft + approval UI for message sending.
- `instagram-post`: Instagram post preview surface.
- `linkedin-post`: LinkedIn post preview surface.
- `x-post`: X post preview surface.

## Confirmation

- `approval-card`: Approve/reject critical actions.
- `order-summary`: Purchase breakdown and totals.

## Media

- `image`: Single media card with metadata.
- `image-gallery`: Grid/lightbox media collections.
- `video`: Embedded video with poster and controls.
- `audio`: Audio player with metadata.

## Selection Heuristics

- Need a user decision with explicit confirm action: start with `option-list` or `approval-card`.
- Need ongoing task status: use `plan` for ordered steps, `progress-tracker` for live execution.
- Need compact KPIs: use `stats-display`; for rows/columns use `data-table`.
- Need social content previews: use `instagram-post`, `linkedin-post`, or `x-post` directly.
