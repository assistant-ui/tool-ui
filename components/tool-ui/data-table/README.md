# DataTable Component

A flexible, accessible data table component for assistant-ui's widget registry. Built with Radix UI primitives and Tailwind CSS.

**Version:** 0.1.0
**License:** MIT 

## Features

### Desktop

- ✅ Full table layout with sortable columns
- ✅ Horizontal scroll with gradient shadow affordances
- ✅ Visual sort indicators (chevron icons)
- ✅ Response actions for surface-level CTAs

### Mobile

- ✅ **Accordion card layout** - expandable cards for detailed data
- ✅ **Column priority system** - control which fields show prominently
- ✅ **Touch-optimized** - 44px minimum touch targets
- ✅ **Smart defaults** - first 2 columns primary, rest secondary
- ✅ Auto-adapts at 768px breakpoint

### Universal

- ✅ Empty and loading states with skeletons
- ✅ Accessible keyboard navigation
- ✅ Dark mode support
- ✅ Compound component API for customization

## Installation

The component requires these dependencies:

```bash
npm install @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-tooltip
# or
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-tooltip
```

### Tailwind Setup (Compat Note)

This component is authored using Tailwind’s shared `@container` DSL.

- Tailwind v4: works out of the box (container queries built-in)
- Tailwind v3.2+: `npm i -D @tailwindcss/container-queries` and add the plugin:

```js
// tailwind.config.{js,ts}
module.exports = {
  plugins: [require("@tailwindcss/container-queries")],
};
```

If you use a prefix, prefix both sides: `tw-@container` on the container and `@md:tw-flex` (etc.) on children.

Copy the following files to your project:

```
components/data-table/
├── _cn.ts                    # Local className helper
├── _ui.tsx                   # Adapter for your UI atoms
├── index.tsx
├── data-table.tsx
├── data-table-header.tsx
├── data-table-body.tsx
├── data-table-row.tsx
├── data-table-cell.tsx
├── data-table-accordion-card.tsx  # Mobile card component
├── error-boundary.tsx             # Error boundary component
├── formatters.tsx                 # Value formatters
├── schema.ts                      # Zod validation schemas
└── utilities.ts                   # Utility functions
```

Also ensure you have these UI components:

```
components/ui/
├── dropdown-menu.tsx
├── accordion.tsx
├── tooltip.tsx
└── button.tsx
```

## Browser Support

### Supported Browsers

This component targets modern browsers with native Container Queries support:

| Browser       | Minimum Version |
| ------------- | --------------- |
| Safari        | 16.4+           |
| Chrome / Edge | 111+            |
| Firefox       | 128+            |

Progressive enhancement: if a project lacks container-query support (e.g., Tailwind v3 without the plugin), the `@…` utilities are ignored and the base mobile-first layout still renders correctly.

### Tailwind CSS Container Queries

This component uses Tailwind container-query utilities (`@container`, `@md:`). The markup is identical across Tailwind v4 and v3.2+ (with the plugin). Named containers are supported if you need them (e.g., `@container/main` and `@md/main:`).

### Prefix Gotcha

If your Tailwind config uses a prefix (e.g., `prefix: 'tw-'`), prefix both the container and the inner utilities: `tw-@container` and `@md:tw-flex`.

### Known Limitations

- **IE11**: Not supported (no ES6 support)
- **Very old browsers** (<2020): May not render correctly

## Basic Usage

```tsx
import { DataTable } from "@/components/tool-ui/data-table";

function MyComponent() {
  return (
    <DataTable
      columns={[
        { key: "id", label: "ID", sortable: false },
        { key: "name", label: "Product" },
        { key: "price", label: "Price", align: "right" },
        { key: "stock", label: "Stock", align: "right" },
      ]}
      data={[
        { id: "1", name: "Widget", price: 29.99, stock: 150 },
        { id: "2", name: "Gadget", price: 49.99, stock: 89 },
        { id: "3", name: "Doohickey", price: 19.99, stock: 0 },
      ]}
      rowIdKey="id" // ⚠️ Strongly recommended for stable React reconciliation
    />
  );
}
```

