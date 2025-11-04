# Data Table Component Specification

## Project Context

You are building a data table component for **assistant-ui's open-source widget registry**. This component will be rendered within assistant-ui's chat interface when an LLM makes a tool call that returns tabular data.

**Key Differentiators:**
- Components accept JSON-serializable props from LLM tool call responses
- Designed to render within assistant-ui's tool UI system
- Copy-paste distribution model (like Shadcn), not npm packages
- Built on Radix primitives with Tailwind styling
- Accessibility and responsiveness are mandatory, not optional

---

## Assistant-UI Integration Requirements

### Tool Call Rendering Flow

```typescript
// 1. User sends message to LLM
"Show me top performing stocks"

// 2. LLM calls tool with structured params
{
  toolName: "get_stocks",
  args: { limit: 10, sortBy: "performance" }
}

// 3. Tool returns data in DataTable-compatible format
{
  columns: [
    { key: "symbol", label: "Symbol" },
    { key: "price", label: "Price", align: "right" },
    { key: "change", label: "Change %", align: "right" }
  ],
  data: [
    { symbol: "AAPL", price: 178.25, change: 2.3 },
    { symbol: "GOOGL", price: 142.50, change: 1.8 }
  ]
}

// 4. assistant-ui renders DataTable component with result
<DataTable {...toolResult} />
```

### Component Registration Pattern

The component must be registerable with assistant-ui's tool UI system:

```tsx
import { DataTable } from '@/components/data-table'

// Register with assistant-ui
const toolUIComponents = {
  get_stocks: DataTable,
  search_products: DataTable,
  analyze_data: DataTable,
  // Any tool returning tabular data
}
```

**Requirements:**
- Component receives tool result as props directly (no wrapper needed)
- Must handle being rendered in assistant-ui's message thread context
- Must work within assistant-ui's theme system
- Actions should integrate with assistant-ui's ability to trigger follow-up messages/tool calls

---

### Assistant-UI Specific Props

In addition to standard props, the component should accept:

```typescript
interface DataTableProps {
  // ... (all previous props)
  
  // Assistant-UI integration props
  messageId?: string;              // ID of the message containing this tool result
  // Single integration surface for actions; context provides sendMessage
  onAction?: (actionId: string, row: Record<string, any>, context: {
    messageId?: string;
    sendMessage?: (message: string) => void;
  }) => void;
}
```

**Action handling in assistant-ui context:**

```tsx
// When user clicks "View Details" action
onAction={(actionId, row, { sendMessage }) => {
  if (actionId === 'view') {
    // Trigger follow-up message that LLM can respond to
    sendMessage?.(`Show me detailed information for ${row.symbol}`)
  }
}}
```

---

### Theme Compatibility

**Must work with assistant-ui's CSS variables:**
- Inherit text colors from message context
- Use semantic color tokens that map to assistant-ui's theme
- Support both light/dark modes via assistant-ui's theme provider
- Match assistant-ui's border radius, spacing, and typography scales

**Example CSS variable mapping:**
```css
/* Instead of hardcoded colors, use semantic tokens */
.data-table {
  background: var(--aui-background);
  border-color: var(--aui-border);
  color: var(--aui-foreground);
}

.data-table-header {
  background: var(--aui-muted);
  color: var(--aui-muted-foreground);
}
```

**Fallback:** If assistant-ui tokens don't exist, fall back to standard Tailwind/Shadcn tokens.

---

### Responsive Context

Component will be rendered within assistant-ui's message bubble constraints:

**Desktop:**
- Max width: typically 700-800px (constrained by chat thread)
- Must handle narrow viewports gracefully
- Horizontal scroll for wide tables (with visual affordance)

**Mobile:**
- Full viewport width minus padding (typically ~20px margins)
- Card layout is essential (tables are unusable in 320-375px)

