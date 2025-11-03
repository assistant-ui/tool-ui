// @assistant-ui/widgets v0.1.0 - data-table
// Last updated: 2025-10-31
// License: Apache-2.0

"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDataTable } from "./data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DataTableHeader() {
  const { columns, actions } = useDataTable();

  return (
    <TooltipProvider delayDuration={300}>
      <thead className="bg-muted/50 sticky top-0 border-b">
        <tr>
          {columns.map((column) => (
            <DataTableHead key={column.key} column={column} />
          ))}
          {actions && actions.length > 0 && (
            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
              Actions
            </th>
          )}
        </tr>
      </thead>
    </TooltipProvider>
  );
}

interface DataTableHeadProps {
  column: {
    key: string;
    label: string;
    abbr?: string;
    sortable?: boolean;
    align?: "left" | "right" | "center";
    width?: string;
  };
}

export function DataTableHead({ column }: DataTableHeadProps) {
  const { sortBy, sortDirection, onSort } = useDataTable();
  const isSortable = column.sortable !== false;
  const isSorted = sortBy === column.key;
  const direction = isSorted ? sortDirection : undefined;

  const handleClick = () => {
    if (isSortable && onSort) {
      onSort(column.key);
    }
  };

  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[column.align || "left"];

  // Determine display text (abbreviation or full label)
  const displayText = column.abbr || column.label;
  const shouldShowTooltip = column.abbr || displayText.length > 15;

  return (
    <th
      className={cn(
        "text-muted-foreground px-4 text-sm font-medium",
        "py-3 @md:py-3", // Larger touch target on mobile
        "max-w-[150px]", // Constrain width for truncation
        alignClass,
        isSortable &&
          "hover:text-foreground active:bg-muted/50 cursor-pointer select-none",
      )}
      style={column.width ? { width: column.width } : undefined}
      onClick={handleClick}
      aria-sort={
        isSorted
          ? direction === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <div
        className={cn(
          "inline-flex min-w-0 items-center gap-1", // min-w-0 allows flex child to shrink
          column.align === "right" && "flex-row-reverse",
          column.align === "center" && "justify-center",
        )}
      >
        {shouldShowTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">
                {column.abbr ? (
                  <abbr
                    title={column.label}
                    className="cursor-help border-b border-dotted border-current no-underline"
                  >
                    {column.abbr}
                  </abbr>
                ) : (
                  column.label
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{column.label}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="truncate">{column.label}</span>
        )}
        {isSortable && (
          <span className="shrink-0">
            {!isSorted && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
            {isSorted && direction === "asc" && (
              <ChevronUp className="h-4 w-4" />
            )}
            {isSorted && direction === "desc" && (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}
