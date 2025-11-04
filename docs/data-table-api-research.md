# DataTable API Research & Decisions

Status: Draft
Owner: Data/UI Working Group
Last updated: 2025-11-03

Purpose
- Establish a first-principles API for the DataTable component optimized for assistant-ui tool responses.
- Survey established table APIs, extract patterns, and choose a direction aligned with our constraints.
- Maintain a transparent decisions log (ADR-style) for traceability.

Scope
- API and product design for the DataTable component used to render tool-call tabular output in assistant-ui.
- Emphasis on LLM/JSON-serializable inputs, accessibility, responsiveness, and action integration.
- This is a blank-slate exercise; existing work informs but does not constrain choices.

Out of Scope (v1)
- Virtualization and very large datasets (>1–2k rows).
- Inline editing, column resize/reorder, nesting/expandable rows.
- Complex filtering and pagination UIs (can be external or server-driven later).

---

Objectives
- LLM-friendly: Accept JSON-serializable props directly from tool results.
- Predictable and simple: Low cognitive load for tool authors and model prompting.
- Accessible: WCAG 2.1 AA, semantic table structure, robust keyboard/screen reader support.
- Responsive: Great in narrow chat bubbles; mobile card layout first-class.
- Action-oriented: Row actions integrate with assistant follow-ups (send a message / trigger tools).
- Theming: Works within assistant-ui’s token system; light/dark out of the box.

Non-Goals (for now)
- Feature parity with data grid products (AG Grid, MUI X Pro).
- Arbitrary custom cell renderers; keep v1 declarative and serializable.

Constraints
- Props must be JSON-serializable except event handlers passed by the host app.
- Rendered inside chat messages with constrained width and limited vertical space.
- Should degrade gracefully without app-specific tokens.

---

Evaluation Criteria
1) LLM/JSON friendliness: minimal functions, stable schema, deterministic rendering.
2) Composability: easy to add columns/actions; clear extension points for v2.
3) Learnability: familiar concepts (columns, rows, actions), good defaults.
4) Accessibility: ARIA patterns, keyboard flows, visible focus.
5) Responsiveness: mobile card layout; horizontal scroll affordance on desktop.
6) Performance: acceptable for hundreds of rows; no virtualization in v1.
7) Theming: semantic tokens with assistant-ui alignment and Tailwind fallback.
8) Control model: controlled/uncontrolled sorting without complexity.

---

Competitive Survey (API-level)

TanStack Table (React Table)
- Shape: Headless hooks with column defs using `accessorKey`, `header`, `cell` (functions).
- Strengths: Extremely flexible, typed, ecosystem standard.
- Weaknesses: Non-serializable column definitions; heavy mental model; requires render functions.
- Takeaway: Great for app dev; not suitable for LLM-driven JSON inputs.

MUI Data Grid / DataGridPro
- Shape: Component + rich column model (`field`, `headerName`, `type`, `valueFormatter`, `renderCell`).
- Strengths: Full-featured (sorting, filtering, virtualization, selection, etc.).
- Weaknesses: Non-serializable renderers/formatters; heavy bundle; advanced state surface.
- Takeaway: Too heavy and imperative for our chat context and JSON-first contract.

Ant Design Table
- Shape: Component with `columns` (title, dataIndex, render) and `dataSource`.
- Strengths: Popular, feature-rich, good patterns for everyday tables.
- Weaknesses: `render` functions are non-serializable; large surface area; styling conventions differ.
- Takeaway: Useful patterns, but API is not LLM-friendly.

Mantine DataTable
- Shape: Component with `columns` (accessor string or function), optional `render`.
- Strengths: Pragmatic, balanced feature set; simple column model.
- Weaknesses: Relies on functions for custom cells; non-serializable.
- Takeaway: Good baseline simplicity; still not JSON-first.

React Aria Table
- Shape: Headless, ARIA-focused hooks + render logic in user land.
- Strengths: Accessibility-first; clean semantics.
- Weaknesses: Requires render functions; not JSON-first out of the box.
- Takeaway: Accessibility patterns to emulate; not compatible with LLM-provided columns/rows directly.

AG Grid (Community)
- Shape: Full data grid; `columnDefs` with renderers and formatters.
- Strengths: Enterprise-grade features and performance.
- Weaknesses: Complex API; non-serializable portions; heavy footprint.
- Takeaway: Overkill for chat bubble UI and JSON-only inputs.

PrimeReact DataTable
- Shape: Component with templates (functions) for cells/headers.
- Strengths: Batteries-included components.
- Weaknesses: Template functions break JSON contract; theming differences.
- Takeaway: Not aligned with our constraints.

