# DataTable

A responsive, accessible, JSON‑serializable table designed for AI tool UIs and regular apps.

- Mobile‑first with accordion cards.
- Opt‑out sorting with keyboard support.
- Declarative formatting (currency, percent, delta, status, link, badge, arrays, dates).
- Serializable props only (no functions in row data, Dates, Symbols, or class instances).
- Works in iframes/remote DOM.
- Locale‑aware number/date output.

Paths used below assume the component lives at:
`@/components/data-table` (this repo's structure). Adjust imports if you vend it elsewhere.

---

> Compat note
>
> - Tailwind v4: works out of the box.
> - Tailwind v3.2+: `npm i -D @tailwindcss/container-queries` and add the plugin. Markup stays identical.
> - Using a prefix? Use `tw-@container` and `@md:tw-…`.

## Quick start

```tsx
import { DataTable, type Column } from "@/components/tool-ui/data-table";

type Row = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | number;
};

const columns: Column<Row>[] = [
  { key: "symbol", label: "Symbol", priority: "primary" },
  { key: "name", label: "Company", priority: "primary" },
  {
    key: "price",
    label: "Price",
    align: "right",
    priority: "primary",
    format: { kind: "currency", currency: "USD", decimals: 2 },
  },
  {
    key: "change",
    label: "Change",
    align: "right",
    priority: "secondary",
    format: { kind: "delta", decimals: 2, upIsPositive: true, showSign: true },
  },
  {
    key: "changePercent",
    label: "Change %",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 2, showSign: true, basis: "unit" },
  },
  {
    key: "volume",
    label: "Volume",
    align: "right",
    priority: "secondary",
    format: { kind: "number", compact: true },
  },
  {
    key: "marketCap",
    label: "Market Cap",
    align: "right",
    priority: "tertiary",
  },
];

const rows: Row[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.25,
    change: 2.35,
    changePercent: 1.34,
    volume: 52430000,
    marketCap: "2.8T",
  },
  // ...
];

export default function Example() {
  return (
    <DataTable<Row>
      rowIdKey="symbol"
      columns={columns}
      data={rows}
      defaultSort={{ by: "marketCap", direction: "desc" }}
      emptyMessage="No stocks found"
    />
  );
}
```

---

## Why this table (in 15 seconds)

- **Serializable**: your LLM/tool can return columns + data JSON and render directly—no functions in payloads.
- **Accessible**: headers are buttons with aria-sort; keyboard toggles; tooltips are non‑essential.
- **Responsive**: container‑query layout with mobile accordion cards (secondary fields expand).
- **Opinionated but flexible**: sane defaults; explicit escape hatches; all formatting via format configs.

---

## Installation checklist

1. **Copy components**
   - `components/data-table/*` (entire folder)
   - UI dependencies used internally (shadcn‑style):
     - `@/components/ui/button`
     - `@/components/ui/dropdown-menu`
     - `@/components/ui/accordion`
     - `@/components/ui/tooltip`
     - `@/components/ui/badge` (used for status/badge formats)

   Adjust imports if your UI atom paths differ.

2. **Tailwind**
   - Authored in Tailwind’s `@container` DSL. Tailwind v4 works out of the box.
   - Tailwind v3.2+: `npm i -D @tailwindcss/container-queries` and add the plugin. Markup stays identical.
   - Without container-query support, the `@…` utilities are ignored and the base mobile-first layout still works.

3. **Radix**
   - The shadcn UI atoms above wrap Radix primitives. Ensure Radix peer deps are installed if you vend atoms.

---

## API

### `<DataTable />` props

| Prop             | Type                                                          | Required | Default               | Notes                                                                                          |
| ---------------- | ------------------------------------------------------------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| `columns`        | `Column<T>[]`                                                 | ✅       | —                     | Column definitions (see below).                                                                |
| `data`           | `T[]`                                                         | ✅       | —                     | Serializable rows. Values must be primitives or arrays of primitives.                          |
| `rowIdKey`       | `string`                                                      | —        | —                     | Strongly recommended. Used to build stable React keys and mobile IDs (e.g., "id" or "symbol"). |
| `actions`        | `Action[]`                                                    | —        | —                     | Row‑level actions. ≤2 renders inline buttons; >2 collapses into a menu.                        |
| `onBeforeAction` | `({ action, row, messageId }) => boolean \| Promise<boolean>` | —        | —                     | Preflight: return `false` to cancel. Lets you implement confirmation your way.                 |
| `onAction`       | `(actionId, row, ctx) => void`                                | —        | —                     | Called when an action is triggered. `ctx = { messageId?: string }`.                            |
| `isLoading`      | `boolean`                                                     | —        | `false`               | Skeleton state.                                                                                |
| `emptyMessage`   | `string`                                                      | —        | `"No data available"` | Message when `data.length === 0`.                                                              |
| `defaultSort`    | `{ by: string; direction: "asc" \| "desc" }`                  | —        | —                     | Uncontrolled sort (component manages state).                                                   |
| `sort`           | `{ by?: string; direction?: "asc" \| "desc" }`                | —        | —                     | Controlled sort (you manage state).                                                            |
| `onSortChange`   | `(next) => void`                                              | —        | —                     | With `sort`, handle updates.                                                                   |
| `locale`         | `string`                                                      | —        | `"en-US"`             | Used for `Intl.NumberFormat`/`Intl.Collator` and date formatting.                              |
| `messageId`      | `string`                                                      | —        | —                     | Optional analytics/context tag passed to `onAction` calls.                                     |

**SSR note**: The table defaults `locale` to `"en-US"` to avoid server/client mismatches; pass an explicit locale if you need one.

---

### Footer actions (shared actions API)

`tableActions` accepts either an array of actions or an object with inline layout config:

```tsx
// Array form
tableActions={[
  { id: "approve", label: "Approve", variant: "default" },
  { id: "reject", label: "Reject", variant: "destructive", confirmLabel: "Confirm" },
]}

// Config form with layout/align/confirm timeout
tableActions={{
  items: [
    { id: "export", label: "Export CSV", variant: "secondary" },
    { id: "sync", label: "Sync", variant: "default", confirmLabel: "Confirm" },
  ],
  align: "right",
  layout: "inline",
  confirmTimeout: 3000,
}}

Handlers: `onTableAction(id)` and optional `onBeforeTableAction(id)` (return false to cancel).

---

### `Column<T>` (declarative columns)

```tsx
export interface Column<
  T extends object,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
> {
  key: K; // maps to a key in row data
  label: string; // header text
  abbr?: string; // short header for narrow viewports (tooltip shows full)
  sortable?: boolean; // default: true (opt-out)
  align?: "left" | "right" | "center"; // defaults based on value/format
  width?: string; // CSS width (e.g., "120px", "10rem")
  truncate?: boolean; // ellipsis
  priority?: "primary" | "secondary" | "tertiary"; // mobile display priority
  hideOnMobile?: boolean; // force-hide on mobile
  format?: FormatConfig; // see below
}
```

**Mobile priorities:**

- **`primary`**: always visible in the row heading.
- **`secondary`**: hidden behind the disclosure, shown when the card expands.
- **`tertiary`**: hidden on mobile.

If you don't specify priorities, the first couple of visible columns become primary automatically.

---

### `Action`

```tsx
export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean; // metadata; use onBeforeAction to confirm
}
```

Actions are rendered accessibly:

- **≤2 actions**: inline buttons for easier hit targets.
- **>2 actions**: single "…" menu with options.
- No built‑in confirm dialog. Implement confirmation via `onBeforeAction`.

---

### `FormatConfig` (cell formatting)

```tsx
type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export type FormatConfig =
  | { kind: "text" }
  | {
      kind: "number";
      decimals?: number;
      unit?: string; // appended (e.g. "ms")
      compact?: boolean; // 1,200 -> 1.2K
      showSign?: boolean; // +/-
    }
  | { kind: "currency"; currency: string; decimals?: number }
  | {
      kind: "percent";
      decimals?: number;
      showSign?: boolean;
      basis?: "fraction" | "unit"; // fraction: 0.12 -> 12%, unit: 12 -> 12%
    }
  | { kind: "date"; dateFormat?: "short" | "long" | "relative" }
  | {
      kind: "delta";
      decimals?: number;
      upIsPositive?: boolean; // e.g. latency: down is good
      showSign?: boolean;
    }
  | {
      kind: "status";
      statusMap: Record<string, { tone: Tone; label?: string }>;
    }
  | { kind: "boolean"; labels?: { true: string; false: string } }
  | { kind: "link"; hrefKey?: string; external?: boolean } // see note below
  | { kind: "badge"; colorMap?: Record<string, Tone> }
  | { kind: "array"; maxVisible?: number };
