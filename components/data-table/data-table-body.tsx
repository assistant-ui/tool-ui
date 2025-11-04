"use client";

import * as React from "react";
import { useDataTable, type DataTableRowData } from "./data-table";
import { DataTableRow } from "./data-table-row";
import { TableBody } from "./_ui";

export function DataTableBody() {
  const { data, rowIdKey } = useDataTable<DataTableRowData>();

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !rowIdKey && data.length > 0) {
      console.warn(
        "[DataTable] Missing `rowIdKey` prop. Using array index as React key can cause reconciliation issues when data reorders (focus traps, animation glitches, incorrect state preservation). " +
        "Strongly recommended: Pass a `rowIdKey` prop that points to a unique identifier in your row data (e.g., 'id', 'uuid', 'symbol').\n" +
        "Example: <DataTable rowIdKey=\"id\" columns={...} data={...} />"
      );
    }
  }, [rowIdKey, data.length]);

  return (
    <TableBody>
      {data.map((row, index) => {
        const keyVal = rowIdKey ? row[rowIdKey] : undefined;
        const rowKey = keyVal != null ? String(keyVal) : String(index);
        return <DataTableRow key={rowKey} row={row} />
      })}
    </TableBody>
  );
}
