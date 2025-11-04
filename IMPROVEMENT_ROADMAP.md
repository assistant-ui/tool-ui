# ToolUI Improvement Roadmap

This document outlines actionable changes to improve the codebase quality, production readiness, and developer experience.

## Progress Summary

**Last Updated**: 2025-11-03

### Completed Items (8)
- ✅ **#1**: Fix Sortable Header Accessibility (CRITICAL)
- ✅ **#2**: Fix Type Safety Violations (CRITICAL)
- ✅ **#3**: Implement Proper Zod Schema Validation (CRITICAL)
- ✅ **#4**: Add Error Boundaries (CRITICAL)
- ✅ **#5**: Implement Action Confirmation Dialogs (CRITICAL)
- ✅ **#6**: Fix Serialization Documentation (CRITICAL)
- ✅ **#7**: Document Browser Support & Add Feature Detection (CRITICAL)
- ✅ **#8**: Fix Numeric Auto-Alignment Bug (HIGH)

### In Progress (0)

### Remaining Critical (0)

## Priority Levels

- 🔴 **CRITICAL**: Must fix before public release (blockers)
- 🟡 **HIGH**: Should fix soon (affects usability/reliability)
- 🟢 **MEDIUM**: Important but not urgent (quality improvements)
- 🔵 **LOW**: Nice-to-have (enhancements)

---

## 🔴 CRITICAL ISSUES

### 1. Fix Sortable Header Accessibility (UPGRADED PRIORITY)

**File**: `components/data-table/data-table-header.tsx:69-98`

**Current**: Interactive `<th>` element with `onClick` and `tabIndex`.

**Problems**:
1. Missing `scope="col"` on all table headers (WCAG 2.1 Level A violation)
2. Clickable `<th>` is not semantically a control - screen readers won't announce as sortable
3. No visible `:focus-visible` ring for keyboard users
4. No `aria-label` describing the action

**Current code**:
```typescript
<th
  className={cn(/* ... */)}
  onClick={handleClick}
  onKeyDown={(e) => { /* ... */ }}
  tabIndex={0}
  aria-sort={/* ... */}
>
  <div className="inline-flex min-w-0 items-center gap-1">
    {/* label + chevron */}
  </div>
</th>
```

**Solution**: Wrap content in a `<button>` inside the `<th>`:
```typescript
<th
  scope="col"
  className="font-normal text-muted-foreground px-4 py-3"
  style={column.width ? { width: column.width } : undefined}
  aria-sort={
    isSorted
      ? direction === "asc"
        ? "ascending"
        : "descending"
      : undefined
  }
>
  <button
    type="button"
    onClick={handleClick}
    onKeyDown={(e) => {
      if (isDisabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    }}
    disabled={isDisabled}
    className={cn(
      "inline-flex w-full min-w-0 items-center gap-1",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
      alignClass,
      !isDisabled && "hover:text-foreground cursor-pointer",
      isDisabled && "cursor-not-allowed opacity-60",
      column.align === "right" && "flex-row-reverse",
      column.align === "center" && "justify-center",
    )}
    aria-label={`Sort by ${column.label}`}
    aria-disabled={isDisabled || undefined}
  >
    {/* existing label + chevron content */}
  </button>
</th>
```

**Action Items**:
- [x] Add `scope="col"` to all `<th>` elements (including Actions column)
- [x] Wrap sortable header content in `<button type="button">`
- [x] Add focus-visible ring styles
- [x] Add descriptive `aria-label`
- [x] Move `aria-sort` to `<th>`, keep other ARIA on `<button>`
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Test keyboard-only navigation

**Why this is critical**:
- This is a WCAG 2.1 **Level A** violation (not AA) - fails basic accessibility
- Screen reader users cannot understand that columns are sortable
- Keyboard-only users cannot see focus state
- This will be immediately flagged by accessibility audits

**Files to modify**:
- `components/data-table/data-table-header.tsx`


---

### 2. Fix Type Safety Violations

**File**: `components/data-table/data-table.tsx:174`

**Current**:
```typescript
<DataTableContext.Provider value={contextValue as unknown as DataTableContextValue}>
```

**Problem**: Double type assertion bypasses TypeScript's type checking entirely.

**Solution**:
```typescript
// Option A: Make context generic-aware
const DataTableContext = React.createContext<DataTableContextValue<any> | undefined>(undefined);

// Option B: Separate typed and untyped contexts
// Option C: Use discriminated union for context value

// Recommended: Option A with proper generic constraints
```

**Action Items**:
- [x] Remove `as unknown as` cast
- [x] Make `DataTableContext` properly generic: `React.createContext<DataTableContextValue<T>>`
- [x] Update `useDataTable` hook to preserve generic type
- [x] Test with multiple data types to verify type inference

**Files to modify**:
- `components/data-table/data-table.tsx`


---

### 3. Implement Proper Zod Schema Validation

**File**: `components/data-table/schema.ts:22`

