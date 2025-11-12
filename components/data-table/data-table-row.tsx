"use client";

import * as React from "react";
import { cn } from "./_cn";
import { useDataTable } from "./data-table";
import { DataTableCell } from "./data-table-cell";
import { DataTableActions } from "./data-table-actions";
import { TableRow, TableCell } from "./_ui";
import { DATA_TABLE_CELL_PADDING } from "./data-table-styles";
import type { DataTableRowData } from "./types";

interface DataTableRowProps {
  row: DataTableRowData;
  className?: string;
}

export function DataTableRow({ row, className }: DataTableRowProps) {
  const { columns, actions } = useDataTable();

  return (
    <TableRow className={className}>
      {columns.map((column, columnIndex) => (
        <DataTableCell
          key={column.key}
          value={row[column.key]}
          column={column}
          row={row}
          columnIndex={columnIndex}
        />
      ))}
      {actions && actions.length > 0 && (
        <TableCell className={cn(DATA_TABLE_CELL_PADDING, "text-right")}>
          <DataTableActions row={row} />
        </TableCell>
      )}
    </TableRow>
  );
}
