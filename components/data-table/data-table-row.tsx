"use client";

import * as React from "react";
import { useDataTable, type DataTableRowData } from "./data-table";
import { DataTableCell } from "./data-table-cell";
import { DataTableActions } from "./data-table-actions";
import { TableRow, TableCell } from "./_ui";

interface DataTableRowProps {
  row: DataTableRowData;
  className?: string;
}

export function DataTableRow({ row, className }: DataTableRowProps) {
  const { columns, actions } = useDataTable();

  return (
    <TableRow className={className}>
      {columns.map((column) => (
        <DataTableCell
          key={column.key}
          value={row[column.key]}
          column={column}
          row={row}
        />
      ))}
      {actions && actions.length > 0 && (
        <TableCell>
          <DataTableActions row={row} />
        </TableCell>
      )}
    </TableRow>
  );
}
