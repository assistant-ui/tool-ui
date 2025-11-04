"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sortData } from "./utilities";
import type { FormatConfig } from "./formatters";

/**
 * Default locale for all Intl formatting operations.
 *
 * Used as fallback when no locale prop is provided. This ensures consistent
 * behavior across server and client rendering, avoiding mismatches from
 * Node.js default locale (often 'en-US') vs browser locale (varies by user).
 *
 * @see {@link DataTableSerializableProps.locale}
 */
export const DEFAULT_LOCALE = "en-US" as const;

/**
 * JSON primitive type that can be serialized.
 */
type JsonPrimitive = string | number | boolean | null;

/**
 * Valid row value types for serializable DataTable data.
 *
 * Supports:
 * - Primitives: string, number, boolean, null
 * - Arrays of primitives: string[], number[], boolean[], or mixed primitive arrays
 *
 * For complex data (objects with href/label, etc.), use column format configs
 * instead of putting objects in row data.
 *
 * @example
 * ```ts
 * // ✅ Good: Use primitives and primitive arrays
 * const row = {
 *   name: "Widget",
 *   price: 29.99,
 *   tags: ["electronics", "featured"],
 *   metrics: [1.2, 3.4, 5.6]
 * }
 *
 * // ❌ Bad: Don't put objects in row data
 * const row = {
 *   link: { href: "/path", label: "Click" }  // Use format: { kind: 'link' } instead
 * }
 * ```
 */
export type RowPrimitive = JsonPrimitive | JsonPrimitive[];
export type DataTableRowData = Record<string, RowPrimitive>;
export type RowData = Record<string, unknown>;
export type ColumnKey<T extends object> = Extract<keyof T, string>;

type FormatFor<V> = V extends number
  ? Extract<FormatConfig, { kind: "number" | "currency" | "percent" | "delta" }>
  : V extends boolean
    ? Extract<FormatConfig, { kind: "boolean" | "status" | "badge" }>
    : V extends (string | number | boolean | null)[]
      ? Extract<FormatConfig, { kind: "array" }>
      : V extends string
        ? Extract<FormatConfig, { kind: "text" | "link" | "date" | "badge" | "status" }>
        : Extract<FormatConfig, { kind: "text" }>;

/**
 * Column definition for DataTable
 *
 * @remarks
 * **Important:** Columns are sortable by default (opt-out pattern).
 * Set `sortable: false` explicitly to disable sorting for specific columns.
 */
export interface Column<
  T extends object = RowData,
  K extends ColumnKey<T> = ColumnKey<T>,
> {
  /** Unique identifier that maps to a key in the row data */
  key: K;
  /** Display text for the column header */
  label: string;
  /** Abbreviated label for narrow viewports */
  abbr?: string;
  /** Whether column is sortable. Default: true (opt-out pattern) */
  sortable?: boolean;
  /** Text alignment for column cells */
  align?: "left" | "right" | "center";
  /** Optional fixed width (CSS value) */
  width?: string;
  /** Enable text truncation with ellipsis */
  truncate?: boolean;
  /** Mobile display priority (primary = always visible, secondary = expandable, tertiary = hidden) */
  priority?: "primary" | "secondary" | "tertiary";
  /** Completely hide column on mobile viewports */
  hideOnMobile?: boolean;
  /** Formatting configuration for cell values */
  format?: FormatFor<T[K]>;
}

export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}

/**
 * Serializable props that can come from LLM tool calls or be JSON-serialized.
 *
 * These props contain only primitive values, arrays, and plain objects -
 * no functions, class instances, or other non-serializable values.
 *
 * @example
 * ```tsx
 * const serializableProps: DataTableSerializableProps = {
 *   columns: [...],
 *   data: [...],
 *   actions: [...],
 *   rowIdKey: "id",
 *   defaultSort: { by: "price", direction: "desc" }
 * }
 * ```
 */