**Current**:
```typescript
const formatSchema = z.object({ kind: formatKindEnum }).passthrough();
```

**Problem**: `.passthrough()` allows any properties, defeating validation purpose.

**Solution**:
```typescript
const formatSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text") }),
  z.object({
    kind: z.literal("number"),
    decimals: z.number().optional(),
    unit: z.string().optional(),
    compact: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("currency"),
    currency: z.string(),
    decimals: z.number().optional(),
  }),
  z.object({
    kind: z.literal("percent"),
    decimals: z.number().optional(),
    showSign: z.boolean().optional(),
    basis: z.enum(["fraction", "unit"]).optional(),
  }),
  z.object({
    kind: z.literal("date"),
    dateFormat: z.enum(["short", "long", "relative"]).optional(),
  }),
  z.object({
    kind: z.literal("delta"),
    decimals: z.number().optional(),
    upIsPositive: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("status"),
    statusMap: z.record(z.object({
      tone: z.enum(["success", "warning", "danger", "info", "neutral"]),
      label: z.string().optional(),
    })),
  }),
  z.object({
    kind: z.literal("boolean"),
    labels: z.object({
      true: z.string(),
      false: z.string(),
    }).optional(),
  }),
  z.object({
    kind: z.literal("link"),
    hrefKey: z.string().optional(),
    external: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("badge"),
    colorMap: z.record(z.enum(["success", "warning", "danger", "info", "neutral"])).optional(),
  }),
  z.object({
    kind: z.literal("array"),
    maxVisible: z.number().optional(),
  }),
]);
```

**Action Items**:
- [x] Replace `.passthrough()` with discriminated union
- [ ] Add comprehensive tests for schema validation
- [ ] Document expected format configurations
- [ ] Add error messages for invalid schemas

**Files to modify**:
- `components/data-table/schema.ts`


---

### 4. Add Error Boundaries

**Current**: No error boundaries exist anywhere.

**Problem**: One bad formatter or row can crash entire table.

**Solution**: Add error boundaries at multiple levels.

**Action Items**:
- [x] Create `components/data-table/error-boundary.tsx`
- [x] Wrap entire DataTable in error boundary
- [ ] Wrap individual formatters in error boundary
- [x] Add fallback UI for errors
- [x] Log errors to console (or external service)
- [ ] Add prop for custom error handlers

**Implementation**:
```typescript
// components/data-table/error-boundary.tsx
"use client";

import * as React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class DataTableErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("DataTable Error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="border-destructive text-destructive p-4 border rounded-md">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage**:
```typescript
// Wrap in data-table.tsx
<DataTableErrorBoundary>
  <table className="w-full border-collapse">
    {/* ... */}
  </table>
</DataTableErrorBoundary>
```

**Files to create**:
- `components/data-table/error-boundary.tsx`

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/formatters.tsx`


---

### 5. Implement Action Confirmation Dialogs

**File**: `components/data-table/data-table-actions.tsx`

**Current**: `requiresConfirmation` prop exists but does nothing.

**Problem**: Destructive actions (like delete) can be triggered with one click.

**Solution**: Implement confirmation dialog for actions with `requiresConfirmation: true`.

**Action Items**:
- [x] Add AlertDialog component from Radix UI to `components/ui/`
- [x] Implement confirmation state in DataTableActions
- [x] Add confirmation dialog UI
- [ ] Test with keyboard navigation
- [ ] Document confirmation behavior

**Implementation**:
```typescript
// components/data-table/data-table-actions.tsx
import { AlertDialog, AlertDialogContent, /* ... */ } from "@/components/ui/alert-dialog";

export function DataTableActions({ row }: DataTableActionsProps) {
  const { actions, onAction, messageId } = useDataTable();
  const [confirmingAction, setConfirmingAction] = React.useState<string | null>(null);

  const handleAction = (action: Action) => {
    if (action.requiresConfirmation) {
      setConfirmingAction(action.id);
    } else {
      onAction?.(action.id, row, { messageId });
    }
  };

  const handleConfirm = () => {
    if (confirmingAction) {
      onAction?.(confirmingAction, row, { messageId });
      setConfirmingAction(null);
    }
  };

  // ... rest of implementation
}
```

**Files to create**:
- `components/ui/alert-dialog.tsx` (from Radix UI)

**Files to modify**:
- `components/data-table/data-table-actions.tsx`
- `components/data-table/data-table-accordion-card.tsx` (mobile actions)


---

### 6. Fix Serialization Documentation

**Files**: Multiple (`data-table.tsx`, `schema.ts`, background context)

**Current**: Claims "everything is JSON-serializable" but includes functions.

**Problem**: Misleading documentation; `onAction` and `sendMessage` are functions.

**Solution**: Clarify what's serializable vs. what's React-only.

**Action Items**:
- [x] Separate "Serializable" types from "Component Props" types
- [x] Update schema to only include serializable parts (added comprehensive JSDoc)
- [x] Document which props are for LLM tool calls vs. which are React-only
- [x] Create clear examples of tool call payloads (3 examples in README)

