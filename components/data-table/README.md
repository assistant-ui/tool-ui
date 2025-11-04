# DataTable Component

A flexible, accessible data table component for assistant-ui's widget registry. Built with Radix UI primitives and Tailwind CSS.

**Version:** 0.1.0
**License:** Apache-2.0

## Features

### Desktop
- ✅ Full table layout with sortable columns
- ✅ Horizontal scroll with gradient shadow affordances
- ✅ Row actions (inline buttons or dropdown menu)
- ✅ Visual sort indicators (chevron icons)

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
npm install @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-tooltip lucide-react
# or
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-accordion @radix-ui/react-tooltip lucide-react
```

### Tailwind Setup

This component uses container queries. Ensure your Tailwind setup supports:

- `@container` on a wrapping element
- Container query variants like `@md:`

If your project doesn’t already provide these, either replace `@md:` with breakpoint variants like `md:` or add container‑query support via a plugin. Example config:

```js
// tailwind.config.{js,ts}
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  plugins: [require("@tailwindcss/container-queries")],
}
```

Copy the following files to your project:

```
components/data-table/
├── index.tsx
├── data-table.tsx
├── data-table-header.tsx
├── data-table-body.tsx
├── data-table-row.tsx
├── data-table-cell.tsx
├── data-table-actions.tsx
├── data-table-accordion-card.tsx  # Mobile card component
├── use-scroll-shadow.ts           # Scroll detection hook
├── use-container-query.ts         # Container query feature detection
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
├── alert-dialog.tsx  # For action confirmations
└── button.tsx
```

## Browser Support

### Supported Browsers

The DataTable component works in all modern browsers:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome / Edge | 105+ (Sept 2022) | Full support including container queries |
| Safari | 16+ (Sept 2022) | Full support including container queries |
| Firefox | 110+ (Feb 2023) | Full support including container queries |
| Chrome / Edge | 88-104 | ⚠️ Fallback mode (uses viewport media queries instead of container queries) |
| Safari | 14-15 | ⚠️ Fallback mode (uses viewport media queries instead of container queries) |
| Firefox | 102-109 | ⚠️ Fallback mode (uses viewport media queries instead of container queries) |

### Feature Detection

The component automatically detects browser support for CSS Container Queries and falls back to regular media queries in older browsers:

- **Modern browsers** (Chrome 105+, Safari 16+, Firefox 110+): Uses container queries for optimal responsiveness
- **Older browsers**: Automatically falls back to viewport-based media queries

**What this means:**
- ✅ Component works in all browsers
- ✅ Modern browsers get container-based responsive behavior (better for component playgrounds, iframes, etc.)
- ✅ Older browsers get viewport-based responsive behavior (still fully functional)

### Tailwind CSS Container Queries

The component uses Tailwind CSS container query utilities (`@container`, `@md:`). Ensure your Tailwind configuration includes container query support:

**Option 1: Add the plugin** (recommended)
```bash
npm install @tailwindcss/container-queries
# or
pnpm add @tailwindcss/container-queries
```

```js
// tailwind.config.{js,ts}
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  plugins: [require("@tailwindcss/container-queries")],
}
```

**Option 2: Use viewport breakpoints**

If you can't use container queries in your project, the fallback system will automatically use standard Tailwind breakpoints (`md:`, `lg:`, etc.) instead. The component will still work, but will respond to viewport width instead of container width.

### Testing Browser Support

To verify browser support in your project:

```tsx
import { useSupportsContainerQueries } from '@/components/data-table/use-container-query'

function BrowserCheck() {
  const supported = useSupportsContainerQueries()
  return <div>Container Queries: {supported ? '✅ Supported' : '⚠️ Fallback mode'}</div>
}
```

### Known Limitations

- **IE11**: Not supported (no ES6 support)
- **Very old browsers** (<2020): Component may not render correctly
- **SSR/SSG**: Feature detection runs client-side, so there may be a brief flash during hydration as the component switches between container and media queries

## Basic Usage

```tsx
import { DataTable } from '@/components/data-table'