**Within assistant-ui's thread:**
- Component is part of a message list
- Should not have excessive height (consider max-height with scroll)
- Should not cause layout shift after initial render

---

## Component Requirements

### 1. Core Functionality

**Must support:**
- Display tabular data with customizable columns
- Column sorting (asc/desc/none) - state managed internally or externally
- Row actions that integrate with assistant-ui's message flow
- Responsive mobile behavior (collapse to cards/stacked layout)
- Empty states
- Loading states (inline skeleton)
- Text truncation with overflow handling
- Multiple column alignments (left/right/center)
- **Horizontal scroll for wide tables on narrow viewports**

**Must NOT support (out of scope for v1):**
- Virtualization (for 1000+ rows)
- Inline editing
- Column reordering/resizing
- Row selection/bulk actions
- Filtering UI (can be added externally)
- Nested/expandable rows
- Custom cell renderers (beyond text formatting)

---

### 2. Data Contract (JSON Schema)

```typescript
interface DataTableProps {
  // Column definitions
  columns: Array<{
    key: string;                    // Unique identifier, maps to row data
    label: string;                  // Display header text
    sortable?: boolean;             // Default: true
    align?: 'left' | 'right' | 'center'; // Default: 'left'
    width?: string;                 // Optional CSS width (e.g., "150px", "20%")
  }>;
  
  // Row data - array of objects where keys match column keys
  data: Array<Record<string, string | number | boolean | null>>;
  
  // Optional actions per row
  actions?: Array<{
    id: string;                     // Action identifier
    label: string;                  // Button text
    variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
    requiresConfirmation?: boolean; // Show confirm dialog before action
  }>;
  
  // Optional configuration
  sortBy?: string;                  // Initial sort column key
  sortDirection?: 'asc' | 'desc';   // Initial sort direction
  emptyMessage?: string;            // Custom empty state text
  isLoading?: boolean;              // Show skeleton state
  maxHeight?: string;               // Max height before scroll (e.g., "400px")
  
  // Assistant-UI integration
  messageId?: string;               // ID of containing message
  
  // Event handlers (these are the ONLY non-serializable props)
  onAction?: (actionId: string, row: Record<string, any>, context?: {
    messageId?: string;
    sendMessage?: (message: string) => void;
  }) => void;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
}
```

**Serialization constraints:**
- All props except `onAction` and `onSort` must be JSON-serializable
- Row values must be primitives (string, number, boolean, null)
- Dates must be ISO-8601 strings ("2024-10-31T10:00:00Z")
- Currency values must be numbers or formatted strings
- No RegExp, Function, Symbol, undefined, or class instances

---

### 3. Technical Stack

**Required dependencies:**
- React 18+
- TypeScript
- Tailwind CSS 3+
- **Radix UI primitives:**
  - `@radix-ui/react-dropdown-menu` (for action overflow)
  - `@radix-ui/react-alert-dialog` (for confirmation dialogs, if needed)

**Component structure (compound components):**
```tsx
<DataTable>
  <DataTableHeader>
    <DataTableHead />
  </DataTableHeader>
  <DataTableBody>
    <DataTableRow>
      <DataTableCell />
    </DataTableRow>
  </DataTableBody>
</DataTable>
```

**Internal structure allows:**
- Customization of individual parts
- Context sharing between components
- Flexibility for advanced use cases
- Standard composition pattern

**Context provider pattern:**
```tsx
const DataTableContext = React.createContext<{
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  // ... other shared state
}>({})
```

---

### 4. Accessibility Requirements (WCAG 2.1 AA)

**Keyboard navigation:**
- Tab moves focus between sortable headers and action buttons
- Enter/Space activates focused element (sort or action)
- Dropdown actions: Arrow keys navigate menu, Esc closes
- No keyboard traps