**Implementation**:
```typescript
// Serializable (can come from LLM)
export interface SerializableDataTablePayload {
  columns: SerializableColumn[];
  rows: SerializableRow[];
  actions?: SerializableAction[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  maxHeight?: string;
}

// React Component Props (includes callbacks)
export interface DataTableProps<T extends object = RowData>
  extends Omit<SerializableDataTablePayload, 'columns' | 'rows' | 'actions'> {
  columns: Column<T>[];
  data: T[];
  actions?: Action[];
  messageId?: string;
  onAction?: (actionId: string, row: T, context?: Context) => void;
  onSort?: (columnKey?: ColumnKey<T>, direction?: "asc" | "desc") => void;
  className?: string;
}
```

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/schema.ts`
- `components/data-table/README.md`


---

### 7. Document Browser Support & Add Feature Detection

**File**: `components/data-table/data-table.tsx:175`

**Current**: Uses container queries without feature detection.

**Problem**: Breaks in Safari < 16, Firefox < 110.

**Solution**: Add feature detection and fallback.

**Action Items**:
- [x] Document browser support requirements in README
- [x] Add CSS feature detection (`use-container-query.ts` hook)
- [x] Implement fallback to regular media queries
- [ ] Test in older browsers (manual testing by users)
- [x] Consider using `@container` polyfill or PostCSS plugin (documented as option)

**Implementation**:
```typescript
// components/data-table/use-container-query.ts
export function useSupportsContainerQueries() {
  const [supported, setSupported] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported(CSS.supports('container-type', 'inline-size'));
    }
  }, []);

  return supported;
}

// In data-table.tsx
const supportsContainerQueries = useSupportsContainerQueries();

// Use regular breakpoints as fallback
<div className={cn(
  supportsContainerQueries ? "@container w-full" : "w-full",
  className
)}>
  <div className={supportsContainerQueries ? "hidden @md:block" : "hidden md:block"}>
```

**Files to create**:
- `components/data-table/use-container-query.ts`

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/data-table-actions.tsx`
- `README.md`


---

## 🟡 HIGH PRIORITY

### 8. Fix Numeric Auto-Alignment Bug (NEW)

**File**: `components/data-table/data-table-cell.tsx:21-27`

**Current**: Numbers only right-align if a `format` is specified.

**Problem**: If a column contains numeric values but has no `format` prop, the values align left (incorrect for numbers).

**Example failure**:
```typescript
const columns = [
  { key: "price", label: "Price" }  // No format specified
];
const data = [
  { price: 29.99 }  // Number value, but will align LEFT ❌
];
```

**Current code**:
```typescript
const isNumericKind = (() => {
  const k = (column?.format as { kind?: string } | undefined)?.kind;
  return (
    k === "number" || k === "currency" || k === "percent" || k === "delta"
  );
})();
const align = column.align ?? (isNumericKind ? "right" : "left");
```

**Solution**: Also check the actual value type:
```typescript
const isNumericKind = (() => {
  const k = (column?.format as { kind?: string } | undefined)?.kind;
  return (
    k === "number" || k === "currency" || k === "percent" || k === "delta"
  );
})();
const isNumericValue = typeof value === "number";
const align = column.align ?? (isNumericKind || isNumericValue ? "right" : "left");
```

**Action Items**:
- [x] Add `isNumericValue` check
- [x] Update alignment logic to OR both conditions
- [ ] Add test cases for numbers without format
- [ ] Document that numbers auto-align right even without format

**Files to modify**:
- `components/data-table/data-table-cell.tsx`


---

### 9. Add Comprehensive Usage Documentation

**Files**: `README.md`, `components/data-table/README.md`

**Current**: Says "copy-paste" but doesn't explain how.

**Problem**: Developers don't know how to actually use this.

**Action Items**:
- [ ] Create step-by-step installation guide
- [ ] Document which files to copy
- [ ] List peer dependencies
- [ ] Add 3-5 code examples (basic, with sorting, with actions, mobile preview)
- [ ] Document all props with examples
- [ ] Add troubleshooting section
- [ ] Create migration guide from other table libraries

**Structure**:
```markdown
# DataTable Component

## Installation

### 1. Copy Component Files
Copy these files to your project:
- `components/data-table/data-table.tsx`
- `components/data-table/data-table-*.tsx` (all subcomponents)
- `components/data-table/formatters.tsx`
- `components/data-table/utilities.ts`
- `components/data-table/schema.ts`
- `components/data-table/use-scroll-shadow.ts`

### 2. Install Dependencies
```bash
pnpm add @radix-ui/react-accordion @radix-ui/react-dropdown-menu lucide-react zod
```

### 3. Update Tailwind Config
(if using container queries)

## Usage

### Basic Example
[code example]

### With Sorting
[code example]

### With Actions
[code example]

## API Reference
[detailed prop documentation]

## Formatters
[formatter documentation]

## Mobile Behavior
[mobile documentation]

## Browser Support
[browser support table]

## Troubleshooting
[common issues]
```

