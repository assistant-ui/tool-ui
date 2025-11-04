"use client";

import * as React from "react";
import { cn } from "./_cn";
import { renderFormattedValue } from "./formatters";
import type { Column, DataTableRowData } from "./data-table";
import { useDataTable } from "./data-table";

interface DataTableCellProps {
  value: string | number | boolean | null | (string | number | boolean | null)[];
  column: Column;
  row: DataTableRowData;
  className?: string;
}

export function DataTableCell({
  value,
  column,
  row,
  className,
}: DataTableCellProps) {
  const { locale } = useDataTable();
  const k = (column?.format as { kind?: string } | undefined)?.kind;
  const isNumericKind =
    k === "number" || k === "currency" || k === "percent" || k === "delta";
  const isNumericValue = typeof value === "number";
  const align = column.align ?? (isNumericKind || isNumericValue ? "right" : "left");
  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[align];

  const displayValue = renderFormattedValue(value, column, row, { locale });

  return (
    <td
      className={cn(
        "px-4 py-3",
        alignClass,
        column.truncate && "max-w-[200px] truncate",
        className,
      )}
    >
      {displayValue}
    </td>
  );
}