Patterns Observed
- Most popular table APIs rely on render functions for customization (not JSON-friendly).
- Column config almost always includes: key/field, label/title, alignment, sortable.
- Heavier grids add selection, pagination, filtering, virtualization.
- Accessibility is often left to library internals; we must own it.

Implications for Our Use Case
- To be LLM-friendly, our input contract must be fully serializable.
- Customization must be declarative and limited in v1 (opt-in extensions later).
- Prioritize predictable layout and safe formatting over arbitrary rendering.

---

Candidate Directions

Direction A — Schema-first, Declarative, JSON-only
- Columns: `{ key, label, align?, sortable?, width?, format? }`.
- Rows: `Record<string, string | number | boolean | null>`.
- Actions: global list with variants; `onAction(id, row)` from host app.
- Pros: LLM-friendly, easy to generate and validate.
- Cons: Limited customization; advanced UIs require host-level composition.

Direction B — Headless Core + Render Callbacks
- Provide hooks/context and let host render cells/headers.
- Pros: Maximum flexibility; aligns with app dev patterns.
- Cons: Breaks JSON contract; LLM/tool results can’t directly render; higher complexity.

Direction C — Hybrid Declarative + Small Typed Formatters
- Declarative base (Direction A) plus a limited set of standard `format` options (e.g., `number`, `currency`, `percent`, `date`) and per-column options (e.g., `decimals`, `currency`, `dateFormat`).
- Pros: Still serializable; handles most real-world display needs.
- Cons: Not arbitrarily extensible; careful scope management required.

Recommendation: Direction C for v1
- Maintains JSON-only contract while covering common formatting needs.
- Leaves room for a v2 “advanced mode” via composition or registry plugins.

---

Proposed v1 API (Blank Slate)

Types (conceptual)
```
type Primitive = string | number | boolean | null

type ColumnAlign = 'left' | 'right' | 'center'
type SortDirection = 'asc' | 'desc'
type FormatKind = 'text' | 'number' | 'currency' | 'percent' | 'date'

interface Column {
  key: string
  label: string
  align?: ColumnAlign               // default: auto (numbers → right)
  sortable?: boolean                // default: true
  width?: string                    // e.g., '120px', '20%'
  format?: {
    kind?: FormatKind               // default: 'text' | auto by value type
    decimals?: number               // for number/percent
    currency?: string               // ISO 4217, for currency
    dateFormat?: 'short' | 'long'   // for ISO date strings
  }
}

interface Action {
  id: string
  label: string
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive'
  requiresConfirmation?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: Array<Record<string, Primitive>>

  actions?: Action[]

  // Behavior
  sortBy?: string
  sortDirection?: SortDirection
  emptyMessage?: string
  isLoading?: boolean
  maxHeight?: string                // e.g., '400px'
  mobilePrimaryColumn?: string      // default: first column
  rowIdKey?: string                 // default: undefined (index used)

  // Assistant-UI integration
  messageId?: string

  // Event handlers (host-provided only)
  onSort?: (columnKey: string, direction: SortDirection) => void
  onAction?: (
    actionId: string,
    row: Record<string, Primitive>,
    context?: { messageId?: string; sendMessage?: (message: string) => void }
  ) => void
}
```

Behavior
- Sorting: single-column, cycles none → asc → desc → none; controlled if `onSort` present, else internal.
- Formatting: Apply `format` options; fall back to sensible defaults (numbers localized, ISO dates localized, booleans Yes/No, null → em dash).
- Alignment: `align` or auto-right-align numbers; left otherwise.
- Responsiveness: Table on ≥640px; mobile cards otherwise; actions visible per row in cards.
- Height: Optional `maxHeight` with sticky header; overflow-y scroll; horizontal scroll affordance on desktop.
- Accessibility: Semantic table, `aria-sort`, focus management for menus/dialogs, keyboard navigation between headers/actions.
- Theming: Semantic tokens (assistant-ui) with Tailwind fallback.

Serialization Rules
- All props must be JSON-serializable except `onSort`/`onAction` supplied by the host app.
- Row values restricted to primitives; Dates passed as ISO strings.

Validation (recommendation)
- Provide a zod schema for `DataTableProps` (sans handlers) to validate tool results before rendering.

---

Extension Points (Post-v1)
- Filtering API (declarative) with optional server round-trips.
- Row selection (single/multi) with `onSelect` events.
- Expandable rows (declarative summary/details sections).
- Column visibility toggles; density/size prop.
- Declarative “conditions” for action enable/disable.
- Virtualization for large datasets.