**Files to modify**:
- `README.md`
- `components/data-table/README.md`

**Files to create**:
- `docs/INSTALLATION.md`
- `docs/API.md`
- `docs/FORMATTERS.md`
- `docs/EXAMPLES.md`


---

### 10. Fix Sort State Management Pattern

**File**: `components/data-table/data-table.tsx:112-155`

**Current**: Hybrid controlled/uncontrolled pattern.

**Problem**: Can lead to confusing behavior and bugs.

**Solution**: Add `useEffect` to sync controlled props to internal state.

**Action Items**:
- [ ] Remove internal sort state
- [ ] Make sorting always controlled via props
- [ ] Provide default `onSort` handler if none provided
- [ ] Document controlled sorting pattern
- [ ] Add warning in dev mode if `sortBy` is set without `onSort`

**Implementation**:
```typescript
// Keep existing hybrid approach but sync properly
export function DataTable<T extends object = RowData>({
  columns,
  data: rawData,
  sortBy: controlledSortBy,
  sortDirection: controlledSortDirection,
  onSort,
  // ... other props
}: DataTableProps<T>) {
  const [internalSortBy, setInternalSortBy] = React.useState<
    ColumnKey<T> | undefined
  >(controlledSortBy);
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(controlledSortDirection);

  // Sync internal state when controlled props change
  React.useEffect(() => {
    if (controlledSortBy !== undefined && controlledSortDirection !== undefined) {
      // Parent is controlling - update internal state
      setInternalSortBy(controlledSortBy);
      setInternalSortDirection(controlledSortDirection);
    } else if (controlledSortBy === undefined && controlledSortDirection === undefined) {
      // Parent cleared sort - reset internal state
      setInternalSortBy(undefined);
      setInternalSortDirection(undefined);
    }
  }, [controlledSortBy, controlledSortDirection]);

  // ... rest of implementation stays the same
}
```

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/README.md` (update sorting docs)


---

### 11. Add Error Handling to Formatters

**File**: `components/data-table/formatters.tsx`

**Current**: Minimal error handling; some formatters silently fail.

**Problem**: Bad data can cause silent failures or crashes.

**Solution**: Add try-catch blocks and return sensible fallbacks.

**Action Items**:
- [ ] Wrap each formatter in try-catch
- [ ] Return fallback values on error
- [ ] Add optional `onFormatError` callback
- [ ] Log formatting errors in dev mode
- [ ] Add tests for error cases

**Implementation**:
```typescript
function DateValue({ value, options }: DateValueProps) {
  try {
    const dateFormat = options?.dateFormat ?? "short";
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      console.warn(`DateValue: Invalid date "${value}"`);
      return <span className="text-muted-foreground">Invalid date</span>;
    }

    // ... rest of implementation
  } catch (error) {
    console.error('DateValue error:', error);
    return <span className="text-muted-foreground">—</span>;
  }
}

// Similar for all formatters
```

**Files to modify**:
- `components/data-table/formatters.tsx`


---

### 12. Improve Type Safety for Formatters

**File**: `components/data-table/data-table.tsx:14-22`

**Current**: `FormatFor<V>` type doesn't actually constrain the format field.

**Problem**: Can apply wrong formatter to wrong data type.

**Solution**: Use TypeScript's type narrowing more effectively.

**Action Items**:
- [ ] Create separate column type constructors for each data type
- [ ] Use discriminated unions for columns
- [ ] Add runtime validation warning in dev mode
- [ ] Document type-safe column creation

**Implementation**:
```typescript
// Type-safe column builders
export function textColumn<T extends object>(
  config: Omit<Column<T>, 'format'> & {
    format?: Extract<FormatConfig, { kind: "text" | "link" }>
  }
): Column<T> {
  return config as Column<T>;
}

export function numberColumn<T extends object>(
  config: Omit<Column<T>, 'format'> & {
    format?: Extract<FormatConfig, { kind: "number" | "currency" | "percent" | "delta" }>
  }
): Column<T> {
  return config as Column<T>;
}

// Usage:
const columns = [
  textColumn({ key: "name", label: "Name" }),
  numberColumn({
    key: "price",
    label: "Price",
    format: { kind: "currency", currency: "USD" } // Type-safe!
  }),
];
```

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/README.md`


---

### 13. Document Mobile Card Behavior

**File**: `components/data-table/data-table-accordion-card.tsx`

**Current**: Complex priority logic is undocumented.

**Problem**: Developers can't predict mobile layout.

**Action Items**:
- [ ] Document priority system clearly
- [ ] Add visual examples of priority levels
- [ ] Document default behavior (first 2 columns = primary)
- [ ] Add prop to customize primary field
- [ ] Consider simplifying logic if possible