**Screen reader support:**
- Semantic HTML: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- Sortable headers: `aria-sort="ascending|descending|none"`
- Sort buttons have descriptive labels: "Sort by {column}, currently {state}"
- Action buttons: "View details for {identifier from row}" 
- Row context provided: Use `aria-label` or `aria-labelledby` on action buttons
- Empty/loading states: `aria-live="polite"` announcements
- Action dropdowns: proper `aria-haspopup` and focus management

**Focus management:**
- Visible focus indicators (Tailwind `focus-visible:ring-2`)
- Focus doesn't get lost during sort updates
- Returning from dropdown action: focus returns to trigger button
- Modal confirmation dialogs: focus trap + focus return

**Color contrast:**
- All text: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Sort indicators visible in both light and dark modes
- Don't rely solely on color (icons + text for actions/state)

**Reduced motion:**
- Respect `prefers-reduced-motion` for skeleton animations
- No auto-playing animations

---

### 5. Responsive Design

**Breakpoint strategy:**
- **Desktop (≥768px)**: Full table layout, horizontal scroll if needed
- **Tablet (≥640px, <768px)**: Full table with tighter spacing
- **Mobile (<640px)**: Card layout (no horizontal scroll for tables)

**Mobile card layout requirements:**
```tsx
// Each row becomes a card
<div className="border rounded-lg p-4 space-y-2">
  <div className="font-medium">{row[primaryColumn]}</div>
  {columns.map(col => (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{col.label}:</span>
      <span>{row[col.key]}</span>
    </div>
  ))}
  <div className="flex gap-2 mt-3">
    {actions.map(action => <Button>{action.label}</Button>)}
  </div>
</div>
```

**Desktop overflow handling:**
- Table container: `overflow-x: auto` with shadow indicators (fade on edges)
- Min-width on table to maintain column readability
- Scroll hint for users (subtle fade or shadow)

**Within assistant-ui constraints:**
- Respect parent max-width (typically 700-800px)
- If table wider than container: horizontal scroll with visual affordance
- Consider `maxHeight` prop for very long tables (virtual scroll out of scope, but height limit + scroll is acceptable)

---

### 6. Styling Requirements

**Tailwind + CSS Variables:**
```css
:root {
  /* Standard Shadcn/assistant-ui tokens */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  /* ... etc */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... etc */
}
```

**Component styling classes:**
```tsx
<table className="w-full border-collapse">
  <thead className="bg-muted/50 border-b">
    <tr>
      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
        {/* header content */}
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3 text-sm">
        {/* cell content */}
      </td>
    </tr>
  </tbody>
</table>
```

**Dark mode:**
- Works via `dark:` classes automatically
- No manual theme detection needed
- Inherits from assistant-ui's theme provider

**Loading skeleton:**
```tsx
<div className="h-4 bg-muted/50 rounded animate-pulse" />
```

---

### 7. Behavior Specifications

#### Sorting
- Click column header to cycle: none → asc → desc → none
- Visual indicator: Arrow icon changes (↑ ↓) or neutral state
- Only one column sorted at a time
- If `onSort` provided: emit events (controlled component)
- If no `onSort`: manage state internally (uncontrolled)
- Sorting logic:
  - Numbers: numeric comparison
  - Strings: case-insensitive alphabetical
  - Booleans: false < true
  - Nulls: always sorted to end
  - Mixed types in column: group by type, then sort within type

#### Actions
- **1-2 actions:** Inline buttons (horizontal layout)
- **3+ actions:** Dropdown menu (Radix DropdownMenu)
  - Trigger button: "Actions" or "•••"
  - Menu items: all action labels
  - Keyboard: Arrow keys, Enter to select, Esc to close
- **Action execution:**
  - Call `onAction(actionId, row, context)`
  - Context includes `messageId` and `sendMessage` if available
  - Support confirmation dialog for destructive actions (`requiresConfirmation: true`)
- **Action variants:**
  - `default`: primary CTA styling
  - `secondary`: subtle button
  - `ghost`: minimal styling
  - `destructive`: red/warning colors