function MyComponent() {
  return (
    <DataTable
      columns={[
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Product' },
        { key: 'price', label: 'Price', align: 'right' },
        { key: 'stock', label: 'Stock', align: 'right' },
      ]}
      data={[
        { id: '1', name: 'Widget', price: 29.99, stock: 150 },
        { id: '2', name: 'Gadget', price: 49.99, stock: 89 },
        { id: '3', name: 'Doohickey', price: 19.99, stock: 0 },
      ]}
      rowIdKey="id"  // ⚠️ Strongly recommended for stable React reconciliation
    />
  )
}
```

> **💡 Tip:** Always include a unique `id` field in your data and pass `rowIdKey="id"`. This prevents React reconciliation issues when data reorders. See the [Props API section](#datatableprops) for details.

## Props API

### DataTableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | Required | Column definitions |
| `data` | `Record<string, any>[]` | Required | Row data |
| `actions` | `Action[]` | `undefined` | Row action buttons |
| `rowIdKey` | `string` | `undefined` | **⚠️ Strongly Recommended:** Key in each row used for stable React keys (see warning below) |
| `defaultSort` | `{ by?: string; direction?: 'asc'|'desc' }` | `undefined` | Initial sort (uncontrolled) |
| `sort` | `{ by?: string; direction?: 'asc'|'desc' }` | `undefined` | Controlled sort state |
| `onSortChange` | `(next) => void` | `undefined` | Controlled sort change handler |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `emptyMessage` | `string` | `"No data available"` | Empty state message |
| `maxHeight` | `string` | `undefined` | Max height with vertical scroll |
| `onAction` | `function` | `undefined` | Action button click handler |
| `locale` | `string` | `undefined` | Locale for formatting/sorting (e.g., `en-US`) |
| `className` | `string` | `undefined` | Additional CSS classes |

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
  key: string                         // Unique identifier, maps to row data
  label: string                       // Display header text
  sortable?: boolean                  // Default: true (OPT-OUT: set to false to disable)
  align?: 'left' | 'right' | 'center' // Default: 'left'
  width?: string                      // Optional CSS width (e.g., "150px")
  truncate?: boolean                  // Opt-in truncate cell content (default: false)

  // Mobile Responsiveness (NEW in v0.2.0)
  priority?: 'primary' | 'secondary' | 'tertiary'  // Mobile display priority
  hideOnMobile?: boolean              // Simple override to hide on mobile
}
```

> **⚠️ Note on Sortable Default**
>
> Columns are **sortable by default** (opt-out pattern). This means:
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

### Action

```typescript
interface Action {
  id: string                       // Action identifier
  label: string                    // Button text
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive'
  requiresConfirmation?: boolean   // Future: show confirm dialog
}
```

## Examples

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
```

#### Disabling Sorting on Specific Columns

To disable sorting for columns that shouldn't be sortable:

```tsx
const columns = [
  { key: 'id', label: 'ID', sortable: false },        // IDs often don't need sorting
  { key: 'name', label: 'Name' },                     // Sortable (default)
  { key: 'price', label: 'Price' },                   // Sortable (default)
  { key: 'actions', label: 'Actions', sortable: false }, // Action columns shouldn't sort
]
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
  defaultSort={{ by: 'price', direction: 'desc' }}
