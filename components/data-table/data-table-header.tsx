"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useDataTable, type Column } from "./data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TableHeader,
  TableRow,
  TableHead,
  Button,
} from "./_ui";

function SortIcon({ state }: { state?: "asc" | "desc" }) {
  if (state === "asc") return <span aria-hidden>↑</span>;
  if (state === "desc") return <span aria-hidden>↓</span>;
  return (
    <span aria-hidden className="opacity-20">
      ⇅
    </span>
  );
}

export function DataTableHeader() {
  const { columns, actions } = useDataTable();

  return (
    <TooltipProvider delayDuration={300}>
      <TableHeader>
        <TableRow>
          {columns.map((column, columnIndex) => (
            <DataTableHead
              key={column.key}
              column={column}
              columnIndex={columnIndex}
            />
          ))}
          {actions && actions.length > 0 && (
            <TableHead scope="col" className="pr-6 text-right">
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
    </TooltipProvider>
  );
}

interface DataTableHeadProps {
  column: Column;
  columnIndex?: number;
}

export function DataTableHead({ column, columnIndex = 0 }: DataTableHeadProps) {
  const { sortBy, sortDirection, toggleSort, isLoading } = useDataTable();

  const isSortable = column.sortable !== false;

  const isSorted = sortBy === column.key;
  const direction = isSorted ? sortDirection : undefined;
  const isDisabled = isLoading || !isSortable;

  const handleClick = () => {
    if (!isDisabled && toggleSort) {
      toggleSort(column.key);
    }
  };

  const displayText = column.abbr || column.label;
  const shouldShowTooltip = column.abbr || displayText.length > 15;
  const k = (column?.format as { kind?: string } | undefined)?.kind;
  const isNumericKind =
    k === "number" || k === "currency" || k === "percent" || k === "delta";
  const align =
    column.align ??
    (columnIndex === 0 ? "left" : isNumericKind ? "right" : "left");
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : undefined;
  const buttonAlignClass = cn(
    "min-w-0 gap-1 font-normal",
    align === "right" && "text-right",
    align === "center" && "text-center",
    align === "left" && "text-left",
  );
  const labelAlignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  return (
    <TableHead
      scope="col"
      className={alignClass}
      style={column.width ? { width: column.width } : undefined}
      aria-sort={
        isSorted
          ? direction === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <Button
        type="button"
        size="sm"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (isDisabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        disabled={isDisabled}
        variant="ghost"
        className={cn(buttonAlignClass, "w-fit min-w-10")}
        aria-label={
          `Sort by ${column.label}` +
          (isSorted && direction
            ? ` (${direction === "asc" ? "ascending" : "descending"})`
            : "")
        }
        aria-disabled={isDisabled || undefined}
      >
        {shouldShowTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("truncate", labelAlignClass)}>
                {column.abbr ? (
                  <abbr
                    title={column.label}
                    className={cn(
                      "cursor-help border-b border-dotted border-current no-underline",
                      labelAlignClass,
                    )}
                  >
                    {column.abbr}
                  </abbr>
                ) : (
                  <span className={labelAlignClass}>{column.label}</span>
                )}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{column.label}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className={cn("truncate", labelAlignClass)}>
            {column.label}
          </span>
        )}
        {isSortable && (
          <span className="min-w-5 shrink-0">
            <SortIcon state={direction} />
          </span>
        )}
      </Button>
    </TableHead>
  );
}
