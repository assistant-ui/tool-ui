"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useDataTable } from "./data-table";
import { DataTableCell } from "./data-table-cell";
import { DataTableActions } from "./data-table-actions";

interface DataTableRowProps {
  row: Record<string, string | number | boolean | null>;
  index: number;
  className?: string;
}

export function DataTableRow({ row, className }: DataTableRowProps) {
  const { columns, actions } = useDataTable();

  return (
    <tr className={cn("hover:bg-muted/50 border-b", className)}>
      {columns.map((column) => (
        <DataTableCell
          key={column.key}
          value={row[column.key]}
          align={column.align}
        />
      ))}
      {actions && actions.length > 0 && (
        <td className="px-4 py-3">
          <DataTableActions row={row} />
        </td>
      )}
    </tr>
  );
}