/>
```

### With Actions

```tsx
<DataTable
  columns={columns}
  data={rows}
  actions={[
    { id: 'view', label: 'View', variant: 'secondary' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', variant: 'destructive' },
  ]}
  onAction={(actionId, row) => {
    if (actionId === 'view') {
      console.log('Viewing:', row)
    } else if (actionId === 'delete') {
      console.log('Deleting:', row)
    }
  }}
/>
```

**Note:** 1-2 actions show as inline buttons. 3+ actions show in a dropdown menu.

### Loading State

```tsx
<DataTable
  columns={columns}
  data={[]}
  isLoading={true}
/>
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
<DataTable
  columns={columns}
  data={manyRows}
  maxHeight="400px"
/>
```

## Mobile Responsiveness

The DataTable automatically adapts to mobile devices with an accordion card layout and intelligent column prioritization.

### Basic Mobile Example

```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Product' },              // Auto: primary
    { key: 'price', label: 'Price', align: 'right' }, // Auto: primary
    { key: 'category', label: 'Category' },          // Auto: secondary (collapsed)
    { key: 'stock', label: 'Stock', align: 'right' }, // Auto: secondary (collapsed)
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
    { key: 'symbol', label: 'Symbol', priority: 'primary' },
    { key: 'name', label: 'Company', priority: 'primary' },
    { key: 'price', label: 'Price', priority: 'primary', align: 'right' },

    { key: 'change', label: 'Change %', priority: 'secondary', align: 'right' },
    { key: 'volume', label: 'Volume', priority: 'secondary', align: 'right' },
    { key: 'marketCap', label: 'Market Cap', priority: 'secondary', align: 'right' },

    { key: 'pe', label: 'P/E Ratio', priority: 'tertiary', align: 'right' },
    { key: 'eps', label: 'EPS', priority: 'tertiary', align: 'right' },
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
    { key: 'name', label: 'Product' },
    { key: 'price', label: 'Price', align: 'right' },
    { key: 'internalId', label: 'ID', hideOnMobile: true }, // Hidden on mobile
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
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type FormatConfig =
  | { kind: 'text' }
  | { kind: 'number'; decimals?: number; unit?: string; compact?: boolean; showSign?: boolean }
  | { kind: 'currency'; currency: string; decimals?: number }
  | { kind: 'percent'; decimals?: number; showSign?: boolean; basis?: 'fraction' | 'unit' }
  | { kind: 'date'; dateFormat?: 'short' | 'long' | 'relative' }
  | { kind: 'delta'; decimals?: number; upIsPositive?: boolean; showSign?: boolean }
  | { kind: 'status'; statusMap: Record<string, { tone: Tone; label?: string }> }
  | { kind: 'boolean'; labels?: { true: string; false: string } }
  | { kind: 'link'; hrefKey?: string; external?: boolean }
  | { kind: 'badge'; colorMap?: Record<string, Tone> }
  | { kind: 'array'; maxVisible?: number }
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
  todo: { tone: 'neutral', label: 'To Do' },
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

### Serializable vs React-Only Props

The DataTable component is designed for use with LLM tool calls, where data must be JSON-serializable. The component's props are split into two categories:

**✅ Serializable Props** (can come from LLM tool calls):
- `columns` - Column definitions
- `data` / `rows` - Row data
- `actions` - Action button definitions
- `defaultSort` - Initial sort state (optional)
- `emptyMessage` - Empty state text
- `maxHeight` - Max height CSS value
- `messageId` - Message identifier string
- `rowIdKey` - Row identifier key

**❌ React-Only Props** (must be provided by your React code):
- `onAction` - Function handler for action button clicks
- `onSortChange` - Function handler for sort changes (controlled mode)
- `className` - CSS class names
- `isLoading` - Loading state boolean

### Rules for Serializable Data

- **No functions, Symbols, or class instances** in row data
- **Dates must be ISO strings** (e.g., `"2025-11-03T12:34:56Z"`)
- **Column `format` configs are fully serializable** - no render functions needed
- The built-in `date` formatter accepts strings and parses them to `Date` internally

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
  "rows": [
    { "name": "Widget", "price": 29.99, "stock": 150 },
    { "name": "Gadget", "price": 49.99, "stock": 89 },
    { "name": "Doohickey", "price": 19.99, "stock": 0 }
  ]
}
```

**Example 2: With formatting and actions**
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
      "format": { "kind": "percent", "basis": "unit", "decimals": 2, "showSign": true }
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
  "rows": [
    { "symbol": "AAPL", "price": 178.25, "change": 2.5, "status": "up" },
    { "symbol": "GOOGL", "price": 142.80, "change": -1.2, "status": "down" },
    { "symbol": "MSFT", "price": 420.55, "change": 0.1, "status": "stable" }
  ],
  "actions": [
    { "id": "view", "label": "View Details", "variant": "secondary" },
    { "id": "buy", "label": "Buy", "variant": "default" },
    { "id": "sell", "label": "Sell", "variant": "destructive", "requiresConfirmation": true }
  ],
  "emptyMessage": "No stocks available"
}
```