#### Empty State
- Trigger: `rows.length === 0` and `!isLoading`
- Display: Centered message in table body area
- Headers: Still visible for context
- Default message: "No data available"
- Custom: Use `emptyMessage` prop
- No action column shown

#### Loading State (Inline Skeleton)
- Trigger: `isLoading === true`
- Display: 3-5 skeleton rows
- Skeleton structure matches column layout
- Each cell: gray pulsing block (`animate-pulse`)
- Sorting disabled during load
- Actions hidden during load

#### Text Overflow
- Long cell content: truncate with ellipsis
- Use Tailwind `truncate` utility
- Consider: `max-w-[200px]` or similar constraints
- No tooltips in v1 (accessibility complexity)
- Mobile cards: Allow wrapping for readability

#### Height Management
- If `maxHeight` provided: container has max height + vertical scroll
- Sticky header: `position: sticky; top: 0;` when scrolling vertically
- Useful for long tables in chat context

---

### 8. Utility Functions (Exported)

```typescript
// utilities.ts

/**
 * Sort an array of objects by a key
 */
export function sortData<T extends Record<string, any>>(
  data: T[],
  key: string,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    // Handle nulls
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1
    
    // Type-specific comparison
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    // String comparison (case-insensitive)
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const comparison = aStr.localeCompare(bStr)
    
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Format cell values for display
 */
export function formatCellValue(
  value: string | number | boolean | null,
  options?: {
    currency?: string;
    decimals?: number;
    dateFormat?: 'short' | 'long';
  }
): string {
  if (value == null) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') {
    if (options?.currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: options.currency,
      }).format(value)
    }
    if (options?.decimals != null) {
      return value.toFixed(options.decimals)
    }
    return value.toLocaleString()
  }
  
  // ISO date detection and formatting
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return options?.dateFormat === 'long'
          ? date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : date.toLocaleDateString()
      }
    } catch {
      // Fall through to return as-is
    }
  }
  
  return String(value)
}

/**
 * Generate accessible label for action button
 */
export function getActionLabel(
  actionLabel: string,
  row: Record<string, any>,
  identifierKey?: string
): string {
  const identifier = identifierKey 
    ? row[identifierKey] 
    : row.name || row.title || row.id || Object.values(row)[0]
  
  return `${actionLabel} for ${identifier}`
}
```

---

### 9. Edge Cases to Handle

**Data quality:**
- Missing column keys in row: display empty cell
- Extra keys in row: ignore silently
- Empty string: display as-is (not "—")
- Very long column labels: wrap text, don't truncate headers
- Very long cell values: truncate with ellipsis
- Zero rows: empty state
- Actions defined but no rows: hide action column

**Rendering edge cases:**
- 1 column: works normally
- 1 row: works normally
- 100+ rows: document performance limitation, suggest pagination
- No columns: show error message or empty state
- Mismatched column keys: show "—" for missing data
- Actions without `onAction` handler: buttons disabled or hidden

**Type handling:**
- Mixed types in same column: group by type, sort within groups
- Boolean values: display "Yes"/"No"
- Null/undefined: display "—"
- ISO date strings: optionally format (see utility function)
- Numbers: maintain alignment (right-align recommended)

**Assistant-UI specific:**
- Component unmounts/remounts: preserve sort state if controlled
- Parent width changes: re-evaluate mobile/desktop breakpoint
- Theme changes: styles update automatically via CSS variables
- Message thread scrolling: component should not break layout

---

### 10. File Structure

```
data-table/
├── index.tsx                   # Re-exports all components
├── data-table.tsx              # Root DataTable component + context
├── data-table-header.tsx       # Header/thead compound component
├── data-table-body.tsx         # Body/tbody compound component
├── data-table-row.tsx          # Row/tr compound component
├── data-table-cell.tsx         # Cell/td compound component
├── data-table-actions.tsx      # Actions dropdown/buttons
├── data-table-skeleton.tsx     # Loading skeleton (inline)
├── utilities.ts                # Exported utility functions
└── README.md                   # Documentation
```