export interface DataTableSerializableProps<T extends object = RowData> {
  /** Column definitions */
  columns: Column<T>[];
  /** Row data (primitives only - no functions or class instances) */
  data: T[];
  /** Action button definitions */
  actions?: Action[];
  /**
   * Key in row data to use as unique identifier for React keys
   *
   * **Strongly recommended:** Always provide this for dynamic data to prevent
   * reconciliation issues (focus traps, animation glitches, incorrect state preservation)
   * when data reorders. Falls back to array index if omitted (only acceptable for static mock data).
   *
   * @example rowIdKey="id" or rowIdKey="uuid"
   */
  rowIdKey?: ColumnKey<T>;
  /**
   * Uncontrolled initial sort state (table manages its own sort state internally)
   *
   * **Sorting cycle:** Clicking column headers cycles through tri-state:
   * 1. none (unsorted) → 2. asc → 3. desc → 4. none (back to unsorted)
   *
   * @example
   * ```tsx
   * // Start with descending price sort
   * <DataTable defaultSort={{ by: "price", direction: "desc" }} />
   * ```
   */
  defaultSort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /**
   * Controlled sort state (use with onSortChange from client props)
   *
   * When provided, you must also provide `onSortChange` to handle sort updates.
   * The table will cycle through: none → asc → desc → none.
   *
   * @example
   * ```tsx
   * const [sort, setSort] = useState({ by: "price", direction: "desc" })
   * <DataTable sort={sort} onSortChange={setSort} />
   * ```
   */
  sort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /** Empty state message */
  emptyMessage?: string;
  /** Max table height with vertical scroll (CSS value) */
  maxHeight?: string;
  /** Message identifier for context (used with assistant-ui) */
  messageId?: string;
  /**
   * BCP47 locale for formatting and sorting (e.g., 'en-US', 'de-DE', 'ja-JP')
   *
   * Defaults to 'en-US' to ensure consistent server/client rendering.
   * Pass explicit locale for internationalization.
   *
   * @example
   * ```tsx
   * <DataTable locale="de-DE" /> // German formatting
   * <DataTable locale="ja-JP" /> // Japanese formatting
   * <DataTable />               // Uses 'en-US' default
   * ```
   */
  locale?: string;
}

/**
 * Client-side React-only props that cannot be serialized.
 *
 * These props contain functions, component state, or other React-specific values
 * that must be provided by your React code (not from LLM tool calls).
 *
 * @example
 * ```tsx
 * const clientProps: DataTableClientProps = {
 *   isLoading: false,
 *   className: "my-table",
 *   onAction: (id, row) => console.log(id, row),
 *   onSortChange: (next) => setSort(next)
 * }
 * ```
 */