```

**Link format:**

- If `hrefKey` is provided, the link uses `row[hrefKey]` as the URL and the cell value as the label.
- If `hrefKey` is omitted, the cell value is used as the URL (and label).

**Status vs Badge:**

- **`status`** maps raw values to tones and optional labels using your `statusMap`.
- **`badge`** is a simpler "tag" display; use `colorMap` when you don't need a label remap.

---

## Sorting behavior (and keyboard/a11y)

- Columns are sortable by default. Disable per column with `sortable: false`.
- Header cells are rendered as buttons:
  - Click / Enter / Space toggles sort for that column.
  - `aria-sort` cycles: undefined → ascending → descending (and back).
- Sorting uses `Intl.Collator` with `numeric: true`, plus type‑aware rules:
  - **Numbers**: numeric sort.
  - **Dates** (Date instances): chronological.
  - **ISO‑like date strings** (e.g., `2025-01-01`): chronological.
  - **Booleans**: `false < true`.
  - **Arrays**: by length.
  - **Numeric‑like strings** (e.g., "1,200", accounting "(123)", compact "2.8T"): parsed and compared numerically when possible.
  - **`null`/`undefined`**: always sorted last.

### Uncontrolled sorting (simplest)

```tsx
<DataTable
  columns={columns}
  data={rows}
  defaultSort={{ by: "price", direction: "desc" }}
