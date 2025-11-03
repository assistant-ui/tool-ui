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
npm install @radix-ui/react-dropdown-menu @radix-ui/react-accordion lucide-react
# or
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-accordion lucide-react
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
├── data-table-accordion-card.tsx  # NEW - Mobile card component
├── use-scroll-shadow.ts           # NEW - Scroll detection hook
└── utilities.ts
```

Also ensure you have these UI components:

```
components/ui/
├── dropdown-menu.tsx
├── accordion.tsx  # NEW
└── button.tsx
```

## Basic Usage

```tsx
import { DataTable } from '@/components/data-table'

function MyComponent() {
  return (
    <DataTable
      columns={[
        { key: 'name', label: 'Product' },
        { key: 'price', label: 'Price', align: 'right' },
        { key: 'stock', label: 'Stock', align: 'right' },
      ]}
      rows={[
        { name: 'Widget', price: 29.99, stock: 150 },
        { name: 'Gadget', price: 49.99, stock: 89 },
        { name: 'Doohickey', price: 19.99, stock: 0 },
      ]}
    />
  )
}
```

## Props API

### DataTableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | Required | Column definitions |
| `rows` | `Record<string, any>[]` | Required | Row data |
| `actions` | `Action[]` | `undefined` | Row action buttons |
| `sortBy` | `string` | `undefined` | Initial/controlled sort column |
| `sortDirection` | `'asc' \| 'desc'` | `undefined` | Initial/controlled sort direction |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `emptyMessage` | `string` | `"No data available"` | Empty state message |
| `maxHeight` | `string` | `undefined` | Max height with vertical scroll |
| `onAction` | `function` | `undefined` | Action button click handler |
| `onSort` | `function` | `undefined` | Sort change handler (controlled mode) |
| `className` | `string` | `undefined` | Additional CSS classes |

### Column

```typescript
interface Column {
  key: string                         // Unique identifier, maps to row data
  label: string                       // Display header text
  sortable?: boolean                  // Default: true
  align?: 'left' | 'right' | 'center' // Default: 'left'
  width?: string                      // Optional CSS width (e.g., "150px")

  // Mobile Responsiveness (NEW in v0.2.0)
  priority?: 'primary' | 'secondary' | 'tertiary'  // Mobile display priority
  hideOnMobile?: boolean              // Simple override to hide on mobile
}
```

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

### With Sorting (Controlled)

```tsx
const [sortBy, setSortBy] = useState<string>()
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()

<DataTable
  columns={columns}
  rows={rows}
  sortBy={sortBy}
  sortDirection={sortDirection}
  onSort={(key, direction) => {
    setSortBy(key)
    setSortDirection(direction)
  }}
/>
```

### With Actions

```tsx
<DataTable
  columns={columns}
  rows={rows}
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
  rows={[]}
  isLoading={true}
/>
```

### Empty State

```tsx
<DataTable
  columns={columns}
  rows={[]}
  emptyMessage="No products found. Try adjusting your filters."
/>
```

### With Max Height

```tsx
<DataTable
  columns={columns}
  rows={manyRows}
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
  rows={products}
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
  rows={stocks}
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
  rows={products}
/>
```

### Desktop Scroll Affordances

Wide tables on desktop show gradient shadows when scrollable:

```tsx
<DataTable
  columns={manyColumns} // 10+ columns
  rows={data}
/>
```

**Visual Indicators:**
- Gradient fade appears on left when scrolled right
- Gradient fade appears on right when more content available
- Touch-optimized momentum scrolling

### Touch Optimization

All interactive elements are automatically optimized for touch:

- **Sortable headers**: Enhanced tap area
- **Action buttons**: 44px minimum height on mobile
- **Accordion triggers**: Large touch target
- **Active states**: Visual feedback on tap

## Utility Functions

The component exports helpful utility functions:

### sortData

Sort an array of objects by a key:

```tsx
import { sortData } from '@/components/data-table'

const sorted = sortData(rows, 'price', 'desc')
```

### formatCellValue

Format cell values for display:

```tsx
import { formatCellValue } from '@/components/data-table'

// Currency
formatCellValue(29.99, { currency: 'USD' })
// => "$29.99"

// Decimals
formatCellValue(3.14159, { decimals: 2 })
// => "3.14"

// Dates
formatCellValue('2025-10-31T10:00:00Z', { dateFormat: 'long' })
// => "October 31, 2025"

// Booleans
formatCellValue(true)
// => "Yes"

// Nulls
formatCellValue(null)
// => "—"
```

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

- **Desktop (container ≥768px):**
  - Full table layout with sortable columns
  - Horizontal scroll with gradient shadow affordances
  - Compact touch targets (36px)

- **Mobile (container <768px):**
  - Accordion card layout (expandable)
  - Primary columns in card header (always visible)
  - Secondary columns in expanded section (tap to reveal)
  - Tertiary columns hidden
  - Large touch targets (44px minimum)
  - Actions moved to expanded section

**Container Breakpoint:** 768px (Tailwind `@md` container query)

> **Note:** The component uses container queries (`@md:`) instead of media queries (`md:`), so it responds to its parent container's width, not the viewport. This makes it work perfectly in viewport simulators, component playgrounds, and responsive layouts.

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
    <DataTable columns={columns} rows={rows}>
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
      rows: z.array(z.record(z.any())),
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

## Limitations

This v0.2.0 release does not include:

- Virtualization (performance degrades >100 rows - recommend pagination)
- Column reordering/resizing
- Multi-column sorting
- Inline editing
- Custom cell renderers
- Export to CSV/Excel
- Confirmation dialogs (requiresConfirmation flag is defined but not implemented)
- Column visibility toggle UI (use priority system instead)

For these features, consider [TanStack Table](https://tanstack.com/table) or [AG Grid](https://www.ag-grid.com/).

## Troubleshooting

**Actions not working?**
- Ensure `onAction` handler is provided
- Check that action `id` matches your handler logic

**Sort not working?**
- If using controlled sort, ensure `onSort` updates parent state
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
