"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sortData } from "./utilities";
import { useScrollShadow } from "./use-scroll-shadow";
import type { FormatConfig } from "./formatters";

export interface Column {
  key: string;
  label: string;
  abbr?: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
  priority?: "primary" | "secondary" | "tertiary";
  hideOnMobile?: boolean;
  format?: FormatConfig;
}

export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}

export type DataTableRowData = Record<
  string,
  string | number | boolean | null | Date | string[]
>;

export interface DataTableProps {
  columns: Column[];
  data: DataTableRowData[];
  actions?: Action[];
  rowIdKey?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  emptyMessage?: string;
  isLoading?: boolean;
  maxHeight?: string;
  messageId?: string;
  onAction?: (
    actionId: string,
    row: DataTableRowData,
    context?: {
      messageId?: string;
      sendMessage?: (message: string) => void;
    },
  ) => void;
  onSort?: (columnKey?: string, direction?: "asc" | "desc") => void;
  className?: string;
}

interface DataTableContextValue {
  columns: Column[];
  data: DataTableRowData[];
  actions?: Action[];
  rowIdKey?: string;
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
  data: rawData,
  actions,
  rowIdKey,
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
  const [internalSortBy, setInternalSortBy] = React.useState<
    string | undefined
  >(controlledSortBy);
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(controlledSortDirection);

  const sortBy = controlledSortBy ?? internalSortBy;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  const data = React.useMemo(() => {
    if (!sortBy || !sortDirection) return rawData;
    return sortData(rawData, sortBy, sortDirection);
  }, [rawData, sortBy, sortDirection]);

  const handleSort = React.useCallback(
    (key: string) => {
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

      if (onSort) {
        if (newDirection) {
          onSort(key, newDirection);
        } else {
          onSort(undefined, undefined);
        }
      } else {
        setInternalSortBy(newDirection ? key : undefined);
        setInternalSortDirection(newDirection);
      }
    },
    [sortBy, sortDirection, onSort],
  );

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const scrollShadow = useScrollShadow(scrollContainerRef);

  const contextValue: DataTableContextValue = {
    columns,
    data,
    actions,
    rowIdKey,
    sortBy,
    sortDirection,
    onSort: handleSort,
    onAction,
    messageId,
  };

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className={cn("@container w-full", className)}>
        <div className="hidden @md:block">
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className={cn(
                "relative w-full overflow-auto rounded-md border",
                "touch-pan-x",
                maxHeight && "max-h-[--max-height]",
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
            </div>

            {scrollShadow.canScrollLeft && (
              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-8 bg-linear-to-r to-transparent" />
            )}
            {scrollShadow.canScrollRight && (
              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-8 bg-linear-to-l to-transparent" />
            )}
          </div>
        </div>

        <div className="space-y-3 @md:hidden">
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
                <DataTableAccordionCard key={rowKey} row={row} index={i} />
              );
            })
          )}
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