**File header format:**
```tsx
// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2024-10-31
// License: Apache-2.0
```

**Example index.tsx:**
```tsx
export { DataTable } from './data-table'
export { DataTableHeader } from './data-table-header'
export { DataTableBody } from './data-table-body'
export { DataTableRow } from './data-table-row'
export { DataTableCell } from './data-table-cell'
export type { DataTableProps } from './data-table'
export * from './utilities'
```

---

### 11. Code Quality Standards

**TypeScript:**
- Strict mode enabled
- No `any` except in `Record<string, any>` for row data
- Export all interfaces and types
- JSDoc comments on public APIs

**React patterns:**
- Functional components with hooks
- Context for shared state between compounds
- `useMemo` for expensive operations (sorting)
- `useCallback` for event handlers passed to children
- Controlled + uncontrolled: support both patterns

**Performance:**
- Don't re-sort on every render
- Memoize sorted data
- Memoize column definitions
- Avoid inline function definitions in render
- Consider `React.memo` for row components if needed

**Error boundaries:**
- Graceful degradation for malformed data
- Console.error for developer issues (missing keys, type mismatches)
- Never throw errors that break the UI

---

### 12. Testing Requirements

**Must pass:**
- Renders with minimal props
- Renders empty state correctly
- Renders loading skeleton
- Sorting cycles through states (none → asc → desc → none)
- Actions call `onAction` with correct arguments
- Responsive breakpoint triggers card layout
- Keyboard navigation works (tab, enter, arrows in dropdown)
- Axe accessibility audit passes (0 violations)

**Assistant-UI specific tests:**
- Renders within assistant-ui message context
- Integrates with assistant-ui theme (CSS vars work)
- Actions can trigger follow-up messages via `sendMessage`
- `messageId` prop is passed through to action callbacks

**Test data:**
```typescript
const mockColumns = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'price', label: 'Price', align: 'right' as const },
  { key: 'change', label: 'Change %', align: 'right' as const },
]

const mockRows = [
  { symbol: 'AAPL', price: 178.25, change: 2.3 },
  { symbol: 'GOOGL', price: 142.50, change: -0.8 },
  { symbol: 'MSFT', price: 380.00, change: 1.2 },
]

const mockActions = [
  { id: 'view', label: 'View Details', variant: 'default' as const },
  { id: 'buy', label: 'Buy', variant: 'secondary' as const },
  { id: 'remove', label: 'Remove', variant: 'destructive' as const },
]
```

---

### 13. Documentation Requirements (README.md)

#### Installation
```bash
# Install Radix dependencies
npm install @radix-ui/react-dropdown-menu

# Install Shadcn button (if not already present)
npx shadcn@latest add button

# Copy component files
# (Download from registry or manual copy-paste)
```

#### Basic Usage
```tsx
import { DataTable } from '@/components/data-table'

<DataTable
  columns={[
    { key: 'name', label: 'Product' },
    { key: 'price', label: 'Price', align: 'right' },
  ]}
  data={[
    { name: 'Widget', price: 29.99 },
    { name: 'Gadget', price: 49.99 },
  ]}
/>
```

#### Assistant-UI Integration

**Tool Definition:**
```typescript
import { z } from 'zod'

const getStocksSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    align: z.enum(['left', 'right', 'center']).optional(),
  })),
  data: z.array(z.record(z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null()
  ]))),
})

// Register with assistant-ui
const tools = {
  get_stocks: {
    description: 'Get stock market data',
    parameters: getStocksSchema,
    execute: async (args) => {
      // Fetch data and return in schema format
      return {
        columns: [
          { key: 'symbol', label: 'Symbol' },
          { key: 'price', label: 'Price', align: 'right' },
        ],
        data: [
          { symbol: 'AAPL', price: 178.25 },
        ]
      }
    },
    // Register the UI component
    render: DataTable,
  },
}
```