export interface DataTableClientProps<T extends object = RowData> {
  /** Show loading skeleton */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Action button click handler (required if actions are provided) */
  onAction?: (
    actionId: string,
    row: T,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  /**
   * Sort change handler for controlled mode (required if sort is provided)
   *
   * **Tri-state cycle behavior:**
   * - Click unsorted column: `{ by: "column", direction: "asc" }`
   * - Click asc column: `{ by: "column", direction: "desc" }`
   * - Click desc column: `{ by: undefined, direction: undefined }` (returns to unsorted)
   * - Click different column: `{ by: "newColumn", direction: "asc" }`
   *
   * @example
   * ```tsx
   * const [sort, setSort] = useState<{ by?: string; direction?: "asc" | "desc" }>({})
   *
   * <DataTable
   *   sort={sort}
   *   onSortChange={(next) => {
   *     console.log("Sort changed:", next)
   *     setSort(next)
   *   }}
   * />
   * ```
   */
  onSortChange?: (next: { by?: ColumnKey<T>; direction?: "asc" | "desc" }) => void;
}

/**
 * Complete props for the DataTable component.
 *
 * Combines serializable props (can come from LLM tool calls) with client-side
 * React-only props. This separation makes the boundary explicit and prevents
 * accidental serialization of non-serializable values.
 *
 * @see {@link DataTableSerializableProps} for props that can be JSON-serialized
 * @see {@link DataTableClientProps} for React-only props
 * @see {@link parseSerializableDataTable} for parsing LLM tool call results
 *
 * @example
 * ```tsx
 * // From LLM tool call
 * const serializableProps = parseSerializableDataTable(llmResult)
 *
 * // Combine with React-specific props
 * <DataTable
 *   {...serializableProps}
 *   onAction={(id, row) => handleAction(id, row)}
 *   onSortChange={setSort}
 *   isLoading={loading}
 * />
 * ```
 */
export interface DataTableProps<T extends object = RowData>
  extends DataTableSerializableProps<T>,
    DataTableClientProps<T> {}

interface DataTableContextValue<T extends object = RowData> {
  columns: Column<T>[];
  data: T[];
  actions?: Action[];
  rowIdKey?: ColumnKey<T>;
  sortBy?: ColumnKey<T>;
  sortDirection?: "asc" | "desc";
  toggleSort?: (key: ColumnKey<T>) => void;
  onAction?: DataTableProps<T>["onAction"];
  messageId?: string;
  isLoading?: boolean;
  locale?: string;
}

const DataTableContext = React.createContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DataTableContextValue<any> | undefined
>(undefined);

export function useDataTable<T extends object = RowData>() {
  const context = React.useContext(DataTableContext) as
    | DataTableContextValue<T>
    | undefined;
  if (!context) {
    throw new Error("useDataTable must be used within a DataTable");
  }
  return context;
}

export function DataTable<T extends object = RowData>({
  columns,
  data: rawData,
  actions,
  rowIdKey,
  defaultSort,
  sort: controlledSort,
  emptyMessage = "No data available",
  isLoading = false,
  maxHeight,
  messageId,
  onAction,
  onSortChange,
  className,
  locale,
}: DataTableProps<T>) {
  /**
   * Resolved locale with explicit default.
   *
   * We always use a defined locale (never undefined) to ensure consistent
   * behavior across server and client rendering. Without this, SSR would use
   * Node.js locale (often en-US) while client hydration uses browser locale,
   * causing mismatches.
   */
  const resolvedLocale = locale ?? DEFAULT_LOCALE;

  // Internal uncontrolled sort state (seed from defaultSort or legacy props)
  const [internalSortBy, setInternalSortBy] = React.useState<
    ColumnKey<T> | undefined
  >(defaultSort?.by);
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(defaultSort?.direction);

  // Effective sort is controlled when `sort` is provided
  const sortBy = controlledSort?.by ?? internalSortBy;
  const sortDirection = controlledSort?.direction ?? internalSortDirection;

  const data = React.useMemo(() => {
    if (!sortBy || !sortDirection) return rawData;
    return sortData(rawData, sortBy, sortDirection, resolvedLocale);
  }, [rawData, sortBy, sortDirection, resolvedLocale]);

  /**
   * Tri-state sorting cycle implementation
   *
   * Cycle behavior:
   * - none (unsorted) → asc → desc → none
   * - Clicking different column resets to asc
   *
   * This allows users to return to original data order, which is important
   * for exploring data by insertion/chronological order.
   */
  const handleSort = React.useCallback(
    (key: ColumnKey<T>) => {
      let newDirection: "asc" | "desc" | undefined;

      if (sortBy === key) {
        // Same column: cycle through asc → desc → none
        if (sortDirection === "asc") {
          newDirection = "desc";
        } else if (sortDirection === "desc") {
          newDirection = undefined; // Return to unsorted
        } else {
          newDirection = "asc";
        }
      } else {
        // Different column: start with ascending
        newDirection = "asc";
      }

      const next = {
        by: newDirection ? key : undefined,
        direction: newDirection,
      } as const;

      if (controlledSort) {
        onSortChange?.(next);
      } else {
        setInternalSortBy(next.by);
        setInternalSortDirection(next.direction);
      }
    },
    [sortBy, sortDirection, controlledSort, onSortChange],
  );

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const contextValue: DataTableContextValue<T> = {
    columns,
    data,
    actions,
    rowIdKey,
    sortBy,
    sortDirection,
    toggleSort: handleSort,
    onAction,
    messageId,
    isLoading,
    locale: resolvedLocale,
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={cn("w-full @container", className)}>
        <div className={cn("hidden @md:block")}> 
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className={cn(
                "relative w-full overflow-auto rounded-md border",
                "touch-pan-x",
                maxHeight && "max-h-[--max-height]",
              )}
              style={{
                WebkitOverflowScrolling: "touch",
                ...(maxHeight
                  ? ({ "--max-height": maxHeight } as React.CSSProperties)
                  : {}),
              }}
            >
              <DataTableErrorBoundary>
                <table
                  className="w-full border-collapse"
                  aria-busy={isLoading || undefined}
                >
                  {columns.length > 0 && (
                    <colgroup>
                      {columns.map((col) => (
                        <col
                          key={String(col.key)}
                          style={col.width ? { width: col.width } : undefined}
                        />
                      ))}
                      {actions && actions.length > 0 && <col />}
                    </colgroup>
                  )}
                  {isLoading ? (
                    <DataTableSkeleton />
                  ) : data.length === 0 ? (
                    <DataTableEmpty message={emptyMessage} />
                  ) : (
                    <>
                      {React.Children.toArray(
                        React.Children.map(
                          React.createElement(DataTableContent, null),
                          (child) => child,
                        ),
                      )}
                    </>
                  )}
                </table>
              </DataTableErrorBoundary>
            </div>
          </div>
          {/* Live region for sort announcements */}
          {(() => {
            const col = columns.find((c) => c.key === sortBy);
            const label = col?.label ?? (typeof sortBy === "string" ? sortBy : "");
            const msg =
              sortBy && sortDirection
                ? `Sorted by ${label}, ${sortDirection === "asc" ? "ascending" : "descending"}`
                : "";
            return (
              <div className="sr-only" aria-live="polite">{msg}</div>
            );
          })()}
        </div>

        {/* Mobile card view - uses list semantics for accessibility */}
        <div
          className={cn("flex flex-col gap-3 @md:hidden")}
          role="list"
          aria-label="Data table (mobile card view)"
          aria-describedby="mobile-table-description"
        >
          {/* Screen reader description */}
          <div id="mobile-table-description" className="sr-only">
            Table data shown as expandable cards. Each card represents one row.
            {columns.length > 0 && ` Columns: ${columns.map((c) => c.label).join(", ")}.`}
          </div>

          <DataTableErrorBoundary>
            {isLoading ? (
              <DataTableSkeletonCards />
            ) : data.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                {emptyMessage}
              </div>
            ) : (
              data.map((row, i) => {
                const keyVal = rowIdKey ? row[rowIdKey] : undefined;
                const rowKey = keyVal != null ? String(keyVal) : String(i);
                return (
                  <DataTableAccordionCard
                    key={rowKey}
                    row={row as unknown as DataTableRowData}
                    index={i}
                  />
                );
              })
            )}
          </DataTableErrorBoundary>
        </div>
      </div>
    </DataTableContext.Provider>
  );
}

