"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useDataTable } from "./data-table";
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
  return <span aria-hidden>↕</span>;
}

export function DataTableHeader() {
  const { columns, actions } = useDataTable();

  return (
    <TooltipProvider delayDuration={300}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <DataTableHead key={column.key} column={column} />
          ))}
          {actions && actions.length > 0 && (
            <TableHead scope="col">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
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
  const alignClass =
    column.align === "right"
      ? "text-right"
      : column.align === "center"
        ? "text-center"
        : undefined;
  const buttonAlignClass = cn(
    "w-full min-w-0 gap-1 font-normal",
    column.align === "right" && "justify-end flex-row-reverse text-right",
    column.align === "center" && "justify-center",
    column.align !== "right" && "justify-start",
  );

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
        className={cn(buttonAlignClass, "gap-2")}
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
            <SortIcon state={direction} />
          </span>
        )}
      </Button>
    </TableHead>
  );
}