**Rendering in Chat:**
```tsx
import { useAssistant } from '@assistant-ui/react'
import { DataTable } from '@/components/data-table'

function ChatMessage({ message }) {
  if (message.toolCalls) {
    return message.toolCalls.map(tc => {
      if (tc.toolName === 'get_stocks') {
        return (
          <DataTable
            {...tc.result}
            messageId={message.id}
            onAction={(actionId, row, { sendMessage }) => {
              if (actionId === 'view') {
                sendMessage?.(`Show detailed info for ${row.symbol}`)
              }
            }}
          />
        )
      }
    })
  }
  
  return <MessageContent>{message.content}</MessageContent>
}
```

#### Props API Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | Required | Column definitions |
| `data` | `Record<string, any>[]` | Required | Row data |
| `actions` | `Action[]` | `undefined` | Row actions |
| `defaultSort` | `{ by?: string; direction?: 'asc'|'desc' }` | `undefined` | Initial sort state (uncontrolled) |
| `sort` | `{ by?: string; direction?: 'asc'|'desc' }` | `undefined` | Controlled sort state |
| `onSortChange` | `(next) => void` | `undefined` | Sort change handler (controlled) |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `emptyMessage` | `string` | `"No data available"` | Empty state text |
| `maxHeight` | `string` | `undefined` | Max height with scroll |
| `messageId` | `string` | `undefined` | Assistant-UI message ID |
| `onAction` | `function` | `undefined` | Action click handler |

#### Compound Component Usage

```tsx
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
} from '@/components/data-table'

// Custom composition
<DataTable>
  <DataTableHeader>
    {columns.map(col => (
      <DataTableHead key={col.key} {...col} />
    ))}
  </DataTableHeader>
  <DataTableBody>
    {rows.map((row, i) => (
      <DataTableRow key={i}>
        {columns.map(col => (
          <DataTableCell key={col.key} align={col.align}>
            {row[col.key]}
          </DataTableCell>
        ))}
      </DataTableRow>
    ))}
  </DataTableBody>
</DataTable>
```

#### Utility Functions

```tsx
import { sortData, formatCellValue, getActionLabel } from '@/components/data-table'

// Sort data manually
const sorted = sortData(rows, 'price', 'desc')

// Format values
const formatted = formatCellValue(29.99, { currency: 'USD' })
// => "$29.99"

// Generate accessible action labels
const label = getActionLabel('View', { name: 'Widget' })
// => "View for Widget"
```

#### Examples

**With Actions:**
```tsx
<DataTable
  columns={columns}
  data={rows}
  actions={[
    { id: 'view', label: 'View' },
    { id: 'edit', label: 'Edit' },
    { id: 'delete', label: 'Delete', variant: 'destructive' },
  ]}
  onAction={(id, row) => console.log(id, row)}
/>
```

**With Loading State:**
```tsx
<DataTable
  columns={columns}
  data={[]}
  isLoading={true}
/>
```

**With Custom Sort:**
```tsx
<DataTable
  columns={columns}
  data={rows}
  sortBy="price"
  sortDirection="desc"
  onSort={(key, dir) => console.log(`Sorted by ${key} ${dir}`)}
/>
```

**Responsive Demo:**
Include screenshots:
- Desktop: Full table
- Mobile: Card layout

#### Accessibility

**Keyboard shortcuts:**
- `Tab` - Navigate to sortable headers and actions
- `Enter` / `Space` - Activate sort or action button
- `↓` / `↑` - Navigate action dropdown menu (if 3+ actions)
- `Esc` - Close dropdown menu

**Screen reader support:**
- Table structure announced with row/column counts
- Sortable columns announce current sort state
- Action buttons include row context in label

#### Troubleshooting

