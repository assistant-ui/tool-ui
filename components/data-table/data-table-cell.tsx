"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { renderFormattedValue } from "./formatters";
import type { Column, DataTableRowData } from "./data-table";

interface DataTableCellProps {
  value: string | number | boolean | null | Date | string[];
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
  const isNumericKind = (() => {
    const k = column.format?.kind;
    return k === "number" || k === "currency" || k === "percent" || k === "delta";
  })();
  const align = column.align ?? (isNumericKind ? "right" : "left");
  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  }[align];

  const displayValue = renderFormattedValue(value, column, row);

  return (
    <td
      className={cn(
        "px-4 py-3 text-sm",
        alignClass,
        "max-w-[200px] truncate",
        className,
      )}
    >
      {displayValue}
    </td>
  );
}