/>
```

### Controlled sorting (you own the state)

```tsx
const [sort, setSort] = useState<{ by?: string; direction?: "asc" | "desc" }>({
  by: "name",
  direction: "asc",
});

<DataTable columns={columns} data={rows} sort={sort} onSortChange={setSort} />;
```

---

## Mobile & Responsiveness

- Uses container queries when supported to switch between desktop table and mobile accordion cards.
- On mobile:
  - The row heading shows primary columns.
  - Expanding the row reveals secondary columns and actions.
  - `tertiary` columns are hidden.
- If container queries aren't supported, the component falls back gracefully (media query classes cover the essentials).

---

## Accessibility

- Keyboard sorting via header buttons (Enter / Space).
- `aria-sort` reflects the current sort state.
- Tooltip/abbr on headers is non-essential; full labels remain accessible.
- Mobile accordion uses proper `aria-controls`/IDs tied to stable row keys (`rowIdKey` is recommended).

---

## JSON‑first (LLM/tool friendly)

Everything needed to render can be produced by a tool call—no functions in payloads.

```json
{
  "columns": [
    { "key": "name", "label": "Product", "priority": "primary" },
    {
      "key": "price",
      "label": "Price",
      "align": "right",
      "format": { "kind": "currency", "currency": "USD" }
    },
    {
      "key": "tags",
      "label": "Tags",
      "priority": "secondary",
      "format": { "kind": "array", "maxVisible": 3 }
    }
  ],
  "data": [
    { "name": "Lamp", "price": 39.99, "tags": ["home", "lighting", "desk"] }
  ],
  "rowIdKey": "name",
  "defaultSort": { "by": "price", "direction": "asc" }
}
```

Do not put complex objects into cell values. Use a format config (e.g., `link`, `badge`, `status`) instead.

---

## Actions

Inline buttons or a menu. No built‑in confirmation. Use `onBeforeAction` to implement your preferred pattern (native confirm, toast+undo, custom modal). Works the same on mobile (actions move into the card).

````tsx
<DataTable
  columns={columns}
  data={rows}
  actions={[
    { id: "buy", label: "Buy" },
    { id: "watch", label: "Add to Watchlist", variant: "secondary" },
    { id: "danger", label: "Nuke", variant: "destructive", requiresConfirmation: true },
  ]}
  onBeforeAction={({ action, row }) => action.requiresConfirmation ? window.confirm(`Confirm ${action.label.toLowerCase()}?`) : true}
  onAction={(actionId, row, { messageId }) => {
    // Send an event, call an API, etc.
    console.log({ actionId, row, messageId });
  }}
  messageId="msg_123" // passed to onAction for analytics
/>

### Optional: Radix confirm provider (recipe)

If you use shadcn/Radix, you can centralize confirmation with a provider:

```tsx
import { ConfirmProvider, useConfirm } from "@/components/ui/confirm";

function TableWithConfirm() {
  const confirm = useConfirm();
  return (
    <DataTable
      actions={[{ id: 'delete', label: 'Delete', variant: 'destructive', requiresConfirmation: true }]}
      onBeforeAction={({ action, row }) => {
        if (!action.requiresConfirmation) return true;
        return confirm({
          title: `Confirm ${action.label}`,
          description: `This will ${action.label.toLowerCase()} ${String((row as any).name ?? 'this item')}.`,
          confirmText: action.label,
          destructive: action.variant === 'destructive',
        });
      }}
      onAction={(id, row) => {/* ... */}}
    />
  );
}

export default function Page() {
  return (
    <ConfirmProvider>
      <TableWithConfirm />
    </ConfirmProvider>
  );
}
````

````

---

## Using with @assistant-ui/* tool UIs

A simple tool UI can render a table directly from a tool's JSON response.

