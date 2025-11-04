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
            <th
              scope="col"
              className="text-muted-foreground px-4 py-3 text-left font-normal"
            >
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
  const { sortBy, sortDirection, toggleSort, isLoading } = useDataTable();

  // Opt-out pattern: columns are sortable by default unless explicitly set to false
  // This means: undefined → sortable, true → sortable, false → not sortable
  const isSortable = column.sortable !== false;

  const isSorted = sortBy === column.key;
  const direction = isSorted ? sortDirection : undefined;
  const isDisabled = isLoading || !isSortable;

  const handleClick = () => {
    if (!isDisabled && toggleSort) {
      toggleSort(column.key);
    }
  };

  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[column.align || "left"];

  const displayText = column.abbr || column.label;
  const shouldShowTooltip = column.abbr || displayText.length > 15;

  return (
    <th
      scope="col"
      className={cn(
        "font-normal",
        "text-muted-foreground px-4",
        "py-3 @md:py-3",
        "max-w-[150px]",
        alignClass,
      )}
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
          !isDisabled &&
            "hover:text-foreground active:bg-muted/50 cursor-pointer select-none",
          isDisabled && "cursor-not-allowed opacity-60",
          column.align === "right" && "flex-row-reverse",
          column.align === "center" && "justify-center",
        )}
        aria-label={
          `Sort by ${column.label}` +
          (isSorted && direction ? ` (${direction === "asc" ? "ascending" : "descending"})` : "")
        }
        aria-disabled={isDisabled || undefined}
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
      </button>
    </th>
  );
}