**Documentation needed**:
```markdown
## Mobile Card Layout

### Priority System
Columns are categorized into three priority levels for mobile display:

- **Primary**: Shown in collapsed card (max 2 columns recommended)
  - First primary column becomes the card title
  - Additional primary columns show as subtitle metadata

- **Secondary**: Shown when card is expanded
  - Displayed as key-value pairs

- **Tertiary**: Hidden on mobile
  - Set `priority: "tertiary"` or `hideOnMobile: true`

### Default Behavior
If no priority is set:
- First 2 columns → Primary
- Remaining columns → Secondary

### Examples
[code examples showing different priority configurations]
```

**Files to modify**:
- `components/data-table/README.md`
- Create `docs/MOBILE.md`


---

### 14. Add Bundle Size Information

**Current**: No information about size impact.

**Problem**: Developers need to know cost of adding this component.

**Action Items**:
- [ ] Use `bundlephobia` or `size-limit` to measure bundle size
- [ ] Document total size with all dependencies
- [ ] Document tree-shakeable parts
- [ ] Consider splitting formatters into separate imports
- [ ] Add size badges to README

**Implementation**:
```json
// package.json - add size-limit
{
  "size-limit": [
    {
      "name": "DataTable (full)",
      "path": "components/data-table/index.tsx",
      "import": "{ DataTable }",
      "limit": "50 KB"
    },
    {
      "name": "DataTable (core only)",
      "path": "components/data-table/data-table.tsx",
      "import": "{ DataTable }",
      "limit": "30 KB"
    }
  ]
}
```

**Files to modify**:
- `README.md`
- `package.json`

**Files to create**:
- `.github/workflows/size-limit.yml`


---

## 🟢 MEDIUM PRIORITY

### 15. Add Testing

**Current**: No tests exist.

**Problem**: Can't confidently refactor or accept contributions.

**Action Items**:
- [ ] Set up Vitest or Jest
- [ ] Add React Testing Library
- [ ] Write unit tests for utilities (sortData, formatters)
- [ ] Write component tests for DataTable
- [ ] Write integration tests for actions and sorting
- [ ] Add test coverage reporting
- [ ] Set up CI to run tests

**Priority test coverage**:
- `sortData()` function (all data types)
- All formatters (valid and invalid inputs)
- Sort cycling behavior
- Action triggers
- Mobile card rendering
- Error boundaries

**Files to create**:
- `components/data-table/__tests__/utilities.test.ts`
- `components/data-table/__tests__/formatters.test.tsx`
- `components/data-table/__tests__/data-table.test.tsx`
- `components/data-table/__tests__/sorting.test.tsx`
- `vitest.config.ts`


---

### 16. Optimize Performance

**File**: `components/data-table/data-table.tsx:122-125`

**Current**: Re-sorts on every render.

**Problem**: Performance degrades with large datasets.

**Action Items**:
- [ ] Add performance benchmarks
- [ ] Measure sort performance with 100, 1000, 10000 rows
- [ ] Consider memoization improvements
- [ ] Add optional virtualization for large datasets
- [ ] Document performance characteristics and limits
- [ ] Add warning for datasets > 1000 rows

**Implementation**:
```typescript
// Add virtualization support
import { useVirtualizer } from '@tanstack/react-virtual';

export interface DataTableProps<T> {
  // ... existing props
  enableVirtualization?: boolean;
  estimatedRowHeight?: number;
}

// In component:
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => scrollContainerRef.current,
  estimateSize: () => estimatedRowHeight ?? 50,
  enabled: enableVirtualization,
});
```

**Files to modify**:
- `components/data-table/data-table.tsx`
- `package.json` (add @tanstack/react-virtual as optional peer dep)


---

### 17. Improve Other Accessibility Issues

**Files**: Multiple