---

Decisions Log (ADR-style)

DT-001 — Base Direction (Accepted)
- Context: Need JSON-only contract compatible with LLM tool responses.
- Decision: Use Direction C (Hybrid declarative + constrained format options).
- Consequences: Common formatting covered; no arbitrary renderers in v1.
- Alternatives: A (too limiting long-term), B (breaks JSON contract).

DT-002 — Column Format Model (Accepted)
- Context: Displaying numbers, currency, percent, dates requires consistency.
- Decision: Add `format` object with `kind`, `decimals`, `currency`, `dateFormat`.
- Consequences: Predictable outputs without render functions; easy to generate.
- Alternatives: Magic detection only; explicit `type` enums; custom renderers.

DT-003 — Actions API (Accepted)
- Context: Rows trigger follow-up tool usage/messages in assistant-ui.
- Decision: Global `actions[]` applied to all rows; `onAction(id, row, context)`.
- Consequences: Simple and serializable; per-row conditions deferred to v2.
- Alternatives: `row => actions` function (non-serializable); inline action templates.

DT-004 — Sorting Model (Accepted)
- Context: Allow initial sort and user toggles without complexity.
- Decision: Single-column sort only; controlled/uncontrolled support.
- Consequences: Simple UX; multi-sort deferred.
- Alternatives: Multi-column sort; server-only sort.

DT-005 — Mobile Primary Column (Accepted)
- Context: Card layout needs a prominent label; LLMs may not specify.
- Decision: Default to first column; override via `mobilePrimaryColumn`.
- Consequences: Predictable layout; minimal cognitive overhead.
- Alternatives: Required `primary` flag on columns; heuristic detection.

DT-006 — Row Identity (Accepted)
- Context: Stable keys and action context sometimes need an ID.
- Decision: Optional `rowIdKey`; otherwise index used.
- Consequences: Simple path to stability when caller has IDs.
- Alternatives: `getRowId` function (non-serializable).

DT-007 — Formatting Fallbacks (Accepted)
- Context: Not all callers will specify `format`.
- Decision: Apply gentle auto-detection: numbers localized, ISO 8601 → dates, booleans to Yes/No, null → em dash.
- Consequences: Good defaults; explicit `format` wins if present.
- Alternatives: Require explicit formats always.

DT-008 — Theming Tokens (Accepted)
- Context: Must fit assistant-ui theme; also work standalone.
- Decision: Use assistant-ui semantic tokens with Tailwind fallbacks.
- Consequences: Consistent look; minimal coupling.
- Alternatives: Hard-coded Tailwind classes only.

DT-009 — No Pagination in v1 (Accepted)
- Context: Chat bubble context discourages pagination complexity.
- Decision: Omit pagination; support `maxHeight` + scroll for long lists.
- Consequences: Simpler; larger datasets handled by follow-up tools or v2.
- Alternatives: Client/server pagination now.

DT-010 — Accessibility Targets (Accepted)
- Context: Must be usable via keyboard/screen readers in chat.
- Decision: Semantic table, `aria-sort`, focus-managed menus/dialogs, visible focus.
- Consequences: Extra implementation effort; critical for inclusivity.
- Alternatives: Best-effort only.

---

Open Questions
- Should we include a `density` prop (compact/normal/comfortable) in v1?
- Do we want basic, declarative column visibility toggles now or in v2?
- Are per-action “conditions” (e.g., disable when value < 0) needed in v1, and can we model them declaratively?
- Do we need a built-in CSV/clipboard export action in v1 for chat users?
- How should we handle extremely wide tables beyond horizontal scroll (column wrapping strategies)?

Risks
- Scope creep toward data grid territory; resist adding non-serializable features.
- Locale assumptions for number/date formatting; document or allow overrides early.
- Accessibility gaps on mobile card rendering; thorough testing required.

---

Next Steps
1) Align on Proposed v1 API and Decisions DT-001…DT-010.
2) Define and publish a zod schema for `DataTableProps` (minus handlers).
3) Update or rebuild component to match this API exactly.
4) Create examples driven solely by JSON tool results (no app-specific wrappers).
5) Validate accessibility and responsive behavior against real data.
6) Document clear upgrade path for future features (selection, filtering, etc.).

Appendix: Relationship to Existing Docs
- We intentionally treated this as a blank slate; overlaps with `DATA_TABLE_SPEC.md` are coincidence of problem constraints.
- Where this document diverges, this research doc is the source of truth for API decisions until implementation catches up.

