// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sortData } from "./utilities";
import { useScrollShadow } from "./use-scroll-shadow";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
  priority?: "primary" | "secondary" | "tertiary"; // For mobile responsive display
  hideOnMobile?: boolean; // Simple override to hide column on mobile
}

export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}

export interface DataTableProps {
  // Column definitions
  columns: Column[];

  // Row data
  rows: Array<Record<string, string | number | boolean | null>>;

  // Optional actions per row
  actions?: Action[];

  // Optional configuration
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  isLoading?: boolean;
  maxHeight?: string;

  // Assistant-UI integration (future)
  messageId?: string;

  // Event handlers
  onAction?: (
    actionId: string,
    row: Record<string, any>,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  onSort?: (columnKey: string, direction: "asc" | "desc") => void;

  // Styling
  className?: string;
}

interface DataTableContextValue {
  columns: Column[];
  rows: Array<Record<string, any>>;
  actions?: Action[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  onAction?: DataTableProps["onAction"];
  messageId?: string;
}

const DataTableContext = React.createContext<DataTableContextValue | undefined>(
  undefined,
);

export function useDataTable() {
  const context = React.useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTable must be used within a DataTable");
  }
  return context;
}

export function DataTable({
  columns,
  rows: rawRows,
  actions,
  sortBy: controlledSortBy,
  sortDirection: controlledSortDirection,
  emptyMessage = "No data available",
  isLoading = false,
  maxHeight,
  messageId,
  onAction,
  onSort,
  className,
}: DataTableProps) {
  // Internal sort state (uncontrolled)
  const [internalSortBy, setInternalSortBy] = React.useState<
    string | undefined
  >(controlledSortBy);
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(controlledSortDirection);

  // Use controlled or uncontrolled sort
  const sortBy = controlledSortBy ?? internalSortBy;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  // Sort data
  const rows = React.useMemo(() => {
    if (!sortBy || !sortDirection) return rawRows;
    return sortData(rawRows, sortBy, sortDirection);
  }, [rawRows, sortBy, sortDirection]);

  // Handle sort
  const handleSort = React.useCallback(
    (key: string) => {
      let newDirection: "asc" | "desc" | undefined;

      if (sortBy === key) {
        // Cycle: asc -> desc -> none
        if (sortDirection === "asc") {
          newDirection = "desc";
        } else if (sortDirection === "desc") {
          newDirection = undefined;
        } else {
          newDirection = "asc";
        }
      } else {
        // New column, start with asc
        newDirection = "asc";
      }

      if (onSort && newDirection) {
        onSort(key, newDirection);
      } else {
        setInternalSortBy(newDirection ? key : undefined);
        setInternalSortDirection(newDirection);
      }
    },
    [sortBy, sortDirection, onSort],
  );

  // Scroll shadow detection for desktop table
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollShadow = useScrollShadow(scrollContainerRef);

  const contextValue: DataTableContextValue = {
    columns,
    rows,
    actions,
    sortBy,
    sortDirection,
    onSort: handleSort,
    onAction,
    messageId,
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={cn("w-full @container", className)}>
        {/* Desktop: Table layout */}
        <div className="hidden @md:block">
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className={cn(
                "relative w-full overflow-auto rounded-md border",
                "touch-pan-x", // Enable momentum scrolling on mobile
                maxHeight && "max-h-[var(--max-height)]",
              )}
              style={
                maxHeight
                  ? ({ "--max-height": maxHeight } as React.CSSProperties)
                  : undefined
              }
            >
              <table className="w-full border-collapse">
                {isLoading ? (
                  <DataTableSkeleton />
                ) : rows.length === 0 ? (
                  <DataTableEmpty message={emptyMessage} />
                ) : (
                  <>
                    {/* Header and body will be rendered by compound components */}
                    {React.Children.toArray(
                      React.Children.map(
                        React.createElement(DataTableContent, null),
                        (child) => child,
                      ),
                    )}
                  </>
                )}
              </table>
            </div>

            {/* Scroll shadow affordances */}
            {scrollShadow.canScrollLeft && (
              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-gradient-to-r to-transparent" />
            )}
            {scrollShadow.canScrollRight && (
              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l to-transparent" />
            )}
          </div>
        </div>

        {/* Mobile: Accordion card layout */}
        <div className="space-y-3 @md:hidden">
          {isLoading ? (
            <DataTableSkeletonCards />
          ) : rows.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              {emptyMessage}
            </div>
          ) : (
            rows.map((row, i) => (
              <DataTableAccordionCard key={i} row={row} index={i} />
            ))
          )}
        </div>
      </div>
    </DataTableContext.Provider>
  );
}

// Default table content when using simple API
function DataTableContent() {
  return (
    <>
      <DataTableHeader />
      <DataTableBody />
    </>
  );
}

// Empty state component
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
          >
            {message}
          </td>
        </tr>
      </tbody>
    </>
  );
}

// Loading skeleton for table
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

// Loading skeleton for cards
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

// Import compound components (defined in separate files)
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { DataTableAccordionCard } from "./data-table-accordion-card";