**Issue: Actions not triggering**
- Ensure `onAction` handler is provided
- Check that action `id` matches what you're checking for

**Issue: Sort not working**
- Verify column has `sortable: true` (default)
- If using controlled sort, ensure `onSort` updates parent state

**Issue: Mobile layout not activating**
- Check viewport width (<640px for cards)
- Ensure Tailwind responsive classes are working

**Issue: Theme not matching assistant-ui**
- Verify CSS variables are defined in parent context
- Check that `dark:` mode classes are applying

---

### 14. Visual Design Reference

Provide these examples in documentation:

1. **Default state:** Table with 5 rows, one column sorted (arrow visible)
2. **Action buttons:** 
   - Inline (2 actions)
   - Dropdown (3+ actions with menu open)
3. **Empty state:** Centered message with headers visible
4. **Loading state:** 3 skeleton rows with pulsing animation
5. **Mobile view:** Stacked cards with labels inline
6. **Dark mode:** Same table in dark theme
7. **Sorted states:** Show all three states (none, asc, desc)
8. **Horizontal scroll:** Wide table with scroll shadows
9. **Assistant-UI context:** Component within message bubble

---

### 15. Integration Example (Complete Flow)

```tsx
'use client'

import { useAssistantRuntime, useThreadConfig } from '@assistant-ui/react'
import { DataTable } from '@/components/data-table'
import { z } from 'zod'

// Tool schema matching DataTable props
const stockTableSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    align: z.enum(['left', 'right', 'center']).optional(),
  })),
  data: z.array(z.record(z.any())),
})

// Register tool with assistant-ui
const tools = {
  getStocks: {
    description: 'Fetch stock market data',
    parameters: stockTableSchema,
    execute: async ({ limit = 10 }) => {
      const response = await fetch(`/api/stocks?limit=${limit}`)
      const data = await response.json()

      // Return data in DataTable format
      return {
        columns: [
          { key: 'symbol', label: 'Symbol' },
          { key: 'price', label: 'Price', align: 'right' },
          { key: 'change', label: 'Change %', align: 'right' },
          { key: 'volume', label: 'Volume', align: 'right' },
        ],
        data: data.stocks.map(s => ({
          symbol: s.symbol,
          price: s.currentPrice,
          change: s.changePercent,
          volume: s.volume,
        })),
      }
    },
  },
}

// Chat component with DataTable rendering
export function StockChat() {
  const runtime = useAssistantRuntime()
  
  useThreadConfig({
    tools,
    // Map tool results to UI components
    components: {
      ToolResult: ({ toolName, result, messageId }) => {
        if (toolName === 'getStocks') {
          return (
            <DataTable
              {...result}
              actions={[
                { id: 'view', label: 'Details' },
                { id: 'buy', label: 'Buy', variant: 'secondary' },
              ]}
              onAction={(actionId, row, { sendMessage }) => {
                if (actionId === 'view') {
                  // Trigger follow-up LLM interaction
                  sendMessage?.(
                    `Show me detailed analysis for ${row.symbol} including recent news and analyst ratings`
                  )
                }
                if (actionId === 'buy') {
                  sendMessage?.(
                    `Help me buy shares of ${row.symbol}. What's the current price and recommended quantity?`
                  )
                }
              }}
              messageId={messageId}
            />
          )
        }
        return null
      },
    },
  })

  return <AssistantUIChat />
}
```

---

### 16. Constraints & Trade-offs

**In scope:**
- Tabular data display
- Basic sorting (single column)
- Row-level actions
- Responsive mobile layout
- Screen reader support
- Assistant-UI integration

**Out of scope (v1):**
- Virtualization
- Column reordering/resizing
- Advanced filtering UI
- Multi-column sort
- Inline editing
- Custom cell renderers
- Export to CSV/Excel
- Column grouping/nesting

**Known limitations:**
- Performance degrades beyond ~100 rows (recommend pagination at tool level)
- No frozen columns
- Limited formatting (use utility functions or format at tool level)
- Actions limited to simple callbacks (no complex workflows)

**When to use alternatives:**
- **TanStack Table:** Need virtualization, complex filtering, advanced features
- **AG Grid:** Need enterprise grid features, Excel-like editing
- **Custom solution:** Need domain-specific cell renderers, highly customized layouts

---

### 17. Success Criteria

✅ **Functional:**
- Renders with tool call data (no transformation needed)
- Sorting works (all 3 states)
- Actions trigger correctly with row context
- Empty and loading states display properly
- Mobile breakpoint triggers card layout

✅ **Assistant-UI Integration:**
- Works within message thread
- Integrates with theme system
- Actions can trigger follow-up messages
- No layout issues in constrained width

✅ **Accessibility:**
- Keyboard navigation complete
- Screen reader announces table structure
- Sort state changes announced
- Action labels include row context
- Axe audit passes (0 violations)

✅ **Technical:**
- TypeScript strict mode, no errors
- No console warnings in normal use
- Dark mode works automatically
- Responsive at all breakpoints
- Props are JSON-serializable (except handlers)

✅ **Documentation:**
- README covers all use cases
- Assistant-UI integration examples included
- Tool definition examples provided
- Props API fully documented
- Troubleshooting section included

---

### 18. Open Decisions (Resolve During Build)

**1. Action overflow behavior:**
- ✅ Dropdown after 2 actions (better mobile UX)
- Document: "Actions show inline for 1-2 items, dropdown for 3+"

**2. Sort indicator style:**
- ✅ Arrow icons (↑ ↓) - most recognizable
- Show neutral state with both arrows grayed out or no arrows

**3. Mobile card primary field:**
- Option A: First column is always primary
- Option B: First column with `primary: true` flag
- ✅ **Decision:** A - simpler, first column is title/name by convention

**4. Empty state enhancement:**
- v1: Plain centered text
- v2: Icon + text + optional action button

**5. Horizontal scroll affordance:**
- Subtle gradient fade on edges
- Or shadow indicators
- ✅ **Decision:** CSS gradient fade on left/right edges when scrollable

**6. Assistant-UI CSS variable naming:**
- Option A: Use standard Shadcn vars (`--background`, `--foreground`)
- Option B: Create assistant-ui specific vars (`--aui-background`)
- ✅ **Decision:** A with fallbacks - use Shadcn conventions, they likely match assistant-ui

**7. Context provider scope:**
- Only sort state, or include columns, rows, etc.?
- ✅ **Decision:** Minimal - only shared state (sort, actions config)

**8. Skeleton row count:**
- Fixed 3 rows, or configurable?
- ✅ **Decision:** Fixed 5 rows - simple and adequate

---

### 19. Version & Maintenance

**Initial version:** 0.1.0

**Versioning scheme:**
- **Major (1.0.0):** Breaking changes to props or behavior
- **Minor (0.x.0):** New features, new props (backwards compatible)
- **Patch (0.0.x):** Bug fixes, visual tweaks

**Upgrade path:**
- File headers track version
- Changelog in README
- Migration guides for breaking changes
- Consider CLI tool for upgrades in future

---

## Delivery Checklist

- [ ] Compound components: `DataTable`, `DataTableHeader`, `DataTableBody`, `DataTableRow`, `DataTableCell`
- [ ] Actions component with dropdown support
- [ ] Inline skeleton for loading state
- [ ] Utility functions exported (sort, format, labels)
- [ ] TypeScript types exported
- [ ] README with assistant-ui integration section
- [ ] Tool definition example
- [ ] Complete integration example
- [ ] Screenshots: desktop, mobile, dark mode, states
- [ ] Accessibility testing notes (keyboard, screen reader)
- [ ] Mobile responsive testing notes
- [ ] Assistant-UI theme compatibility verified