```tsx
import { makeAssistantToolUI } from "@assistant-ui/react";
import { DataTable, type Column } from "@/components/tool-ui/data-table";

type Row = Record<string, string | number | boolean | null | (string | number | boolean | null)[]>;
type Output = {
  columns: Column<Row>[];
  data: Row[];
  rowIdKey?: string;
  count: number;
};

export const ProductsUI = makeAssistantToolUI<{ query: string }, Output>({
  toolName: "get_products",
  render: ({ result, status }) => {
    if (status.type === "running") return <div className="border rounded-lg p-3">Loading…</div>;
    if (status.type === "incomplete" || !result) return <div className="border rounded-lg p-3">Failed to load.</div>;
    if (!result.count) return <div className="border rounded-lg p-3">No results.</div>;

    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">Showing {result.count}</div>
        <DataTable
          rowIdKey={result.rowIdKey}
          columns={result.columns}
          data={result.data}
        />
      </div>
    );
  },
});
````

---

## Dev tips & gotchas

- Always set `rowIdKey` when possible. Without it, React keys fall back to indices. The component logs a dev‑only warning explaining why this is risky for reconciliation/focus.
- Missing fields are handled gracefully (empty cells).
- Locale impacts currency/number/percent formatting and collation. If your server and client locales differ, pass an explicit `locale`.
- **Large datasets**: no virtualization. Keep it to the low‑thousands of rows max for smoothness; paginate upstream for more.
- Don't store Date instances in data rows. For dates, send ISO strings and use `format: { kind: "date" }`.

---

## Testing hooks (copy/paste)

### Sorting edge cases (Jest/TS)

```ts
// __tests__/sortData.spec.ts
import { sortData } from "@/components/tool-ui/data-table/utilities";

type Row = { a: unknown };

test("numeric-like strings sort numerically", () => {
  const rows: Row[] = [{ a: "1,200" }, { a: "900" }, { a: " 12 " }];
  const asc = sortData(rows, "a" as any, "asc").map((r) => r.a);
  expect(asc).toEqual([" 12 ", "900", "1,200"]);
});

test("ISO-like dates sort chronologically", () => {
  const rows: Row[] = [
    { a: "2024-05-01" },
    { a: "2023-12-31" },
    { a: "2025-01-01" },
  ];
  const desc = sortData(rows, "a" as any, "desc").map((r) => r.a);
  expect(desc).toEqual(["2025-01-01", "2024-05-01", "2023-12-31"]);
});

test("nulls sort last", () => {
  const rows: Row[] = [{ a: "b" }, { a: null }, { a: "a" }];
  const asc = sortData(rows, "a" as any, "asc").map((r) => r.a);
  expect(asc).toEqual(["a", "b", null]);
});
```

### Header a11y + sort cycle (RTL)

```tsx
// __tests__/DataTableHeader.a11y.spec.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type Column } from "@/components/tool-ui/data-table";

type Row = { name: string; price: number };

const cols: Column<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "price", label: "Price", sortable: true, align: "right" },
];

const rows: Row[] = [
  { name: "B", price: 2 },
  { name: "A", price: 1 },
];

test("aria-sort cycles via keyboard", async () => {
  render(<DataTable<Row> columns={cols} data={rows} />);
  const nameHeader = screen.getByRole("columnheader", { name: /name/i });

  expect(nameHeader).not.toHaveAttribute("aria-sort"); // undefined
  await userEvent.click(nameHeader);
  expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
  await userEvent.click(nameHeader);
  expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  await userEvent.click(nameHeader);
  expect(nameHeader).not.toHaveAttribute("aria-sort");
});
```

---

## Customization

- Styling uses Tailwind tokens and shadcn variants; you can theme via tokens or edit classes inline.
- **Headers**: use `abbr` for narrow viewports; full label shows in a tooltip and remains screen‑reader friendly.
- **Per‑column alignment**: `align: "right" | "left" | "center"`. Numeric kinds default to right.
- **Hiding on mobile**: `priority: "tertiary"` or `hideOnMobile: true`.

---

## Advanced composition (opt‑in)

Subcomponents are exported if you need to take over rendering:

```tsx
export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableActions,
  DataTableAccordionCard,
  useDataTable,
} from "@/components/tool-ui/data-table";
```

This lets you insert custom rows, extra columns, or wrap cells with analytics providers. Stick with `<DataTable />` unless you need full control.

---

## FAQ

**Q: Can I pass functions in row values (e.g., render props)?**
A: No. Rows must be JSON‑serializable. Use format configs.

**Q: I need a custom cell UI.**
A: Use a format kind (e.g., `link`, `status`, `badge`). If you truly need bespoke markup, compose with subcomponents and your own renderer.

**Q: Why are my keys unstable on mobile?**
A: Provide `rowIdKey`. Without it we use array indices, which break reconciliation and accessible relationships.

**Q: Locale seems off between server and client.**
A: Pass `locale` explicitly. Default is `"en-US"` to prevent SSR/Hydration drift.

---

## Roadmap notes (not promises)

- Sticky first column
- Column pinning/visibility controls
- Built‑in pagination and "load more"
- CSV export (client‑only)
- Virtualization for very large datasets

---

That's it. If you already have shadcn atoms wired, this is drop‑in. If not, copy the minimal UI atoms used by the table (button, badge, dropdown menu, alert dialog, accordion, tooltip) and you're done.