function DataTableContent() {
  return (
    <>
      <DataTableHeader />
      <DataTableBody />
    </>
  );
}

function DataTableEmpty({ message }: { message: string }) {
  const { columns, actions } = useDataTable();

  return (
    <>
      <DataTableHeader />
      <tbody>
        <tr>
          <td
            colSpan={columns.length + (actions ? 1 : 0)}
            className="text-muted-foreground px-4 py-8 text-center"
            role="status"
            aria-live="polite"
          >
            {message}
          </td>
        </tr>
      </tbody>
    </>
  );
}

function DataTableSkeleton() {
  const { columns, actions } = useDataTable();

  return (
    <>
      <DataTableHeader />
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="border-b">
            {columns.map((_, j) => (
              <td key={j} className="px-4 py-3">
                <div className="bg-muted/50 h-4 animate-pulse rounded" />
              </td>
            ))}
            {actions && (
              <td className="px-4 py-3">
                <div className="bg-muted/50 h-8 w-20 animate-pulse rounded" />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </>
  );
}

function DataTableSkeletonCards() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="bg-muted/50 h-5 w-1/2 animate-pulse rounded" />
          <div className="bg-muted/50 h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted/50 h-4 w-2/3 animate-pulse rounded" />
        </div>
      ))}
    </>
  );
}

import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { DataTableAccordionCard } from "./data-table-accordion-card";
import { DataTableErrorBoundary } from "./error-boundary";
