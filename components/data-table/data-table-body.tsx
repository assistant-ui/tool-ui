"use client";

import * as React from "react";
import { useDataTable } from "./data-table";
import { DataTableRow } from "./data-table-row";

export function DataTableBody() {
  const { data, rowIdKey } = useDataTable();

  return (
    <tbody>
      {data.map((row, index) => {
        const keyVal = rowIdKey ? row[rowIdKey] : undefined;
        const rowKey = keyVal != null ? String(keyVal) : String(index);
        return <DataTableRow key={rowKey} row={row} index={index} />
      })}
    </tbody>
  );
}
