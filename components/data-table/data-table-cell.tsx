"use client";

import * as React from "react";
import { cn } from "./_cn";
import { renderFormattedValue } from "./formatters";
import type { Column, DataTableRowData } from "./data-table";
import { useDataTable } from "./data-table";
import { TableCell } from "./_ui";

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
  const displayValue = renderFormattedValue(value, column, row, { locale });
  const align =
    column.align ??
    (isNumericKind || isNumericValue ? "right" : "left");
  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : undefined;

  return (
    <TableCell className={cn(alignClass, className)}>
      {displayValue}
    </TableCell>
  );
}