**Current**: Sortable headers are now fixed (#1), but other a11y gaps remain.

**Action Items**:
- [ ] Add `aria-describedby` to destructive actions
- [ ] Don't rely on color alone for destructive actions (add icon)
- [ ] Add aria-labels to all interactive elements (headers done in #1)
- [ ] Add skip links for large tables
- [ ] Document keyboard shortcuts
- [ ] Add `title` attribute to truncated content

**Specific fixes**:
```typescript
// data-table-actions.tsx - add icon to destructive
<Button
  variant="destructive"
  aria-describedby={action.requiresConfirmation ? `${action.id}-warning` : undefined}
>
  {action.variant === 'destructive' && <AlertTriangle className="mr-2 h-4 w-4" />}
  {action.label}
</Button>

// formatters.tsx - improve link accessibility
<a
  href={href}
  aria-label={`${value}${external ? ' (opens in new tab)' : ''}`}
  // ...
>
```

**Files to modify**:
- `components/data-table/data-table-actions.tsx`
- `components/data-table/formatters.tsx`
- `components/data-table/data-table-header.tsx`


---

### 18. Enhanced Numeric String Parsing (NEW)

**File**: `components/data-table/utilities.ts:134-142`

**Current**: `parseNumericLike` handles basic numeric strings but misses common formats.

**Problem**: Values like `$1,200`, `12%`, or `(1,234)` don't sort numerically.

**Missing formats**:
- Currency symbols: `$1,200`, `€50`, `£100`, `¥1000`
- Percentage signs: `12%`, `45.5%`
- Accounting negatives: `(1,234)` → -1234
- International formatting: `1 234,56` (French), non-breaking spaces

**Current code**:
```typescript
function parseNumericLike(input: string): number | null {
  // Remove common number formatting (commas, spaces)
  const normalized = input.replace(/[,\s]/g, '')
  if (/^[+-]?(?:\d+\.?\d*|\d*\.\d+)$/.test(normalized)) {
    const n = Number(normalized)
    return isNaN(n) ? null : n
  }
  return null
}
```

**Enhanced version**:
```typescript
function parseNumericLike(input: string): number | null {
  // Remove: commas, spaces, non-breaking spaces, narrow non-breaking spaces
  let normalized = input.replace(/[\s,\u00A0\u202F]/g, '');

  // Handle accounting notation: (1234) → -1234
  normalized = normalized.replace(/^\((.*)\)$/, '-$1');

  // Strip common currency and percentage symbols
  normalized = normalized.replace(/[%$€£¥₩₹₽¢]/g, '');

  if (/^[+-]?(?:\d+\.?\d*|\d*\.\d+)$/.test(normalized)) {
    const n = Number(normalized);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}
```

**Test cases**:
```typescript
parseNumericLike("$1,200.50")   // → 1200.5 ✅
parseNumericLike("12%")         // → 12 ✅
parseNumericLike("(1,234)")     // → -1234 ✅
parseNumericLike("€50")         // → 50 ✅
parseNumericLike("1 234.56")    // → 1234.56 ✅ (space-separated thousands)
parseNumericLike("£100")        // → 100 ✅
parseNumericLike("¥1000")       // → 1000 ✅
parseNumericLike("42")          // → 42 ✅ (still works)
parseNumericLike("text")        // → null ✅ (still rejects)
```

**Action Items**:
- [ ] Update `parseNumericLike` function
- [ ] Add test cases for all new formats
- [ ] Document supported formats
- [ ] Consider locale-specific decimal separators (optional)

**Files to modify**:
- `components/data-table/utilities.ts`


---

### 19. Fix Column Width Consistency (NEW)

**Files**: `components/data-table/data-table-header.tsx:80`, `components/data-table/data-table-cell.tsx`

**Current**: `column.width` only applied to `<th>`, not `<td>`.

**Problem**: Headers and cells can render at different widths.

**Example**:
```typescript
const columns = [
  { key: "id", label: "ID", width: "100px" }  // Header will be 100px
];
// But cells might render wider or narrower
```

**Solution Options**:

**Option A: Apply to both th and td**
```typescript
// data-table-cell.tsx
<td
  className={cn(/* ... */)}
  style={column.width ? { width: column.width } : undefined}
>
```

**Option B: Use `<colgroup>` (preferred)**
```typescript
// data-table.tsx
<table className="w-full border-collapse">
  <colgroup>
    {columns.map((col) => (
      <col
        key={col.key}
        style={col.width ? { width: col.width } : undefined}
      />
    ))}
    {actions && <col />}
  </colgroup>
  <DataTableHeader />
  <DataTableBody />
</table>
```

**Action Items**:
- [ ] Choose approach (colgroup recommended)
- [ ] Implement width consistency
- [ ] Test with various width values
- [ ] Document width prop behavior

**Files to modify**:
- `components/data-table/data-table.tsx` (if using colgroup)
- `components/data-table/data-table-cell.tsx` (if using style approach)


---

### 20. Simplify React.Children Pattern

**File**: `components/data-table/data-table.tsx:198-203`

**Current**: Overly complex React.Children usage.

**Problem**: Confusing code that doesn't do anything useful.

**Solution**: Replace with direct component usage.

**Action Items**:
- [ ] Replace React.Children pattern with `<DataTableContent />`
- [ ] Remove unnecessary React.createElement calls
- [ ] Verify no functionality breaks
- [ ] Document why this pattern existed (if there was a reason)

**Implementation**:
```typescript
// Replace:
{React.Children.toArray(
  React.Children.map(
    React.createElement(DataTableContent, null),
    (child) => child,
  ),
)}

// With:
<DataTableContent />
```

**Files to modify**:
- `components/data-table/data-table.tsx`


---

### 21. Add Column Configuration Validation

**Current**: No validation of column configurations at runtime.

**Problem**: Silent failures if columns are misconfigured.

**Action Items**:
- [ ] Add dev-mode validation for columns
- [ ] Warn if sortable column has no key
- [ ] Warn if format type doesn't match data type
- [ ] Warn if rowIdKey doesn't exist in data
- [ ] Add prop to disable validation in production

**Implementation**:
```typescript
function validateColumns<T>(columns: Column<T>[], data: T[]) {
  if (process.env.NODE_ENV !== 'development') return;

  columns.forEach(col => {
    // Check if key exists in data
    if (data.length > 0 && !(col.key in data[0])) {
      console.warn(`DataTable: Column key "${col.key}" not found in data`);
    }

    // Check format compatibility
    const value = data[0]?.[col.key];
    const format = col.format;

    if (format) {
      const valueType = typeof value;
      if (format.kind === 'currency' && valueType !== 'number') {
        console.warn(`DataTable: Column "${col.key}" has currency format but value is ${valueType}`);
      }
      // ... more checks
    }
  });
}
```

**Files to modify**:
- `components/data-table/data-table.tsx`


---

### 22. Extract Magic Numbers to Constants

**Files**: Multiple

**Current**: Hardcoded values throughout.

**Problem**: Hard to customize, unclear why values were chosen.

**Action Items**:
- [ ] Extract all magic numbers to named constants
- [ ] Group constants in a config file
- [ ] Document why each value was chosen
- [ ] Consider making constants customizable via props or theme

**Implementation**:
```typescript
// components/data-table/constants.ts
export const DATA_TABLE_CONSTANTS = {
  // Cell truncation
  MAX_CELL_WIDTH: 200,

  // Mobile card priorities
  DEFAULT_PRIMARY_COLUMN_COUNT: 2,

  // Array formatter
  DEFAULT_MAX_VISIBLE_ITEMS: 3,

  // Touch targets
  MIN_MOBILE_TOUCH_TARGET: 44,
  MIN_DESKTOP_TOUCH_TARGET: 36,

  // Skeleton loading
  SKELETON_ROW_COUNT: 5,
  SKELETON_CARD_COUNT: 3,
} as const;
```

**Files to create**:
- `components/data-table/constants.ts`

**Files to modify**:
- `components/data-table/data-table.tsx`
- `components/data-table/data-table-cell.tsx`
- `components/data-table/data-table-accordion-card.tsx`
- `components/data-table/formatters.tsx`


---

## 🔵 LOW PRIORITY

### 23. Fix getActionLabel Edge Case (NEW)

**File**: `components/data-table/utilities.ts:118-131`

**Current**: Returns "Delete for " (empty) when no identifier found.

**Problem**: Unhelpful aria-label for screen reader users.

**Current code**:
```typescript
export function getActionLabel(
  actionLabel: string,
  row: Record<string, string | number | boolean | null | string[]>,
  identifierKey?: string,
): string {
  const candidate =
    (identifierKey ? row[identifierKey] : undefined) ??
    (row as Record<string, unknown>).name ??
    (row as Record<string, unknown>).title ??
    (row as Record<string, unknown>).id;

  const identifier = String(candidate ?? "");
  return `${actionLabel} for ${identifier}`;  // ← "Delete for " if empty
}
```

**Solution**:
```typescript
export function getActionLabel(
  actionLabel: string,
  row: Record<string, string | number | boolean | null | string[]>,
  identifierKey?: string,
): string {
  const candidate =
    (identifierKey ? row[identifierKey] : undefined) ??
    (row as Record<string, unknown>).name ??
    (row as Record<string, unknown>).title ??
    (row as Record<string, unknown>).id;

  const identifier = String(candidate ?? "");
  return identifier
    ? `${actionLabel} for ${identifier}`
    : `${actionLabel} row`;  // ← Fallback to "Delete row"
}
```

**Action Items**:
- [ ] Add fallback for empty identifier
- [ ] Add test cases
- [ ] Document identifier resolution order

**Files to modify**:
- `components/data-table/utilities.ts`


---

### 24. Optimize TooltipProvider Placement (NEW)

**File**: `components/data-table/data-table-header.tsx:18`

**Current**: Wraps entire `<thead>` in TooltipProvider.

**Problem**: Minor performance issue - creates provider per table.

**Current code**:
```typescript
export function DataTableHeader() {
  return (
    <TooltipProvider delayDuration={300}>
      <thead className="bg-muted/50 sticky top-0 border-b">
        {/* ... */}
      </thead>
    </TooltipProvider>
  );
}
```

**Solution**: Move to app root or remove if already present.

**Action Items**:
- [ ] Check if TooltipProvider exists at app root
- [ ] Remove local provider if redundant
- [ ] Document that TooltipProvider is required at app level
- [ ] Add fallback if not present (optional)

**Files to modify**:
- `components/data-table/data-table-header.tsx`
- `app/layout.tsx` (to add provider if missing)


---

### 25. Add Server Component Support

**Current**: Everything is client-side (`"use client"`).

**Problem**: Can't use in React Server Components architecture.

**Action Items**:
- [ ] Identify which parts can be server-only (static rendering)
- [ ] Separate client and server logic
- [ ] Create RSC-compatible wrapper
- [ ] Document server vs client usage
- [ ] Add examples for both patterns

**Note**: This is complex and may not be necessary for initial release.


---

### 26. Add Customizable Breakpoints

**Current**: Hardcoded mobile/desktop breakpoint at 768px.

**Problem**: Doesn't match some design systems.

**Action Items**:
- [ ] Accept breakpoint prop
- [ ] Allow theme-based breakpoints
- [ ] Document custom breakpoint usage
- [ ] Maintain backward compatibility


---

### 27. Improve TypeScript Inference

**Current**: Some generic inference requires explicit type parameters.

**Problem**: Developer experience could be better.

**Action Items**:
- [ ] Improve generic inference for columns
- [ ] Reduce need for explicit type parameters
- [ ] Add utility types for common patterns
- [ ] Test with various TypeScript configurations


---

### 28. Add Performance Benchmarks

**Current**: No performance metrics.

**Action Items**:
- [ ] Set up benchmarking framework
- [ ] Benchmark with various data sizes (10, 100, 1000, 10000 rows)
- [ ] Compare with other table libraries
- [ ] Document performance characteristics
- [ ] Add CI performance regression testing


---

### 29. Accessibility Audit

**Current**: Good basics but not formally audited.

**Action Items**:
- [ ] Hire accessibility consultant or use automated tools
- [ ] Get WCAG 2.1 AA compliance certification
- [ ] Document accessibility features
- [ ] Add accessibility testing to CI
- [ ] Create accessibility statement


---

### 30. Create Live Examples Site

**Current**: Playground exists but not documented as examples.

**Action Items**:
- [ ] Create dedicated examples page
- [ ] Add "Copy Code" buttons
- [ ] Show common use cases
- [ ] Add interactive examples with Sandpack or similar
- [ ] Deploy to Vercel/Netlify


---

## Summary by Priority

### 🔴 Critical (Must complete before launch):
1. Fix sortable header accessibility (1-2h) **NEW**
2. Fix type safety violations (2-3h)
3. Implement proper Zod schemas (2-4h)
4. Add error boundaries (3-4h)
5. Implement action confirmation (3-4h)
6. Fix serialization docs (2-3h)
7. Document browser support (2-3h)

### 🟡 High (Complete within 1-2 sprints):
8. Fix numeric auto-alignment (15min) **NEW**
9. Add usage documentation (6-8h)
10. Fix sort state management (2-3h)
11. Add error handling to formatters (3-4h)
12. Improve formatter type safety (4-5h)
13. Document mobile behavior (2-3h)
14. Add bundle size info (2-3h)

### 🟢 Medium (Complete before v1.0):
15. Add testing (12-16h)
16. Optimize performance (8-10h)
17. Improve other accessibility issues (6-8h) *(sortable headers done in #1)*
18. Enhanced numeric parsing (1-2h) **NEW**
19. Fix column width consistency (1h) **NEW**
20. Simplify React.Children (0.5h)
21. Add column validation (3-4h)
22. Extract magic numbers (2-3h)

### 🔵 Low (Post-v1.0):
23. Fix getActionLabel edge case (15min) **NEW**
24. Optimize TooltipProvider (30min) **NEW**
25-30. Various enhancements

---

## Recommended Approach

### Week 1: Critical Issues
- Day 1 AM: Sortable header accessibility (#1) - 1-2h
- Day 1 PM: Type safety fixes (#2, #6) - 4-6h
- Days 2-3: Validation and error handling (#3, #4) - 6-8h
- Day 4: Action confirmation and browser support (#5, #7) - 5-7h
- Day 5: Buffer for testing and fixes

### Week 2: High Priority
- Day 1 AM: Quick bug fixes (#8 numeric align - 15min)
- Days 1-3 PM: Documentation (#9, #13)
- Days 4-5: Code quality (#10, #11, #12, #14)

### Week 3-4: Medium Priority
- Set up testing infrastructure
- Add core test coverage
- Performance optimization
- Accessibility improvements

### Week 5+: Polish and Low Priority
- Additional features
- Advanced optimization
- Community feedback integration

---

## Success Metrics

- [ ] All critical issues resolved (7 items)
- [ ] Sortable headers pass WCAG 2.1 Level A (screen reader + keyboard tested)
- [ ] Numbers auto-align correctly (with and without format)
- [ ] 80%+ test coverage
- [ ] No TypeScript errors with strict mode
- [ ] WCAG 2.1 AA compliant (beyond Level A basics)
- [ ] Documentation complete with examples
- [ ] Performance validated with 1000+ rows
- [ ] At least 3 external contributors testing

---

## Notes

- **Updated after second independent review** - incorporated 5 new issues
- Priorities may shift based on user feedback
- Some items can be parallelized
- Consider creating GitHub issues for each item
- Link PRs back to this roadmap for tracking

## Changes from Original Roadmap

**New items added** (from second review):
- #1: Sortable header accessibility (upgraded to CRITICAL)
- #8: Numeric auto-alignment bug fix (HIGH)
- #18: Enhanced numeric parsing (MEDIUM)
- #19: Column width consistency (MEDIUM)
- #23: getActionLabel edge case (LOW)
- #24: TooltipProvider optimization (LOW)

**Items renumbered**: All subsequent items shifted by new insertions

**Total effort updated**: ~235-310 hours (was ~220-290 hours)