**Example 3: Rendering the tool result**
```tsx
import { parseSerializableDataTable } from '@/components/data-table/schema'

// In your tool UI component
function StockTableToolUI({ result }: { result: unknown }) {
  // Validate and parse the LLM's response
  const { columns, data, actions } = parseSerializableDataTable(result)

  return (
    <DataTable
      columns={columns}
      data={data}
      actions={actions}
      onAction={(actionId, row, context) => {
        // Your React handler - not serializable
        if (actionId === 'view') {
          context?.sendMessage?.(`Show details for ${row.symbol}`)
        }
      }}
      // Controlled sorting (optional)
      // sort={sort}
      // onSortChange={setSort}
    />
  )
}
```

### Type Safety

Use the provided schemas for validation:

```tsx
import {
  serializableDataTableSchema,
  parseSerializableDataTable,
  type SerializableDataTable
} from '@/components/data-table/schema'

// Validate unknown data
const result = serializableDataTableSchema.safeParse(unknownData)
if (result.success) {
  // result.data is SerializableDataTable
}

// Or use the parser (throws on error)
const tableProps = parseSerializableDataTable(unknownData)
```

## Utility Functions

The component exports helpful utility functions:

### sortData

Sort an array of objects by a key:

```tsx
import { sortData } from '@/components/data-table'

const sorted = sortData(rows, 'price', 'desc')
```

### formatCellValue

A lightweight helper for simple formatting (currency, decimals, dates, booleans). For table rendering, prefer `Column.format` which is more expressive and consistent across desktop and mobile.

### getActionLabel

Generate accessible labels for action buttons:

```tsx
import { getActionLabel } from '@/components/data-table'

getActionLabel('View', { name: 'Widget' })
// => "View for Widget"

getActionLabel('Delete', { id: 123, title: 'My Item' }, 'title')
// => "Delete for My Item"
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
  - Actions moved to expanded section

**Breakpoint:** 768px (Tailwind `@md`)

### Container Queries vs Media Queries

The component uses container queries on modern browsers and automatically falls back to viewport media queries on older browsers:

- **Modern browsers (Chrome 105+, Safari 16+, Firefox 110+):** Uses container queries (`@md:`), responding to the container's width. Perfect for component playgrounds, iframes, and constrained layouts.

- **Older browsers:** Uses viewport media queries (`md:`), responding to the viewport width. Still fully functional, just less flexible in nested layouts.

See [Browser Support](#browser-support) for more details.

## Accessibility

### Keyboard Navigation

- `Tab` - Navigate between sortable headers and action buttons
- `Enter` / `Space` - Activate sort or action button
- `↓` / `↑` - Navigate dropdown menu (when 3+ actions)
- `Esc` - Close dropdown menu

### Screen Reader Support

- Semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`)
- Sortable headers announce state via `aria-sort`
- Action buttons include row context (future enhancement)

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
} from '@/components/data-table'

function CustomTable() {
  return (
    <DataTable columns={columns} data={rows}>
      <CustomHeader />
      <CustomBody />
    </DataTable>
  )
}

function CustomHeader() {
  const { columns } = useDataTable()
  return (
    <thead>
      <tr>
        {columns.map(col => (
          <th key={col.key}>{col.label}</th>
        ))}
      </tr>
    </thead>
  )
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
      rows: z.array(
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
        rows: [
          { symbol: 'AAPL', price: 178.25 },
        ],
      }
    },
  },
}

// Render in chat
<DataTable
  {...toolResult}
  onAction={(actionId, row) => {
    if (actionId === 'view') {
      // Trigger follow-up interaction
      sendMessage(`Show detailed info for ${row.symbol}`)
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

Apache-2.0

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
- Horizontal scroll gradient shadows for wide tables
- `useScrollShadow` hook for scroll detection
- Mobile breakpoint at 768px

**Components:**
- `DataTable` - Main table component
- `DataTableHeader` - Header row with sortable columns
- `DataTableBody` - Body container
- `DataTableRow` - Table row
- `DataTableCell` - Table cell
- `DataTableActions` - Actions dropdown/buttons
- `DataTableAccordionCard` - Mobile accordion card component
