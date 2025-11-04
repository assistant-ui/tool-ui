"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sortData } from "./utilities";
import { useScrollShadow } from "./use-scroll-shadow";
import { useSupportsContainerQueries } from "./use-container-query";
import type { FormatConfig } from "./formatters";

export type RowPrimitive = string | number | boolean | null | string[];
export type DataTableRowData = Record<string, RowPrimitive>;
export type RowData = Record<string, unknown>;
export type ColumnKey<T extends object> = Extract<keyof T, string>;

type FormatFor<V> = V extends number
  ? Extract<FormatConfig, { kind: "number" | "currency" | "percent" | "delta" }>
  : V extends boolean
    ? Extract<FormatConfig, { kind: "boolean" | "status" | "badge" }>
    : V extends string[]
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
 * Props for the DataTable component.
 *
 * **Serializable props** (can come from LLM tool calls):
 * - `columns`, `data`, `actions` - Core table data
 * - `defaultSort` - Initial sort state
 * - `emptyMessage`, `maxHeight`, `messageId`, `rowIdKey` - Display/behavior config
 *
 * **React-only props** (must be provided by your React code):
 * - `onAction` - Event handler
 * - `className`, `isLoading` - Component state/styling
 *
 * @see {@link parseSerializableDataTable} for parsing LLM tool call results
 *
 * @example
 * ```tsx
 * // From LLM tool call
 * const { columns, data, actions } = parseSerializableDataTable(llmResult)
 *
 * // Add React-specific props
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   actions={actions}
 *   onAction={(id, row) => handleAction(id, row)}
 *   onSortChange={(next) => handleSort(next)}
 * />
 * ```
 */
export interface DataTableProps<T extends object = RowData> {
  /** Column definitions (serializable) */
  columns: Column<T>[];
  /** Row data (serializable - primitives only) */
  data: T[];
  /** Action button definitions (serializable) */
  actions?: Action[];
  /** Key in row data to use as unique identifier (serializable) */
  rowIdKey?: ColumnKey<T>;
  /** Uncontrolled initial sort */
  defaultSort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /** Controlled sort state (provide with onSortChange) */
  sort?: { by?: ColumnKey<T>; direction?: "asc" | "desc" };
  /** Empty state message (serializable) */
  emptyMessage?: string;
  /** Show loading skeleton (React-only) */
  isLoading?: boolean;
  /** Max table height with vertical scroll (serializable) */
  maxHeight?: string;
  /** Message identifier for context (serializable) */
  messageId?: string;
  /** Optional BCP47 locale used for formatting and sorting (e.g., 'en-US') */
  locale?: string;
  /** Action button click handler (React-only - function) */
  onAction?: (
    actionId: string,
    row: T,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  /** Sort change handler for controlled mode */
  onSortChange?: (next: { by?: ColumnKey<T>; direction?: "asc" | "desc" }) => void;
  /** Additional CSS classes (React-only) */
  className?: string;
}

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
  // Resolve locale: pass undefined to Intl to use environment default when not provided
  const resolvedLocale = locale;

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

  const handleSort = React.useCallback(
    (key: ColumnKey<T>) => {
      let newDirection: "asc" | "desc" | undefined;

      if (sortBy === key) {
        if (sortDirection === "asc") {
          newDirection = "desc";
        } else if (sortDirection === "desc") {
          newDirection = undefined;
        } else {
          newDirection = "asc";
        }
      } else {
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
  const scrollShadow = useScrollShadow(scrollContainerRef);
  const supportsContainerQueries = useSupportsContainerQueries();

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
      <div
        className={cn(
          "w-full",
          supportsContainerQueries && "@container",
          className,
        )}
      >
        <div
          className={cn(
            "hidden",
            supportsContainerQueries ? "@md:block" : "md:block",
          )}
        >
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

            {scrollShadow.canScrollLeft && (
              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-linear-to-r to-transparent" />
            )}
            {scrollShadow.canScrollRight && (
              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-linear-to-l to-transparent" />
            )}
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

        <div
          className={cn(
            "space-y-3",
            supportsContainerQueries ? "@md:hidden" : "md:hidden",
          )}
        >
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
        <div key={i} className="space-y-2 rounded-lg border p-4">
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