> **💡 Tip:** Always include a unique `id` field in your data and pass `rowIdKey="id"`. This prevents React reconciliation issues when data reorders. See the [Props API section](#datatableprops) for details.

## Props API

### DataTableProps

| Prop                   | Type                                         | Default               | Description                                                                                 |
| ---------------------- | -------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `columns`              | `Column[]`                                   | Required              | Column definitions                                                                          |
| `data`                 | `Record<string, any>[]`                      | Required              | Row data                                                                                    |
| `rowIdKey`             | `string`                                     | `undefined`           | **⚠️ Strongly Recommended:** Key in each row used for stable React keys (see warning below) |
| `defaultSort`          | `{ by?: string; direction?: 'asc' \| 'desc' }` | `undefined`           | Initial sort (uncontrolled)                                                                 |
| `sort`                 | `{ by?: string; direction?: 'asc' \| 'desc' }` | `undefined`           | Controlled sort state                                                                       |
| `onSortChange`         | `(next) => void`                             | `undefined`           | Controlled sort change handler                                                              |
| `isLoading`            | `boolean`                                    | `false`               | Show loading skeleton                                                                       |
| `emptyMessage`         | `string`                                     | `"No data available"` | Empty state message                                                                         |
| `maxHeight`            | `string`                                     | `undefined`           | Max height with vertical scroll                                                             |
| `responseActions`        | `Action[] \| ActionsConfig`                  | `undefined`           | Surface-level actions rendered below the table                                              |
| `onResponseAction`       | `(actionId: string) => void`                 | `undefined`           | Response action click handler                                                                 |
| `onBeforeResponseAction` | `(actionId: string) => boolean \| Promise<boolean>` | `undefined`    | Preflight hook to gate response actions. Return `false` to cancel.                            |
| `locale`               | `string`                                     | `undefined`           | Locale for formatting/sorting (e.g., `en-US`)                                               |
| `className`            | `string`                                     | `undefined`           | Additional CSS classes                                                                      |

> **⚠️ Critical: Always provide `rowIdKey` for dynamic data**
>
> Without `rowIdKey`, the table falls back to using array indexes as React keys. This is **acceptable for static mock data** but **dangerous for dynamic data** because:
>
> - **Reorder bugs**: When data reorders (e.g., after sorting), React reuses DOM elements incorrectly
> - **Focus traps**: Input focus can jump to wrong rows or get lost entirely
> - **Animation glitches**: Row transitions and animations behave incorrectly
> - **State preservation bugs**: Component state (expanded rows, selections) can attach to wrong items
>
> **Always provide a unique, stable identifier:**
>
> ```tsx
> // ✅ Good: Stable unique identifier
> <DataTable rowIdKey="id" data={users} columns={columns} />
>
> // ❌ Bad: No rowIdKey with dynamic data that can reorder
> <DataTable data={users} columns={columns} />
> ```
>
> In development mode, the table will warn if `rowIdKey` is missing.

### Column

```typescript
interface Column {
  key: string; // Unique identifier, maps to row data
  label: string; // Display header text
  sortable?: boolean; // Default: true (OPT-OUT: set to false to disable)
  align?: "left" | "right" | "center"; // Default: 'left'
  width?: string; // Optional CSS width (e.g., "150px")
  truncate?: boolean; // Opt-in truncate cell content (default: false)

  // Mobile Responsiveness (NEW in v0.2.0)
  priority?: "primary" | "secondary" | "tertiary"; // Mobile display priority
  hideOnMobile?: boolean; // Simple override to hide on mobile
}
```

> **⚠️ Note on Sortable Default**
>
> Columns are **sortable by default** (opt-out pattern). This means:
>
> - Omitting `sortable` → Column IS sortable
> - `sortable: true` → Column IS sortable (explicit)
> - `sortable: false` → Column is NOT sortable (opt-out)
>
> In data-heavy tables with many columns, you may want to explicitly set `sortable: false` for columns that shouldn't be sorted (e.g., action columns, complex formatted data).

**Mobile Priority System:**

- `primary`: Always visible in mobile card header (recommended: 2-3 columns)
- `secondary`: Hidden in collapsed card, shown when expanded (most columns)
- `tertiary`: Completely hidden on mobile (optional/advanced fields)
- No priority specified: Auto-assigned (first 2 columns = primary, rest = secondary)

### Response Actions

Response actions provide surface-level CTAs that apply to the table as a whole. Use these for operations like "Export", "Sync", or "Clear selection".

```typescript
interface Action {
  id: string                       // Action identifier
  label: string                    // Button text
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive'
  confirmLabel?: string            // Two-step confirm label (optional)
}
```

The `confirmLabel` field enables a built-in two-step confirmation pattern - the button shows the original label, then changes to the confirm label when clicked. The action only fires on the second click (or auto-cancels after the timeout).

**Example: Response actions with confirmation**

```tsx
<DataTable
  columns={columns}
  data={rows}
  responseActions={[
    { id: "export", label: "Export CSV", variant: "secondary" },
    { id: "sync", label: "Sync", variant: "default" },
    { id: "clear", label: "Clear All", confirmLabel: "Confirm Clear", variant: "destructive" },
  ]}
  onResponseAction={(actionId) => {
    if (actionId === "export") exportToCsv(rows);
    if (actionId === "clear") clearAllRows();
  }}
/>
```

For custom confirmation flows (modals, etc.), use `onBeforeResponseAction`:

```tsx
<DataTable
  responseActions={[{ id: "delete", label: "Delete All", variant: "destructive" }]}
  onBeforeResponseAction={(actionId) => {
    if (actionId === "delete") {
      return window.confirm("Delete all items?");
    }
    return true;
  }}
  onResponseAction={(actionId) => performAction(actionId)}
/>
```

## Examples

### Forced Layout

Control the layout explicitly with the `layout` prop. Default is `auto`, which uses container queries to switch between table and cards.

```tsx
// Always render full table layout
<DataTable layout="table" columns={columns} data={rows} />

// Always render stacked cards (mobile style)
<DataTable layout="cards" columns={columns} data={rows} />

// Automatic (container queries decide) — default behavior
<DataTable columns={columns} data={rows} />
```

The root element exposes `data-layout="auto|table|cards"` for theming and testing hooks.

### Sorting

The DataTable supports both **controlled** and **uncontrolled** sorting:

> **⚠️ Important: Columns are sortable by default**
>
> All columns are sortable unless you explicitly set `sortable: false`. This is an **opt-out pattern**. For data-heavy tables, consider which columns actually need sorting and disable it for others.

#### Uncontrolled Sorting (Recommended for simple cases)

The table manages its own sort state internally:

```tsx
<DataTable
  columns={columns}
  data={rows}
  // Users can click headers to sort (internally managed)
/>
````

#### Disabling Sorting on Specific Columns

To disable sorting for columns that shouldn't be sortable:

```tsx
const columns = [
  { key: "id", label: "ID", sortable: false }, // IDs often don't need sorting
  { key: "name", label: "Name" }, // Sortable (default)
  { key: "price", label: "Price" }, // Sortable (default)
  { key: "actions", label: "Actions", sortable: false }, // Action columns shouldn't sort
];
```

#### Controlled Sorting (For complex state management)

You control the sort state from parent component:

```tsx
const [sort, setSort] = useState<{ by?: string; direction?: 'asc' | 'desc' }>({})

<DataTable
  columns={columns}
  data={rows}
  sort={sort}
  onSortChange={setSort}
/>
```

#### Initial Sort (Uncontrolled with default)

Set an initial sort without managing state:

```tsx
<DataTable
  columns={columns}
  data={rows}
  defaultSort={{ by: "price", direction: "desc" }}
/>
```

### Sorting Tri-State Cycle

**Critical:** The DataTable uses a tri-state sorting cycle that allows users to return to the unsorted state.

**Cycle behavior:**

1. **Unsorted** (initial state) → Click header → **Ascending**
2. **Ascending** → Click same header → **Descending**
3. **Descending** → Click same header → **Unsorted** (returns to original order)
4. Click **different column** → **Ascending** (on that column)

**Why tri-state?**

- Users may want to return to original insertion/chronological order
- Common in data exploration workflows
- Matches user expectations from spreadsheet software

**Visual indicators:**

- Unsorted: No icon
- Ascending: ↑ icon (`aria-sort="ascending"`)
- Descending: ↓ icon (`aria-sort="descending"`)

**Example with controlled state:**

```tsx
const [sort, setSort] = useState<{ by?: string; direction?: 'asc' | 'desc' }>({
  by: 'price',
  direction: 'desc'
})

<DataTable
  sort={sort}
  onSortChange={(next) => {
    // next.by and next.direction will be undefined when returning to unsorted
    console.log('Sort state:', next)
    setSort(next)
  }}
/>
```

**Handling unsorted state:**

```tsx
onSortChange={(next) => {
  if (!next.by || !next.direction) {
    console.log('User returned to unsorted state')
    // Display data in original order
  } else {
    console.log(`Sorting by ${next.by} ${next.direction}`)
  }
  setSort(next)
}}
```

### With Response Actions

```tsx
<DataTable
  columns={columns}
  data={rows}
  responseActions={[
    { id: "export", label: "Export", variant: "secondary" },
    { id: "refresh", label: "Refresh", variant: "default" },
  ]}
  onResponseAction={(actionId) => {
    if (actionId === "export") {
      console.log("Exporting data...");
    } else if (actionId === "refresh") {
      console.log("Refreshing...");
    }
  }}
/>
```

### Loading State

```tsx
<DataTable columns={columns} data={[]} isLoading={true} />
```

### Empty State

```tsx
<DataTable
  columns={columns}
  data={[]}
  emptyMessage="No products found. Try adjusting your filters."
/>
```

### With Max Height

```tsx
<DataTable columns={columns} data={manyRows} maxHeight="400px" />
```

## Mobile Responsiveness

The DataTable automatically adapts to mobile devices with an accordion card layout and intelligent column prioritization.

### Basic Mobile Example

```tsx
<DataTable
  columns={[
    { key: "name", label: "Product" }, // Auto: primary
    { key: "price", label: "Price", align: "right" }, // Auto: primary
    { key: "category", label: "Category" }, // Auto: secondary (collapsed)
    { key: "stock", label: "Stock", align: "right" }, // Auto: secondary (collapsed)
  ]}
  data={products}
/>
```

**On Mobile (<768px):**

- First 2 columns (`name`, `price`) show in card header
- Remaining columns (`category`, `stock`) appear when card is expanded
- User taps card to expand/collapse details

### Explicit Column Priorities

For tables with many columns, explicitly set priorities:

```tsx
<DataTable
  columns={[
    { key: "symbol", label: "Symbol", priority: "primary" },
    { key: "name", label: "Company", priority: "primary" },
    { key: "price", label: "Price", priority: "primary", align: "right" },

    { key: "change", label: "Change", priority: "secondary", align: "right" },
    { key: "volume", label: "Volume", priority: "secondary", align: "right" },
    {
      key: "marketCap",
      label: "Market Cap",
      priority: "secondary",
      align: "right",
    },

    { key: "pe", label: "P/E Ratio", priority: "tertiary", align: "right" },
    { key: "eps", label: "EPS", priority: "tertiary", align: "right" },
  ]}
  data={stocks}
/>
```

**Mobile Behavior:**

- **Primary** (Symbol, Company, Price): Always visible in card header
- **Secondary** (Change, Volume, Market Cap): Shown when card expanded
- **Tertiary** (P/E, EPS): Completely hidden on mobile

### Hide Specific Columns on Mobile

```tsx
<DataTable
  columns={[
    { key: "name", label: "Product" },
    { key: "price", label: "Price", align: "right" },
    { key: "internalId", label: "ID", hideOnMobile: true }, // Hidden on mobile
  ]}
  data={products}
/>
```

### Desktop Scroll Affordances

Wide tables on desktop show gradient shadows when scrollable:

```tsx
<DataTable
  columns={manyColumns} // 10+ columns
  data={data}
/>
```

**Visual Indicators:**

- Gradient fade appears on left when scrolled right
- Gradient fade appears on right when more content available
- Touch-optimized momentum scrolling

#### Sticky Header + Scroll Structure

Use this wrapper hierarchy to ensure sticky headers work with horizontal scroll:

```
<div className="relative">
  <div className="relative w-full overflow-auto rounded-md border" style={{ WebkitOverflowScrolling: 'touch' }}>
    <table className="w-full border-collapse">
      <colgroup>
        {/* one <col> per column, optional width */}
      </colgroup>
      <thead className="sticky top-0 border-b bg-muted/50">...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</div>
```

The component renders this structure for you, including `<colgroup>` sizing. If you customize, keep vertical scroll on the inner wrapper, not the table.

### Touch Optimization

All interactive elements are automatically optimized for touch:

- **Sortable headers**: Enhanced tap area
  - Sorting is disabled while loading
- **Action buttons**: 44px minimum height on mobile
- **Accordion triggers**: Large touch target
- **Active states**: Visual feedback on tap

## Formatting

The DataTable supports rich, declarative cell formatting via a JSON‑friendly `format` field on each `Column`. This enables plug‑and‑play semantics (currency, status pills, deltas, relative dates, links, arrays) without render functions.

### Column.format

```ts
type Tone = "success" | "warning" | "danger" | "info" | "neutral";

type FormatConfig =
  | { kind: "text" }
  | {
      kind: "number";
      decimals?: number;
      unit?: string;
      compact?: boolean;
      showSign?: boolean;
    }
  | { kind: "currency"; currency: string; decimals?: number }
  | {
      kind: "percent";
      decimals?: number;
      showSign?: boolean;
      basis?: "fraction" | "unit";
    }
  | { kind: "date"; dateFormat?: "short" | "long" | "relative" }
  | {
      kind: "delta";
      decimals?: number;
      upIsPositive?: boolean;
      showSign?: boolean;
    }
  | {
      kind: "status";
      statusMap: Record<string, { tone: Tone; label?: string }>;
    }
  | { kind: "boolean"; labels?: { true: string; false: string } }
  | { kind: "link"; hrefKey?: string; external?: boolean }
  | { kind: "badge"; colorMap?: Record<string, Tone> }
  | { kind: "array"; maxVisible?: number };
```

Notes:

- Percent `basis`: use `'fraction'` for values like `0.12` → `12%` (default), or `'unit'` for values like `12` → `12%`.
- Delta `upIsPositive`: set to `false` for metrics where lower is better (e.g., latency).
- Numbers auto right‑align if `align` is not specified.
- Mobile cards reuse the same formatting for consistency.

### Examples

```tsx
// Currency
{ key: 'price', label: 'Price', align: 'right', format: { kind: 'currency', currency: 'USD', decimals: 2 } }

// Percent from fraction (0.12 => 12%)
{ key: 'errorRate', label: 'Error %', align: 'right', format: { kind: 'percent', decimals: 2 } }

// Percent from unit (12 => 12%) with explicit plus sign
{ key: 'changePct', label: 'Change %', align: 'right', format: { kind: 'percent', basis: 'unit', decimals: 2, showSign: true } }

// Status pills
{ key: 'status', label: 'Status', format: { kind: 'status', statusMap: {
  todo: { tone: 'neutral', label: 'Todo' },
  in_progress: { tone: 'info', label: 'In Progress' },
  done: { tone: 'success' },
  blocked: { tone: 'danger' },
}}}

// Delta with arrows/colors (lower is better)
{ key: 'latencyDelta', label: 'Δ Latency', align: 'right', format: { kind: 'delta', decimals: 0, upIsPositive: false, showSign: true } }

// Relative date
{ key: 'updatedAt', label: 'Updated', format: { kind: 'date', dateFormat: 'relative' } }

// Link (explicit href from another key)
{ key: 'name', label: 'Resource', format: { kind: 'link', hrefKey: 'url', external: true } }

// Array of tags
{ key: 'tags', label: 'Tags', format: { kind: 'array', maxVisible: 2 } }
```

### Sorting Rules

Sorting is single-column and follows these rules:

- Numeric-like strings (e.g., `"1,200"`, `" 900 "`) sort numerically, not lexically.
- ISO-like date strings (`YYYY-MM-DD...`) sort by date.
- Otherwise values sort with locale-aware, numeric string collation.

Null/undefined values sort last. Arrays sort by length.

## Serialization

### Type-Safe Prop Separation

The DataTable component has **strict type separation** between serializable and React-only props to prevent accidental serialization of non-serializable values:

```typescript
// ✅ Serializable props - can come from LLM tool calls
interface DataTableSerializableProps<T> {
  columns: Column<T>[];
  data: T[];
  layout?: 'auto' | 'table' | 'cards';
  rowIdKey?: string;
  defaultSort?: { by?: string; direction?: "asc" | "desc" };
  sort?: { by?: string; direction?: "asc" | "desc" };
  emptyMessage?: string;
  maxHeight?: string;
  id?: string;
  locale?: string;
}

// ❌ React-only props - must be provided by your React code
interface DataTableClientProps<T> {
  isLoading?: boolean;
  className?: string;
  responseActions?: Action[] | ActionsConfig;
  onResponseAction?: (actionId: string) => void;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
  onSortChange?: (next: { by?: string; direction?: "asc" | "desc" }) => void;
}

// Combined interface
interface DataTableProps<T>
  extends DataTableSerializableProps<T>,
    DataTableClientProps<T> {}
```

**Benefits of this separation:**

- **Type safety**: TypeScript prevents accidental serialization of functions
- **Clear boundary**: Explicit distinction between LLM data and React code
- **Better DX**: IDE autocomplete separates concerns
- **Runtime safety**: parseSerializableDataTable only returns serializable props

**Usage pattern:**

```tsx
import type { DataTableSerializableProps, DataTableClientProps } from '@/components/tool-ui/data-table'

// From LLM tool call - only serializable props
const serializableProps: DataTableSerializableProps = parseSerializableDataTable(llmResult)

// Combine with React-specific props
const clientProps: DataTableClientProps = {
  isLoading: false,
  responseActions: [{ id: "export", label: "Export" }],
  onResponseAction: (id) => handleAction(id),
  onSortChange: setSort
}

<DataTable {...serializableProps} {...clientProps} />
```

### Rules for Serializable Data

**Supported row value types:**

- ✅ **Primitives:** `string`, `number`, `boolean`, `null`
- ✅ **Arrays of primitives:** `string[]`, `number[]`, `boolean[]`, or mixed arrays
  - Examples: `["tag1", "tag2"]`, `[1.2, 3.4, 5.6]`, `[true, false]`, `["label", 42, true]`

**NOT supported in row data:**

- ❌ **Functions** - Cannot be serialized
- ❌ **Class instances** - `Date`, `Map`, `Set`, etc.
  - For dates: Use ISO strings (`"2025-11-03T12:34:56Z"`) + `format: { kind: 'date' }`
- ❌ **Plain objects** - `{ href: "/path", label: "Link" }`
  - For links: Use string value + `format: { kind: 'link', hrefKey: 'urlColumn' }`
  - For status: Use string value + `format: { kind: 'status', statusMap: {...} }`

**Critical boundary:**

> Complex data belongs in **column format configs**, not in row values.
>
> This keeps the data-vs-presentation boundary crisp and ensures LLM tool calls
> can provide any visualization without needing to know UI implementation details.

**Examples:**

```ts
// ✅ CORRECT: Primitives in data, formatting in columns
const rows = [
  {
    product: "Widget",
    url: "/widget",
    price: 29.99,
    tags: ["electronics", "sale"],
  },
];
const columns = [
  {
    key: "product",
    label: "Product",
    format: { kind: "link", hrefKey: "url" },
  },
  {
    key: "price",
    label: "Price",
    format: { kind: "currency", currency: "USD" },
  },
  { key: "tags", label: "Tags", format: { kind: "array", maxVisible: 2 } },
];

// ❌ WRONG: Objects in row data
const rows = [
  {
    product: { label: "Widget", href: "/widget" }, // Don't do this!
    price: { value: 29.99, currency: "USD" }, // Don't do this!
  },
];
```

### LLM Tool Call Examples

Here's how to structure tool call payloads for the DataTable:

**Example 1: Simple table from LLM**

```json
{
  "columns": [
    { "key": "name", "label": "Product" },
    { "key": "price", "label": "Price", "align": "right" },
    { "key": "stock", "label": "Stock", "align": "right" }
  ],
  "data": [
    { "name": "Widget", "price": 29.99, "stock": 150 },
    { "name": "Gadget", "price": 49.99, "stock": 89 },
    { "name": "Doohickey", "price": 19.99, "stock": 0 }
  ]
}
```

**Example 2: With rich formatting**

```json
{
  "columns": [
    { "key": "symbol", "label": "Stock", "priority": "primary" },
    {
      "key": "price",
      "label": "Price",
      "align": "right",
      "priority": "primary",
      "format": { "kind": "currency", "currency": "USD", "decimals": 2 }
    },
    {
      "key": "change",
      "label": "Change %",
      "align": "right",
      "priority": "secondary",
      "format": {
        "kind": "percent",
        "basis": "unit",
        "decimals": 2,
        "showSign": true
      }
    },
    {
      "key": "status",
      "label": "Status",
      "priority": "secondary",
      "format": {
        "kind": "status",
        "statusMap": {
          "up": { "tone": "success", "label": "Gaining" },
          "down": { "tone": "danger", "label": "Falling" },
          "stable": { "tone": "neutral", "label": "Stable" }
        }
      }
    }
  ],
  "data": [
    { "symbol": "AAPL", "price": 178.25, "change": 2.5, "status": "up" },
    { "symbol": "GOOGL", "price": 142.8, "change": -1.2, "status": "down" },
    { "symbol": "MSFT", "price": 420.55, "change": 0.1, "status": "stable" }
  ],
  "emptyMessage": "No stocks available"
}
```

**Example 3: Arrays of primitives (strings, numbers, booleans)**

```json
{
  "columns": [
    { "key": "feature", "label": "Feature" },
    {
      "key": "tags",
      "label": "Tags",
      "format": { "kind": "array", "maxVisible": 3 }
    },
    {
      "key": "scores",
      "label": "Scores",
      "format": { "kind": "array", "maxVisible": 2 }
    },
    { "key": "flags", "label": "Flags", "format": { "kind": "array" } }
  ],
  "data": [
    {
      "feature": "Authentication",
      "tags": ["security", "oauth", "jwt"],
      "scores": [9.5, 8.7, 9.2],
      "flags": [true, false, true]
    },
    {
      "feature": "Analytics",
      "tags": ["tracking", "metrics"],
      "scores": [7.8, 8.1],
      "flags": [true, true]
    }
  ]
}
```

**Example 4: Rendering the tool result**

```tsx
import { parseSerializableDataTable } from "@/components/tool-ui/data-table/schema";

// In your tool UI component
function StockTableToolUI({ result }: { result: unknown }) {
  // Validate and parse the LLM's response
  const { columns, data } = parseSerializableDataTable(result);

  return (
    <DataTable
      columns={columns}
      data={data}
      responseActions={[
        { id: "export", label: "Export CSV", variant: "secondary" },
        { id: "refresh", label: "Refresh", variant: "default" },
      ]}
      onResponseAction={(actionId) => {
        if (actionId === "export") {
          exportToCsv(data);
        }
      }}
    />
  );
}
```

### Type Safety

Use the provided schemas for validation:

```tsx
import {
  serializableDataTableSchema,
  parseSerializableDataTable,
  type SerializableDataTable,
} from "@/components/tool-ui/data-table/schema";

// Validate unknown data
const result = serializableDataTableSchema.safeParse(unknownData);
if (result.success) {
  // result.data is SerializableDataTable
}

// Or use the parser (throws on error)
const tableProps = parseSerializableDataTable(unknownData);
```

## Utility Functions

The component exports helpful utility functions:

### sortData

Sort an array of objects by a key:

```tsx
import { sortData } from "@/components/tool-ui/data-table";

const sorted = sortData(rows, "price", "desc");
```

## Responsive Behavior

The DataTable automatically adapts to **container size** (not viewport size) using CSS container queries. This allows it to work correctly in viewport simulators and constrained layouts.

- **Desktop (≥768px):**
  - Full table layout with sortable columns
  - Horizontal scroll with gradient shadow affordances
  - Compact touch targets (36px)

- **Mobile (<768px):**
  - Accordion card layout (expandable)
  - Primary columns in card header (always visible)
  - Secondary columns in expanded section (tap to reveal)
  - Tertiary columns hidden
  - Large touch targets (44px minimum)
  - **Stable IDs:** Accordion state persists across sorting/filtering using `rowIdKey`

**Breakpoint:** 768px (Tailwind `@md`)

### Accordion State Persistence

**Critical:** Mobile accordion expanded/collapsed state survives data reorders (sorting, filtering) when you provide `rowIdKey`.

```tsx
// ❌ Without rowIdKey: expanded state lost on sort
<DataTable columns={columns} data={stocks} />

// ✅ With rowIdKey: expanded state persists across sorts
<DataTable columns={columns} data={stocks} rowIdKey="symbol" />
```

**How it works:**

- Each accordion uses `rowIdKey` value as its stable identifier (e.g., `"row-AAPL"`)
- When data reorders, the accordion finds the same row by ID and preserves its state
- Falls back to composite key (`index-columnKey`) if no `rowIdKey` provided

**Example:** User expands "AAPL" row, then sorts by price. With `rowIdKey`, "AAPL" stays expanded at its new position.

### Container Queries vs Media Queries

The component uses container queries on modern browsers and automatically falls back to viewport media queries on older browsers:

- **Modern browsers (Chrome 105+, Safari 16+, Firefox 110+):** Uses container queries (`@md:`), responding to the container's width. Perfect for component playgrounds, iframes, and constrained layouts.

- **Older browsers:** Uses viewport media queries (`md:`), responding to the viewport width. Still fully functional, just less flexible in nested layouts.

See [Browser Support](#browser-support) for more details.

## Accessibility

The DataTable component is designed with comprehensive accessibility support for both desktop and mobile layouts.

### Desktop Table Accessibility

**Semantic HTML Structure:**

- Proper `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements
- Column headers use `<th scope="col">` for proper associations
- Sortable headers announce state via `aria-sort` attribute
- Live region announces sort changes (`aria-live="polite"`)

**Keyboard Navigation:**

- `Tab` - Navigate between sortable headers and action buttons
- `Enter` / `Space` - Activate sort or action button
- `↓` / `↑` - Navigate dropdown menu (when 3+ actions)
- `Esc` - Close dropdown menu

### Mobile Card Accessibility

**Critical:** When the table switches to accordion card layout on mobile, it maintains table semantics through ARIA roles to preserve the screen reader experience.

**ARIA Table Semantics:**

- Container has `role="table"` with descriptive label
- Each card has `role="row"` with accessible row identifier
- Data cells have `role="cell"` with proper labeling
- Hidden description lists all column names for context

**Heading Structure:**

- Primary field in each card uses `role="heading" aria-level="3"`
- Creates navigable landmark for screen reader users
- Provides hierarchy: page → table → row → heading

**Accessible Labels:**

- Each row: `"Row N: [primary value]"` (e.g., "Row 1: AAPL")
- Each data cell: `"[Column label]: [value]"` (e.g., "Price: $174.50")
- Expandable sections: `"Row details"` region

**ARIA Relationships:**

- `aria-labelledby` links data values to their labels
- `aria-describedby` connects expanded content to trigger
- `role="group"` for summary information sections
- `role="region"` for expandable detail areas

**Example Screen Reader Experience:**

```
Desktop table mode:
  → "Data table, 10 rows, 7 columns"
  → "Symbol column header, sortable, sorted ascending"
  → "AAPL, row 1"
  → "Price: $174.50"

Mobile card mode:
  → "Data table, mobile card view. Table data shown as expandable cards."
  → "Row 1: AAPL, button expanded"
  → "Heading level 3: AAPL"
  → "Price: $174.50"
  → "Row details region"
  → "Additional data list"
```

### Screen Reader Testing

Tested with:

- **NVDA** (Windows) with Chrome/Firefox
- **JAWS** (Windows) with Chrome/Edge
- **VoiceOver** (macOS/iOS) with Safari
- **TalkBack** (Android) with Chrome

All major screen readers correctly:

- Announce table structure in both desktop and mobile modes
- Navigate between rows and cells
- Read column labels with data values
- Announce sort state changes
- Describe expandable content

## Advanced: Compound Components

For custom layouts, use the compound component API:

```tsx
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  useDataTable,
} from "@/components/tool-ui/data-table";

function CustomTable() {
  return (
    <DataTable columns={columns} data={rows}>
      <CustomHeader />
      <CustomBody />
    </DataTable>
  );
}

function CustomHeader() {
  const { columns } = useDataTable();
  return (
    <thead>
      <tr>
        {columns.map((col) => (
          <th key={col.key}>{col.label}</th>
        ))}
      </tr>
    </thead>
  );
}
```

## Assistant-UI Integration

This component is designed to work with assistant-ui's tool UI system:

```tsx
// Tool definition
const tools = {
  getStocks: {
    description: 'Get stock market data',
    parameters: z.object({
      columns: z.array(z.object({
        key: z.string(),
        label: z.string(),
      })),
      data: z.array(
        z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]))
      ),
    }),
    execute: async () => {
      // Fetch and return data in DataTable format
      return {
        columns: [
          { key: 'symbol', label: 'Symbol' },
          { key: 'price', label: 'Price', align: 'right' },
        ],
        data: [
          { symbol: 'AAPL', price: 178.25 },
        ],
      }
    },
  },
}

// Render in chat
<DataTable
  {...toolResult}
  responseActions={[
    { id: "export", label: "Export", variant: "secondary" },
  ]}
  onResponseAction={(actionId) => {
    if (actionId === 'export') {
      // Export the data
      exportToCsv(toolResult.data);
    }
  }}
/>
```

## Styling

The component uses standard Tailwind CSS classes and supports dark mode automatically via the `dark:` variant.

Custom CSS variables (inherited from your theme):

- `--background`
- `--foreground`
- `--muted`
- `--muted-foreground`
- `--border`
- `--primary`
- `--destructive`

The component targets the Shadcn token set (e.g., `--background`, `--foreground`, `--muted`). If your host uses different tokens (e.g., assistant-ui), map them at the app shell to these names to keep copy-paste friction low.

## Limitations

This v0.2.0 release does not include:

- Virtualization (performance degrades >100 rows - recommend pagination)
- Column reordering/resizing
- Multi-column sorting
- Inline editing
- Custom cell renderers
- Export to CSV/Excel
- Column visibility toggle UI (use priority system instead)

For these features, consider [TanStack Table](https://tanstack.com/table) or [AG Grid](https://www.ag-grid.com/).

## Troubleshooting

**Actions not working?**

- Ensure `onAction` handler is provided
- Check that action `id` matches your handler logic

**Sort not working?**

- If using controlled sort, ensure `onSortChange` updates parent state
- Verify column has `sortable: true` (default)

**Mobile accordion layout not showing?**

- Check viewport width (<768px triggers accordion cards)
- Ensure Tailwind `md` breakpoint is configured correctly
- Verify accordion UI component is installed

**Columns not showing on mobile?**

- Check column `priority` settings (tertiary columns are hidden)
- Verify `hideOnMobile` isn't set to `true`
- First 2 columns default to primary (visible)

**Scroll shadows not appearing?**

- Ensure table content is wider than container
- Check that CSS variables (`--background`) are defined
- Verify scroll detection hook is working (try resizing window)

**Dark mode issues?**

- Verify CSS variables are defined in your global styles
- Check that `.dark` class is applied to root element

## License

MIT

## Changelog

### 0.1.0 (2025-10-31)

Initial release with full features:

**Core Features:**

- Table rendering with compound components
- Column sorting (ascending/descending/none)
- Row actions (inline buttons and dropdown menu)
- Loading and empty states
- Full keyboard navigation
- Accessible with WCAG 2.1 AA compliance

**Mobile Responsiveness:**

- Accordion card layout for mobile (expandable cards)
- Column priority system (`primary`, `secondary`, `tertiary`)
- Smart column priority defaults (auto-assigns first 2 as primary)
- Touch-optimized interactions (44px minimum touch targets)
- `hideOnMobile` column option for simple hiding
- Container queries (`@md:`) for container-based responsiveness

**Desktop Features:**

- Mobile breakpoint at 768px

**Components:**

- `DataTable` - Main table component
- `DataTableHeader` - Header row with sortable columns
- `DataTableBody` - Body container
- `DataTableRow` - Table row
- `DataTableCell` - Table cell
- `DataTableActions` - Actions dropdown/buttons
- `DataTableAccordionCard` - Mobile accordion card component
