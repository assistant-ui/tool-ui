# DataTable Component

A flexible, accessible data table component for assistant-ui's widget registry. Built with Radix UI primitives and Tailwind CSS.

**Version:** 0.1.0
**License:** Apache-2.0

## Features

- ✅ Responsive design (table on desktop, cards on mobile)
- ✅ Column sorting with visual indicators
- ✅ Row actions (inline buttons or dropdown menu)
- ✅ Empty and loading states
- ✅ Accessible keyboard navigation
- ✅ Dark mode support
- ✅ Compound component API for customization

## Installation

The component requires these dependencies (likely already installed):

```bash
npm install @radix-ui/react-dropdown-menu lucide-react
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
└── utilities.ts
```

Also ensure you have the dropdown-menu UI component:

```
components/ui/dropdown-menu.tsx
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
  key: string                      // Unique identifier, maps to row data
  label: string                    // Display header text
  sortable?: boolean               // Default: true
  align?: 'left' | 'right' | 'center'  // Default: 'left'
  width?: string                   // Optional CSS width (e.g., "150px")
}
```

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

The DataTable automatically adapts to screen size:

- **Desktop (≥768px):** Full table layout with horizontal scroll if needed
- **Tablet (≥640px, <768px):** Full table with tighter spacing
- **Mobile (<640px):** Card layout with labels inline

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

This v0.1.0 release does not include:

- Virtualization (performance degrades >100 rows)
- Column reordering/resizing
- Multi-column sorting
- Inline editing
- Custom cell renderers
- Export to CSV/Excel
- Confirmation dialogs (requiresConfirmation flag is defined but not implemented)

For these features, consider [TanStack Table](https://tanstack.com/table) or [AG Grid](https://www.ag-grid.com/).

## Troubleshooting

**Actions not working?**
- Ensure `onAction` handler is provided
- Check that action `id` matches your handler logic

**Sort not working?**
- If using controlled sort, ensure `onSort` updates parent state
- Verify column has `sortable: true` (default)

**Mobile layout not showing?**
- Check viewport width (<640px triggers cards)
- Ensure Tailwind responsive classes are configured

**Dark mode issues?**
- Verify CSS variables are defined in your global styles
- Check that `.dark` class is applied to root element

## License

Apache-2.0

## Changelog

### 0.1.0 (2025-10-31)

Initial release with core functionality:
- Table rendering with compound components
- Sorting (ascending/descending/none)
- Actions (inline + dropdown)
- Responsive design (table → cards)
- Loading and empty states
- Basic accessibility
